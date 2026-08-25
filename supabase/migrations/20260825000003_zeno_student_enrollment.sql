-- Atomically create a student and enroll them in the active school year/class.
-- Apply only to the dedicated Zeno Supabase project.

create or replace function public.zeno_create_student_with_enrollment(
  p_school_id uuid,
  p_first_name text,
  p_last_name text,
  p_class_name text,
  p_matricule text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (student_id uuid, enrollment_id uuid, academic_year_id uuid, class_id uuid)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_year_id uuid;
  v_class_id uuid;
  v_student_id uuid;
  v_enrollment_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;
  if p_school_id is null or not private.zeno_has_school_access(p_school_id) then
    raise exception 'school_access_denied';
  end if;
  if nullif(trim(coalesce(p_first_name, '')), '') is null
     or nullif(trim(coalesce(p_last_name, '')), '') is null then
    raise exception 'student_name_required';
  end if;
  if nullif(trim(coalesce(p_class_name, '')), '') is null then
    raise exception 'class_name_required';
  end if;

  select s.current_academic_year_id
    into v_year_id
    from public.zeno_schools s
   where s.id = p_school_id;

  if v_year_id is null then
    raise exception 'active_academic_year_required';
  end if;

  select c.id
    into v_class_id
    from public.zeno_classes c
   where c.school_id = p_school_id
     and c.academic_year_id = v_year_id
     and c.active = true
     and lower(trim(c.name)) = lower(trim(p_class_name))
   limit 1;

  if v_class_id is null then
    raise exception 'class_not_found';
  end if;

  insert into public.zeno_students (school_id, first_name, last_name, matricule, metadata)
  values (p_school_id, trim(p_first_name), trim(p_last_name), nullif(trim(p_matricule), ''), coalesce(p_metadata, '{}'::jsonb))
  returning id into v_student_id;

  insert into public.zeno_enrollments (school_id, student_id, academic_year_id, class_id)
  values (p_school_id, v_student_id, v_year_id, v_class_id)
  returning id into v_enrollment_id;

  return query select v_student_id, v_enrollment_id, v_year_id, v_class_id;
end;
$$;

revoke all on function public.zeno_create_student_with_enrollment(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.zeno_create_student_with_enrollment(uuid, text, text, text, text, jsonb) to authenticated;
