create table if not exists public.pulse_timetable (
  id uuid primary key default gen_random_uuid(),
  day_of_week text not null check (day_of_week in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  period_type text not null default 'class' check (period_type in ('class','study','break','other')),
  title text not null check (length(trim(title)) between 1 and 80),
  start_time time not null,
  end_time time not null,
  room text not null default '' check (length(room) <= 50),
  note text not null default '' check (length(note) <= 140),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pulse_timetable_valid_time check (end_time > start_time)
);

create index if not exists pulse_timetable_day_time_idx on public.pulse_timetable (day_of_week, start_time);
create index if not exists pulse_timetable_updated_by_idx on public.pulse_timetable (updated_by);

alter table public.pulse_timetable enable row level security;

revoke all on table public.pulse_timetable from anon, public, authenticated;
grant select, insert, update, delete on table public.pulse_timetable to authenticated;
grant all on table public.pulse_timetable to service_role;

create policy "Students and teachers can view timetable"
  on public.pulse_timetable for select to authenticated
  using (
    public.is_auraway_teacher()
    or exists (select 1 from public.students s where s.auth_user_id = (select auth.uid()))
  );

create policy "Only teachers can add timetable periods"
  on public.pulse_timetable for insert to authenticated
  with check (public.is_auraway_teacher() and updated_by = (select auth.uid()));

create policy "Only teachers can edit timetable periods"
  on public.pulse_timetable for update to authenticated
  using (public.is_auraway_teacher())
  with check (public.is_auraway_teacher() and updated_by = (select auth.uid()));

create policy "Only teachers can delete timetable periods"
  on public.pulse_timetable for delete to authenticated
  using (public.is_auraway_teacher());