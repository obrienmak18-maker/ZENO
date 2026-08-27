import type { ImportSummary, PaymentStatus, StudentStatus, UserRole } from './index';

export type SchoolLevel = 'MATERNELLE' | 'PRIMAIRE' | 'EDUCATION_BASE' | 'HUMANITES' | 'TECHNIQUE' | 'PROFESSIONNELLE';
export type EnrollmentDecision = 'PROMOTION' | 'REDOUBLEMENT' | 'TRANSFERT' | 'RADIATION' | 'AUTRE';
export type Capability = 'students.read' | 'students.write' | 'attendance.read' | 'attendance.write' | 'grades.read' | 'grades.write' | 'bulletins.read' | 'bulletins.write' | 'payments.read' | 'payments.write' | 'documents.read' | 'documents.write' | 'messages.use' | 'planning.read' | 'planning.write';

export interface SchoolStructure { levels: SchoolLevel[]; customLevels: string[]; sections: { id: string; nom: string; description?: string }[]; options: { id: string; sectionId: string; nom: string }[]; }
export interface Enrollment { id: string; schoolId: string; eleveId: string; anneeScolaireId: string; classeId: string; statut: StudentStatus | 'EN_ATTENTE'; decision?: EnrollmentDecision; createdAt: string; updatedAt: string; }
export interface TransitionProposal { id: string; schoolId: string; fromYearId: string; toYearId: string; eleveId: string; fromClasseId: string; toClasseId?: string; decision: EnrollmentDecision; confirmed: boolean; }
export interface Assignment { id: string; schoolId: string; profileId: string; classeIds: string[]; matiereIds: string[]; creneauIds: string[]; anneeScolaireId: string; titulaire: boolean; active: boolean; }
export interface CustomRole { id: string; schoolId: string; nom: string; description?: string; capabilities: Capability[]; active: boolean; }
export interface DocumentRecord { id: string; schoolId: string; ownerType: 'ECOLE' | 'ELEVE' | 'CLASSE' | 'ANNEE'; ownerId: string; anneeScolaireId?: string; name: string; contentType: string; storagePath: string; size: number; uploadedBy: string; createdAt: string; }
export interface LicensePlan { id: string; name: string; maxStudents: number; maxStaff: number; maxStorageBytes: number; modules: string[]; priceCents: number; active: boolean; }
export interface SchoolLicense { id: string; schoolId: string; planId: string; startsAt: string; expiresAt: string; status: 'ACTIVE' | 'EXPIRED' | 'PAUSED' | 'PENDING_RENEWAL'; }
export interface MessageRecord { id: string; schoolId: string; expediteurId: string; destinataireId: string; contenu: string; lu: boolean; createdAt: string; }
export interface TeacherAbsence { id: string; schoolId: string; profileId: string; date: string; timetableEntryIds: string[]; reason?: string; status: 'DECLAREE' | 'VALIDEE' | 'REMPLACEE'; }
export interface MobileMoneyTransaction { id: string; schoolId: string; eleveId: string; factureId?: string; amount: number; provider: string; reference: string; status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'UNMATCHED' | 'REFUNDED' | 'DUPLICATE'; createdAt: string; confirmedAt?: string; }
export interface ActionNotification { id: string; schoolId: string; recipientId: string; kind: 'APPEL' | 'DOSSIER' | 'ABSENCE' | 'PAIEMENT' | 'MESSAGE'; title: string; body: string; targetView: string; read: boolean; createdAt: string; }

export function hasCapability(role: UserRole | CustomRole, capability: Capability, customRoles: CustomRole[] = []) {
  if (typeof role !== 'string') return role.capabilities.includes(capability);
  if (role === 'ADMINISTRATEUR') return true;
  return customRoles.some((item) => item.nom === role && item.active && item.capabilities.includes(capability));
}

export function canAccessAssignment(assignment: Pick<Assignment, 'active' | 'classeIds' | 'matiereIds' | 'anneeScolaireId'>, classeId: string, matiereId: string, anneeScolaireId: string) {
  return assignment.active && assignment.anneeScolaireId === anneeScolaireId && assignment.classeIds.includes(classeId) && assignment.matiereIds.includes(matiereId);
}

export function summarizeImportRows(rows: Array<Record<string, unknown>>): ImportSummary {
  let incomplete = 0; let duplicates = 0; const seen = new Set<string>();
  for (const row of rows) { const key = String(row.codeUnique ?? row.code ?? `${row.nom ?? ''}|${row.prenom ?? ''}`).trim().toLowerCase(); if (!String(row.nom ?? row.name ?? '').trim()) incomplete += 1; if (key && seen.has(key)) duplicates += 1; seen.add(key); }
  return { detected: rows.length, ready: Math.max(0, rows.length - incomplete - duplicates), incomplete, duplicates };
}

export function paymentStatus(total: number, paid: number, exempt = false): PaymentStatus { if (exempt) return 'EXONERE'; if (paid <= 0) return 'NORMAL'; if (paid < total) return 'ECHELONNE'; return 'NORMAL'; }
