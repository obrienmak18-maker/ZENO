-- Zeno security hardening
-- Move privileged helpers to a non-exposed schema and keep only an authenticated RPC wrapper public.

create schema if not exists private;

-- Remove policies that depend on the old public helper before moving it.
drop policy if exists zeno_schools_member_select on public.zeno_schools;
drop policy if exists zeno_years_member_access on public.zeno_academic_years;
drop policy if exists zeno_memberships_member_access on public.zeno_school_memberships;
drop policy if exists zeno_roles_member_access on public.zeno_roles;
drop policy if exists zeno_levels_member_access on public.zeno_levels;
drop policy if exists zeno_classes_member_access on public.zeno_classes;
drop policy if exists zeno_subjects_member_access on public.zeno_subjects;
drop policy if exists zeno_enrollments_member_access on public.zeno_enrollments;
drop policy if exists zeno_assignments_member_access on public.zeno_teacher_assignments;
drop policy if exists zeno_timetable_member_access on public.zeno_timetable_entries;
drop policy if exists zeno_attendance_sessions_member_access on public.zeno_attendance_sessions;
drop policy if exists zeno_attendance_records_member_access on public.zeno_attendance_records;
drop policy if exists zeno_grade_periods_member_access on public.zeno_grade_periods;
drop policy if exists zeno_grades_member_access on public.zeno_grades;
drop policy if exists zeno_fee_definitions_member_access on public.zeno_fee_definitions;
drop policy if exists zeno_invoices_member_access on public.zeno_invoices;
drop policy if exists zeno_payments_member_access on public.zeno_payments;
drop policy if exists zeno_activity_member_access on public.zeno_activity_log;

alter function public.zeno_has_school_access(uuid) set schema private;
alter function public.zeno_bootstrap_school(text, text, text, text, text, text, text, text) set schema private;

alter function private.zeno_has_school_access(uuid) security definer set search_path = public, pg_temp;
revoke all on function private.zeno_has_school_access(uuid) from public;
grant execute on function private.zeno_has_school_access(uuid) to authenticated;

alter function private.zeno_bootstrap_school(text, text, text, text, text, text, text, text) security definer set search_path = public, pg_temp;
revoke all on function private.zeno_bootstrap_school(text, text, text, text, text, text, text, text) from public;
grant execute on function private.zeno_bootstrap_school(text, text, text, text, text, text, text, text) to authenticated;

-- The RPC remains in the exposed public schema but is SECURITY INVOKER.
create or replace function public.zeno_bootstrap_school(
  school_name text,
  establishment_form text default 'École',
  management_status text default 'Privé agréé',
  province_name text default null,
  city_name text default null,
  school_address text default null,
  school_phone text default null,
  academic_year_label text default '2026–2027'
)
returns table (school_id uuid, academic_year_id uuid)
language sql
security invoker
set search_path = public
as $$
  select * from private.zeno_bootstrap_school($1, $2, $3, $4, $5, $6, $7, $8);
$$;

revoke all on function public.zeno_bootstrap_school(text, text, text, text, text, text, text, text) from public;
grant execute on function public.zeno_bootstrap_school(text, text, text, text, text, text, text, text) to authenticated;

create policy zeno_schools_member_select on public.zeno_schools
  for select using (private.zeno_has_school_access(id) or owner_id = auth.uid());
create policy zeno_years_member_access on public.zeno_academic_years
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_memberships_member_access on public.zeno_school_memberships
  for select using (private.zeno_has_school_access(school_id) or user_id = auth.uid());
create policy zeno_roles_member_access on public.zeno_roles
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_levels_member_access on public.zeno_levels
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_classes_member_access on public.zeno_classes
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_subjects_member_access on public.zeno_subjects
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_enrollments_member_access on public.zeno_enrollments
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_assignments_member_access on public.zeno_teacher_assignments
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_timetable_member_access on public.zeno_timetable_entries
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_attendance_sessions_member_access on public.zeno_attendance_sessions
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_attendance_records_member_access on public.zeno_attendance_records
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_grade_periods_member_access on public.zeno_grade_periods
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_grades_member_access on public.zeno_grades
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_fee_definitions_member_access on public.zeno_fee_definitions
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_invoices_member_access on public.zeno_invoices
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_payments_member_access on public.zeno_payments
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
create policy zeno_activity_member_access on public.zeno_activity_log
  for all using (private.zeno_has_school_access(school_id)) with check (private.zeno_has_school_access(school_id));
