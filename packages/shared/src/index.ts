export type UserRole = 'ADMINISTRATEUR' | 'PROFESSEUR' | 'COMPTABLE' | 'SECRETAIRE' | 'SURVEILLANT' | 'RESPONSABLE_PEDAGOGIQUE';
export type StudentStatus = 'ACTIF' | 'ABANDON' | 'TRANSFERE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'RETARD' | 'EXCUSE';
export type PaymentStatus = 'NORMAL' | 'ECHELONNE' | 'EXONERE' | 'BOURSIER';
export type QrStatus = 'pending' | 'used' | 'revoked' | 'expired';

export interface School { id: string; name: string; logo?: string | null; address?: string; telephone?: string; anneeScolaireActive?: string; active: boolean; }
export interface Profile { uid: string; email: string; telephone?: string; nom: string; postnom?: string | null; prenom?: string | null; role: UserRole; school_id: string; photoUrl?: string | null; actif: boolean; }
export interface ClassRoom { id: string; nom: string; niveau: string; groupe: string; sectionId?: string | null; anneeScolaireId: string; titulaireId?: string | null; capacite: number; }
export interface Student { id: string; codeUnique: string; nom: string; postnom?: string; prenom?: string; dateNaissance?: string; lieuNaissance?: string; commune?: string; sexe: 'M' | 'F'; classeId: string; photoUrl?: string | null; statut: StudentStatus; schoolId: string; }
export interface Grade { id: string; eleveId: string; matiereId: string; trimestreId: string; note: number; coefficient: number; appreciation?: string | null; saisiParId: string; estValide: boolean; }
export interface Payment { id: string; eleveId: string; montantPaye: number; montantTotal: number; motif: 'INSCRIPTION' | 'MENSUALITE' | 'EXAMEN' | 'AUTRE'; statutPaiement: PaymentStatus; recu?: string; referenceTransaction?: string | null; datePaiement: string; enregistreParId: string; }
export interface Attendance { id: string; eleveId: string; classeId: string; date: string; statut: AttendanceStatus; creneauId: string; matiereId: string; enregistreParId: string; }
export interface TimetableEntry { id: string; jour: string; heureDebut: string; heureFin: string; numeroHeure: number; matiereId: string; classeId: string; professeurId: string; salle?: string; }
export interface QrToken { id: string; profileId: string; schoolId: string; role: 'PROFESSEUR' | 'COMPTABLE'; statut: QrStatus; createdAt: string; expiresAt: string; usedAt?: string | null; usedFromDevice?: string | null; revokedBy?: string | null; revokedAt?: string | null; }
export interface Bulletin { id: string; eleveId: string; classeId: string; trimestreId: string; moyenneGenerale: number; rang: number; mention: Mention; pourcentage: number; total: number; estBloque: boolean; forceImpression: boolean; fichierPdf?: string | null; }
export type Mention = 'ECHEC' | 'PASSABLE' | 'SATISFACTION' | 'DISTINCTION' | 'GRANDE_DISTINCTION';
export interface SchoolAssignment { profileId: string; schoolId: string; classeIds: string[]; matiereIds: string[]; anneeScolaireId: string; titulaire: boolean; }
export interface ImportSummary { detected: number; ready: number; incomplete: number; duplicates: number; }

export function calculerMoyenne(notes: Pick<Grade, 'note' | 'coefficient'>[]): number { const total = notes.reduce((sum, note) => sum + note.note * note.coefficient, 0); const coefficients = notes.reduce((sum, note) => sum + note.coefficient, 0); return coefficients ? Math.round((total / coefficients) * 100) / 100 : 0; }
export function calculerRang(moyenne: number, toutesLesMoyennes: number[]): number { return 1 + toutesLesMoyennes.filter((value) => value > moyenne).length; }
export function determinerMention(moyenne: number): Mention { if (moyenne >= 80) return 'GRANDE_DISTINCTION'; if (moyenne >= 70) return 'DISTINCTION'; if (moyenne >= 60) return 'SATISFACTION'; if (moyenne >= 50) return 'PASSABLE'; return 'ECHEC'; }
export function isActiveQr(token: Pick<QrToken, 'statut' | 'expiresAt'>, now = Date.now()): boolean { return token.statut === 'pending' && new Date(token.expiresAt).getTime() > now; }
export function canAccessRole(role: UserRole, capability: string): boolean { const map: Record<UserRole, string[]> = { ADMINISTRATEUR: ['*'], PROFESSEUR: ['students.read', 'attendance.write', 'grades.write', 'messages.use'], COMPTABLE: ['students.read', 'payments.read', 'payments.write', 'messages.use'], SECRETAIRE: ['students.read', 'students.write', 'documents.write', 'messages.use'], SURVEILLANT: ['students.read', 'attendance.write', 'messages.use'], RESPONSABLE_PEDAGOGIQUE: ['students.read', 'grades.read', 'grades.write', 'messages.use'] }; return map[role]?.includes('*') || map[role]?.includes(capability) || false; }

export * from './validators';

export * from './domain';
