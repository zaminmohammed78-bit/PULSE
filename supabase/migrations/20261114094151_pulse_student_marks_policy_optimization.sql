drop policy if exists "Teachers manage student marks" on public.student_marks;
drop policy if exists "Students read their own marks" on public.student_marks;

create policy "Students and teachers read permitted marks"
  on public.student_marks
  for select
  to authenticated
  using (
    (select public.is_auraway_teacher())
    or exists (
      select 1
      from public.students s
      where s.id = student_marks.student_id
        and s.auth_user_id = (select auth.uid())
    )
  );

create policy "Teachers insert student marks"
  on public.student_marks
  for insert
  to authenticated
  with check ((select public.is_auraway_teacher()));

create policy "Teachers update student marks"
  on public.student_marks
  for update
  to authenticated
  using ((select public.is_auraway_teacher()))
  with check ((select public.is_auraway_teacher()));

create policy "Teachers delete student marks"
  on public.student_marks
  for delete
  to authenticated
  using ((select public.is_auraway_teacher()));
