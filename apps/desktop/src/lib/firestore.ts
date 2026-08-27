import { collection, doc, onSnapshot, serverTimestamp, setDoc, writeBatch, type Firestore, type Unsubscribe } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export async function resolveSchoolId(user: User): Promise<string> {
  const claims = (await user.getIdTokenResult()).claims;
  const configured = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_FIREBASE_SCHOOL_ID;
  const schoolId = String(claims.school_id ?? configured ?? '');
  if (!schoolId) throw new Error('Le compte Firebase ne possède pas de school_id.');
  return schoolId;
}

export function subscribeCollection<T extends Record<string, unknown>>(db: Firestore, schoolId: string, collectionName: string, onData: (records: T[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return onSnapshot(collection(db, 'ecoles', schoolId, collectionName), (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as unknown as T)), (error) => onError?.(error));
}

export async function writeSchoolDocument(db: Firestore, schoolId: string, collectionName: string, id: string, data: Record<string, unknown>) {
  await setDoc(doc(db, 'ecoles', schoolId, collectionName, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function writeStudent(db: Firestore, schoolId: string, student: Record<string, unknown>) {
  const id = String(student.id ?? student.code ?? crypto.randomUUID());
  await writeSchoolDocument(db, schoolId, 'eleves', id, { ...student, codeUnique: student.codeUnique ?? student.code, nom: student.nom ?? student.name, classeId: student.classeId ?? student.className, school_id: schoolId });
}

export async function writePayment(db: Firestore, schoolId: string, payment: Record<string, unknown>) {
  const id = String(payment.id ?? crypto.randomUUID());
  await writeSchoolDocument(db, schoolId, 'paiements', id, { ...payment, studentId: payment.studentId ?? payment.eleveId, amount: payment.amount ?? payment.montantPaye, school_id: schoolId });
}

export async function writeGrade(db: Firestore, schoolId: string, grade: Record<string, unknown>) {
  const id = String(grade.id ?? crypto.randomUUID());
  await writeSchoolDocument(db, schoolId, 'notes', id, { ...grade, school_id: schoolId });
}

export async function writeAttendanceBatch(db: Firestore, schoolId: string, records: Record<string, Record<string, unknown>>, dateKey: string) {
  const batch = writeBatch(db);
  Object.entries(records).forEach(([studentId, record]) => {
    const id = String(record.id ?? `${record.creneauId ?? 'slot'}_${dateKey}_${studentId}`);
    batch.set(doc(db, 'ecoles', schoolId, 'presences', id), { ...record, studentId, dateKey, school_id: schoolId, updatedAt: serverTimestamp() }, { merge: true });
  });
  await batch.commit();
}

export async function writeMessage(db: Firestore, schoolId: string, message: Record<string, unknown>) {
  const id = String(message.id ?? crypto.randomUUID());
  await writeSchoolDocument(db, schoolId, 'messages', id, { ...message, id, school_id: schoolId, lu: false });
}

export async function writeAssignment(db: Firestore, schoolId: string, assignment: Record<string, unknown>) {
  const id = String(assignment.id ?? assignment.profileId ?? crypto.randomUUID());
  await writeSchoolDocument(db, schoolId, 'affectations', id, { ...assignment, id, school_id: schoolId, active: assignment.active !== false });
}

export async function writeEnrollment(db: Firestore, schoolId: string, enrollment: Record<string, unknown>) {
  const id = String(enrollment.id ?? `${enrollment.eleveId ?? enrollment.studentId}_${enrollment.anneeScolaireId ?? enrollment.yearId}`);
  await writeSchoolDocument(db, schoolId, 'inscriptions', id, { ...enrollment, id, school_id: schoolId });
}

export async function writeDocumentMetadata(db: Firestore, schoolId: string, document: Record<string, unknown>) {
  const id = String(document.id ?? crypto.randomUUID());
  await writeSchoolDocument(db, schoolId, 'documents', id, { ...document, id, school_id: schoolId });
}

export async function writeSchoolConfig(db: Firestore, schoolId: string, config: Record<string, unknown>) {
  await writeSchoolDocument(db, schoolId, 'config', 'active', { ...config, school_id: schoolId });
}
