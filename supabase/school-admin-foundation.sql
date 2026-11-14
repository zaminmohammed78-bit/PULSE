-- AURAWAY: single-school pilot security foundation
-- This migration creates school identity and membership tables only.
-- It deliberately does NOT change the existing students, assignments,
-- student_updates, or attendance_records tables. Those need a reviewed
-- school_id migration before real school data is used.

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  status text not null default 'pilot' check (status in ('pilot', 'active', 'suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.school_memberships (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('school_admin', 'teacher', 'student', 'parent')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (school_id, user_id)
);

create index if not exists school_memberships_user_active_idx
  on public.school_memberships (user_id, is_active);
create index if not exists school_memberships_school_role_idx
  on public.school_memberships (school_id, role, is_active);

alter table public.schools enable row level security;
alter table public.school_memberships enable row level security;

-- SECURITY DEFINER avoids recursive RLS checks when policies inspect memberships.
-- These functions only return booleans and expose no membership data.
create or replace function public.is_active_school_member(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.school_memberships sm
    where sm.school_id = target_school_id
      and sm.user_id = (select auth.uid())
      and sm.is_active = true
  );
$$;

create or replace function public.is_active_school_admin(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.school_memberships sm
    where sm.school_id = target_school_id
      and sm.user_id = (select auth.uid())
      and sm.role = 'school_admin'
      and sm.is_active = true
  );
$$;

revoke all on function public.is_active_school_member(uuid) from public;
revoke all on function public.is_active_school_admin(uuid) from public;
grant execute on function public.is_active_school_member(uuid) to authenticated;
grant execute on function public.is_active_school_admin(uuid) to authenticated;

drop policy if exists "Members can view their school" on public.schools;
create policy "Members can view their school"
on public.schools
for select
to authenticated
using (public.is_active_school_member(id));

drop policy if exists "School admins can update their school profile" on public.schools;
create policy "School admins can update their school profile"
on public.schools
for update
to authenticated
using (public.is_active_school_admin(id))
with check (public.is_active_school_admin(id));

drop policy if exists "Users and school admins can view memberships" on public.school_memberships;
create policy "Users and school admins can view memberships"
on public.school_memberships
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_active_school_admin(school_id)
);

-- Intentionally no client INSERT, UPDATE, or DELETE policies on
-- school_memberships. Account invitations, role changes, and deactivation
-- must be performed by a trusted server-side admin workflow, never by
-- trusting a role value sent from the browser.

comment on table public.schools is
  'AURAWAY school tenants. School creation is a trusted administrative operation.';
comment on table public.school_memberships is
  'Maps authenticated Supabase users to one school and one role. Membership writes are server-only.';
