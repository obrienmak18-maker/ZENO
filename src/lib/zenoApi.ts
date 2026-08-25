import { supabase } from './supabase';

export type SchoolBootstrapInput = {
  name: string;
  establishmentType: string;
  managementStatus: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  academicYear: string;
};

export async function bootstrapSchool(input: SchoolBootstrapInput) {
  if (!supabase) return { data: null, error: new Error('Supabase non configuré') };
  return supabase.rpc('zeno_bootstrap_school', {
    school_name: input.name,
    establishment_form: input.establishmentType,
    management_status: input.managementStatus,
    province_name: input.province,
    city_name: input.city,
    school_address: input.address,
    school_phone: input.phone,
    academic_year_label: input.academicYear,
  });
}

export async function fetchMySchool() {
  if (!supabase) return { data: null, error: new Error('Supabase non configuré') };
  return supabase.from('zeno_school_memberships').select('school_id,role_key,zeno_schools(id,name,province,city,address,contact_phone,current_academic_year_id)').eq('active', true).limit(1).maybeSingle();
}

export async function fetchSchoolStudents(schoolId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase non configuré') };
  return supabase.from('zeno_students').select('id,first_name,last_name,status,metadata').eq('school_id', schoolId).order('last_name').limit(500);
}

export async function createSchoolStudent(input: { schoolId: string; firstName: string; lastName: string; className: string; matricule?: string; metadata?: Record<string, unknown> }) {
  if (!supabase) return { data: null, error: new Error('Supabase non configuré') };
  return supabase.rpc('zeno_create_student_with_enrollment', {
    p_school_id: input.schoolId,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_class_name: input.className,
    p_matricule: input.matricule ?? null,
    p_metadata: input.metadata ?? {},
  });
}

export async function writeActivity(input: { schoolId: string; action: string; entityType: string; entityId?: string; metadata?: Record<string, unknown> }) {
  if (!supabase) return { data: null, error: new Error('Supabase non configuré') };
  return supabase.from('zeno_activity_log').insert({ school_id: input.schoolId, action: input.action, entity_type: input.entityType, entity_id: input.entityId ?? null, metadata: input.metadata ?? {} });
}
