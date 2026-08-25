-- Zeno bootstrap helpers
-- Apply only to the dedicated Zeno Supabase project.

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
language plpgsql
security definer
set search_path = public
as $$
declare
  new_school_id uuid;
  new_year_id uuid;
  new_level_id uuid;
  new_class_a_id uuid;
  new_class_b_id uuid;
  subject_math_id uuid;
  subject_french_id uuid;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;
  if nullif(trim(school_name), '') is null then
    raise exception 'school_name_required';
  end if;

  insert into public.zeno_schools (owner_id, name, establishment_form, management_status, province, city, address, contact_phone)
  values (current_user_id, trim(school_name), coalesce(nullif(trim(establishment_form), ''), 'École'), coalesce(nullif(trim(management_status), ''), 'Privé agréé'), province_name, city_name, school_address, school_phone)
  returning id into new_school_id;

  insert into public.zeno_academic_years (school_id, label, status)
  values (new_school_id, coalesce(nullif(trim(academic_year_label), ''), '2026–2027'), 'active')
  returning id into new_year_id;

  update public.zeno_schools set current_academic_year_id = new_year_id where id = new_school_id;

  insert into public.zeno_levels (school_id, name, category, metadata)
  values (new_school_id, 'Primaire', 'primary', '{"suggested_range":"1ère à 6ème primaire"}'::jsonb)
  returning id into new_level_id;

  insert into public.zeno_subjects (school_id, name, category)
  values (new_school_id, 'Mathématiques', 'core') returning id into subject_math_id;
  insert into public.zeno_subjects (school_id, name, category)
  values (new_school_id, 'Français', 'core') returning id into subject_french_id;

  insert into public.zeno_classes (school_id, academic_year_id, level_id, name, section)
  values (new_school_id, new_year_id, new_level_id, '6ème primaire A', 'A') returning id into new_class_a_id;
  insert into public.zeno_classes (school_id, academic_year_id, level_id, name, section)
  values (new_school_id, new_year_id, new_level_id, '6ème primaire B', 'B') returning id into new_class_b_id;

  insert into public.zeno_grade_periods (school_id, academic_year_id, label, status)
  values (new_school_id, new_year_id, '1er trimestre', 'open');

  insert into public.zeno_school_memberships (school_id, user_id, role_key)
  values (new_school_id, current_user_id, 'directeur');

  insert into public.zeno_roles (school_id, role_key, label, permissions)
  values
    (new_school_id, 'directeur', 'Directeur', '{"students":true,"staff":true,"grades":true,"finance":true,"settings":true}'::jsonb),
    (new_school_id, 'enseignant', 'Enseignant', '{"students":true,"attendance":true,"grades":true,"timetable":true}'::jsonb),
    (new_school_id, 'secretaire', 'Secrétaire', '{"students":true,"staff":true,"attendance":true,"administration":true}'::jsonb),
    (new_school_id, 'comptable', 'Comptable', '{"finance":true,"reports":true}'::jsonb);

  insert into public.zeno_activity_log (school_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (new_school_id, current_user_id, 'school.created', 'school', new_school_id, jsonb_build_object('source', 'onboarding'));

  return query select new_school_id, new_year_id;
end;
$$;

revoke all on function public.zeno_bootstrap_school(text, text, text, text, text, text, text, text) from public;
grant execute on function public.zeno_bootstrap_school(text, text, text, text, text, text, text, text) to authenticated;

create policy zeno_schools_owner_insert on public.zeno_schools
  for insert with check (owner_id = auth.uid());

