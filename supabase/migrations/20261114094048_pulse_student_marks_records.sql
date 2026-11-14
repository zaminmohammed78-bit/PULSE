create table public.student_marks (
  id uuid primary key default gen_random_uuid(),
  student_id bigint not null references public.students(id) on delete cascade,
  exam_name text not null check (length(trim(exam_name)) between 1 and 120),
  subject text not null check (length(trim(subject)) between 1 and 80),
  marks_obtained numeric(7,2) not null check (marks_obtained >= 0),
  marks_total numeric(7,2) not null check (marks_total > 0 and marks_obtained <= marks_total),
  assessed_on date not null default current_date,
  teacher_note text check (teacher_note is null or length(teacher_note) <= 500),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create index student_marks_student_date_idx
  on public.student_marks (student_id, assessed_on desc, created_at desc);

alter table public.student_marks enable row level security;

grant select, insert, update, delete on public.student_marks to authenticated;

create policy "Teachers manage student marks"
  on public.student_marks
  for all
  to authenticated
  using ((select public.is_auraway_teacher()))
  with check ((select public.is_auraway_teacher()));

create policy "Students read their own marks"
  on public.student_marks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = student_marks.student_id
        and s.auth_user_id = (select auth.uid())
    )
  );
