import type { AttendanceStatus, Grade, Payment, Profile, SchoolAssignment, Student, UserRole } from './index';

export function assertSchoolScope(value: { schoolId?: string; school_id?: string }, schoolId: string): void {
  const actual = value.schoolId ?? value.school_id;
  if (!actual || actual !== schoolId) throw new Error('Document hors périmètre de l’établissement.');
}

export function isUserRole(value: unknown): value is UserRole {
  return ['ADMINISTRATEUR', 'PROFESSEUR', 'COMPTABLE', 'SECRETAIRE', 'SURVEILLANT', 'RESPONSABLE_PEDAGOGIQUE'].includes(String(value));
}

export function validateStudent(student: Student, schoolId: string): string[] {
  const errors: string[] = [];
  if (!student.id || !student.codeUnique) errors.push('Identifiant élève manquant.');
  if (!student.nom.trim()) errors.push('Nom élève manquant.');
  if (!student.classeId) errors.push('Classe manquante.');
  if (!['M', 'F'].includes(student.sexe)) errors.push('Sexe invalide.');
  try { assertSchoolScope(student, schoolId); } catch (error) { errors.push((error as Error).message); }
  return errors;
}

export function validateGrade(grade: Grade): string[] {
  const errors: string[] = [];
  if (!grade.eleveId || !grade.matiereId || !grade.trimestreId) errors.push('Références note incomplètes.');
  if (!Number.isFinite(grade.note) || grade.note < 0 || grade.note > 100) errors.push('La note doit être comprise entre 0 et 100.');
  if (!Number.isFinite(grade.coefficient) || grade.coefficient <= 0) errors.push('Le coefficient doit être positif.');
  return errors;
}

export function validatePayment(payment: Payment): string[] {
  const errors: string[] = [];
  if (!payment.eleveId) errors.push('Élève du paiement manquant.');
  if (!Number.isFinite(payment.montantPaye) || payment.montantPaye <= 0) errors.push('Montant payé invalide.');
  if (payment.montantPaye > payment.montantTotal) errors.push('Le montant payé dépasse le montant total.');
  return errors;
}

export function validateAssignment(assignment: SchoolAssignment): string[] {
  const errors: string[] = [];
  if (!assignment.profileId || !assignment.schoolId || !assignment.anneeScolaireId) errors.push('Affectation incomplète.');
  if (assignment.classeIds.length === 0 && assignment.matiereIds.length === 0) errors.push('Une affectation doit contenir une classe ou une matière.');
  return errors;
}

export function isAttendanceStatus(value: unknown): value is AttendanceStatus {
  return ['PRESENT', 'ABSENT', 'RETARD', 'EXCUSE'].includes(String(value));
}

export function normalizeCsvHeader(header: string): string {
  return header.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function stableId(prefix: string, seed: string): string {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619);
  return `${prefix}_${(hash >>> 0).toString(16)}`;
}

export function nowIso(): string { return new Date().toISOString(); }
