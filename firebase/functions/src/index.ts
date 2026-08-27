import { randomUUID } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { onDocumentCreated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';

if (!getApps().length) initializeApp();
setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const db = getFirestore();
const adminRoles = new Set(['ADMINISTRATEUR', 'directeur', 'admin']);
const supportedRoles = new Set(['ADMINISTRATEUR', 'DIRECTEUR', 'PROFESSEUR', 'SECRETAIRE', 'COMPTABLE']);
const staffRoles = new Set(['ADMINISTRATEUR', 'DIRECTEUR', 'PROFESSEUR', 'SECRETAIRE', 'COMPTABLE', 'directeur', 'professeur', 'secretaire', 'comptable', 'admin']);
type Data = Record<string, unknown>;
type AuthContext = { uid: string; role: string; schoolId: string };

function requireAuth(request: CallableRequest<Data>): AuthContext {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Une session Firebase est requise.');
  const schoolId = String(request.auth.token.school_id ?? '');
  if (!schoolId) throw new HttpsError('failed-precondition', 'Le compte ne possède pas de school_id.');
  return { uid: request.auth.uid, role: String(request.auth.token.role ?? ''), schoolId };
}

function requireAdmin(request: CallableRequest<Data>) {
  const auth = requireAuth(request);
  if (!adminRoles.has(auth.role) && auth.role !== 'DIRECTEUR') throw new HttpsError('permission-denied', 'Cette opération est réservée à un administrateur.');
  return auth;
}

function requireStaff(request: CallableRequest<Data>) {
  const auth = requireAuth(request);
  if (!staffRoles.has(auth.role)) throw new HttpsError('permission-denied', 'Rôle non autorisé.');
  return auth;
}

function schoolPath(schoolId: string, collection: string, id?: string) {
  return id ? `ecoles/${schoolId}/${collection}/${id}` : `ecoles/${schoolId}/${collection}`;
}

async function audit(auth: AuthContext, action: string, resource: string, resourceId: string, details: Data = {}) {
  await db.collection(schoolPath(auth.schoolId, 'audit_logs')).add({ school_id: auth.schoolId, actorId: auth.uid, action, resource, resourceId, details, createdAt: FieldValue.serverTimestamp() });
}

function stringValue(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) throw new HttpsError('invalid-argument', `Le champ ${field} est requis.`);
  return value.trim();
}

async function consumeQr(schoolId: string, tokenId: string, uid: string) {
  const ref = db.doc(schoolPath(schoolId, 'qr_tokens', tokenId));
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new HttpsError('not-found', 'QR Code introuvable.');
    const data = snapshot.data() ?? {};
    if (data.school_id !== schoolId || data.status !== 'pending' || Number(data.expiresAt) <= Date.now()) throw new HttpsError('permission-denied', 'QR Code expiré ou déjà utilisé.');
    transaction.update(ref, { status: 'used', usedAt: FieldValue.serverTimestamp(), usedBy: uid });
    return data;
  });
}

export const setUserRole = onCall(async (request) => {
  const auth = requireAdmin(request);
  const { schoolId } = auth;
  const uid = stringValue(request.data?.uid, 'uid');
  const role = stringValue(request.data?.role, 'role').toUpperCase();
  const requestedSchoolId = stringValue(request.data?.schoolId, 'schoolId');
  if (requestedSchoolId !== schoolId) throw new HttpsError('permission-denied', 'École non autorisée.');
  if (!supportedRoles.has(role)) throw new HttpsError('invalid-argument', 'Rôle non reconnu.');
  await getAuth().setCustomUserClaims(uid, { role, school_id: schoolId });
  await db.doc(`ecoles/${schoolId}/profiles/${uid}`).set({ uid, role, school_id: schoolId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await audit(auth, 'set_user_role', 'profile', uid, { role });
  return { ok: true, uid, role, schoolId };
});

export const createQrToken = onCall(async (request) => {
  const auth = requireAdmin(request);
  const { schoolId } = auth;
  const profileId = stringValue(request.data?.profileId, 'profileId');
  const profileName = stringValue(request.data?.profileName, 'profileName');
  const role = stringValue(request.data?.role, 'role');
  const tokenId = randomUUID();
  const expiresAt = Date.now() + 15 * 60 * 1000;
  if (!supportedRoles.has(role)) throw new HttpsError('invalid-argument', 'Rôle non reconnu.');
  await db.doc(`ecoles/${schoolId}/qr_tokens/${tokenId}`).set({ tokenId, school_id: schoolId, profileId, profileName, role, status: 'pending', createdAt: FieldValue.serverTimestamp(), expiresAt, createdBy: auth.uid });
  await audit(auth, 'create_qr_token', 'qr_token', tokenId, { profileId, role });
  return { tokenId, schoolId, expiresAt };
});

export const consumeQrToken = onCall(async (request) => {
  const tokenId = stringValue(request.data?.tokenId, 'tokenId');
  const schoolId = stringValue(request.data?.schoolId, 'schoolId');
  const token = await consumeQr(schoolId, tokenId, request.auth?.uid ?? 'qr-client');
  return { ok: true, profileId: token.profileId, role: token.role, schoolId };
});

export const generateQRAuthToken = onCall(async (request) => {
  const tokenId = stringValue(request.data?.tokenId, 'tokenId');
  const schoolId = stringValue(request.data?.schoolId, 'schoolId');
  const token = await consumeQr(schoolId, tokenId, request.auth?.uid ?? 'qr-client');
  const uid = stringValue(token.profileId, 'profileId');
  try { await getAuth().getUser(uid); } catch { throw new HttpsError('not-found', 'Le profil associé au QR Code n’existe pas.'); }
  const customToken = await getAuth().createCustomToken(uid, { role: String(token.role), school_id: schoolId });
  return { ok: true, customToken, schoolId, uid, role: token.role };
});

export const bootstrapSchool = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Une session Firebase est requise.');
  const bootstrapKey = stringValue(request.data?.bootstrapKey, 'bootstrapKey');
  const configuredKey = String(process.env.BOOTSTRAP_KEY ?? '');
  if (!configuredKey || bootstrapKey !== configuredKey) throw new HttpsError('permission-denied', 'Clé d’amorçage invalide.');
  const schoolId = stringValue(request.data?.schoolId, 'schoolId');
  const name = stringValue(request.data?.name, 'name');
  const schoolRef = db.doc(`ecoles/${schoolId}`);
  try { await schoolRef.create({ name, active: true, createdAt: FieldValue.serverTimestamp(), createdBy: request.auth.uid }); }
  catch (error) { if ((error as { code?: number }).code !== 6) throw error; }
  await getAuth().setCustomUserClaims(request.auth.uid, { role: 'ADMINISTRATEUR', school_id: schoolId });
  return { ok: true, schoolId };
});

export const revokeAllUserTokens = onCall(async (request) => {
  const auth = requireAdmin(request);
  const uid = stringValue(request.data?.uid, 'uid');
  await getAuth().revokeRefreshTokens(uid);
  const pending = await db.collection(schoolPath(auth.schoolId, 'qr_tokens')).where('profileId', '==', uid).where('status', '==', 'pending').limit(400).get();
  const batch = db.batch();
  pending.docs.forEach((item) => batch.update(item.ref, { status: 'revoked', revokedAt: FieldValue.serverTimestamp(), revokedBy: auth.uid }));
  await batch.commit();
  await audit(auth, 'revoke_user_tokens', 'profile', uid, { qrTokensRevoked: pending.size });
  return { ok: true, uid, qrTokensRevoked: pending.size };
});

export const writeAttendanceBatch = onCall(async (request) => {
  const auth = requireStaff(request);
  const dateKey = stringValue(request.data?.dateKey, 'dateKey');
  const rows = request.data?.records;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 450) throw new HttpsError('invalid-argument', 'records doit contenir entre 1 et 450 présences.');
  const batch = db.batch();
  for (const row of rows) {
    if (!row || typeof row !== 'object') throw new HttpsError('invalid-argument', 'Présence invalide.');
    const item = row as Data;
    const studentId = stringValue(item.studentId, 'studentId');
    const slotId = stringValue(item.slotId ?? 'default', 'slotId');
    const status = stringValue(item.status, 'status');
    if (!['present', 'late', 'absent', 'excused'].includes(status)) throw new HttpsError('invalid-argument', 'Statut de présence invalide.');
    const id = `${dateKey}_${slotId}_${studentId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    batch.set(db.doc(schoolPath(auth.schoolId, 'presences', id)), { ...item, studentId, slotId, dateKey, status, school_id: auth.schoolId, updatedBy: auth.uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
  await audit(auth, 'attendance_batch', 'presences', dateKey, { count: rows.length });
  return { ok: true, count: rows.length, dateKey };
});

export const importStudents = onCall(async (request) => {
  const auth = requireStaff(request);
  if (!adminRoles.has(auth.role) && !['SECRETAIRE', 'secretaire'].includes(auth.role)) throw new HttpsError('permission-denied', 'Seul le secrétariat peut importer les élèves.');
  const rows = request.data?.rows;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 450) throw new HttpsError('invalid-argument', 'rows doit contenir entre 1 et 450 élèves.');
  const batch = db.batch();
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== 'object') throw new HttpsError('invalid-argument', 'Ligne CSV invalide.');
    const item = row as Data;
    const id = String(item.id ?? item.code ?? '').trim();
    const name = String(item.name ?? item.nom ?? '').trim();
    if (!id || !name || ids.has(id)) throw new HttpsError('invalid-argument', 'Chaque élève doit avoir un identifiant et un nom uniques.');
    ids.add(id);
    batch.set(db.doc(schoolPath(auth.schoolId, 'eleves', id)), { ...item, id, name, school_id: auth.schoolId, importedAt: FieldValue.serverTimestamp(), importedBy: auth.uid }, { merge: true });
  }
  await batch.commit();
  await audit(auth, 'import_students', 'eleves', 'batch', { count: rows.length });
  return { ok: true, count: rows.length };
});

export const createStorageUploadUrl = onCall(async (request) => {
  const auth = requireStaff(request);
  const fileName = stringValue(request.data?.fileName, 'fileName').replace(/[^a-zA-Z0-9._-]/g, '_');
  const contentType = stringValue(request.data?.contentType ?? 'application/octet-stream', 'contentType');
  const folder = stringValue(request.data?.folder ?? 'documents', 'folder').replace(/[^a-zA-Z0-9/_-]/g, '');
  const objectPath = `ecoles/${auth.schoolId}/${folder}/${randomUUID()}-${fileName}`;
  const [uploadUrl] = await getStorage().bucket().file(objectPath).getSignedUrl({ version: 'v4', action: 'write', expires: Date.now() + 15 * 60 * 1000, contentType });
  await audit(auth, 'create_upload_url', 'storage', objectPath, { contentType });
  return { ok: true, objectPath, uploadUrl, expiresAt: Date.now() + 15 * 60 * 1000 };
});

export const calculerBulletin = onDocumentWritten('ecoles/{schoolId}/bulletins/{bulletinId}', async (event) => {
  const after = event.data?.after;
  if (!after?.exists) return;
  const data = after.data() as Data;
  const schoolId = event.params.schoolId;
  const studentId = String(data.studentId ?? '');
  const trimester = String(data.trimester ?? data.trimestre ?? '');
  if (!studentId || !trimester) return;
  const notes = await db.collection(schoolPath(schoolId, 'notes')).where('studentId', '==', studentId).where('trimester', '==', trimester).limit(500).get();
  let total = 0; let coefficients = 0;
  notes.forEach((note) => { const item = note.data(); const value = Number(item.note ?? item.value); const coefficient = Number(item.coefficient ?? 1); if (Number.isFinite(value) && Number.isFinite(coefficient) && coefficient > 0) { total += value * coefficient; coefficients += coefficient; } });
  const average = coefficients ? Math.round((total / coefficients) * 100) / 100 : null;
  await after.ref.set({ average, notesCount: notes.size, status: 'calculated', calculatedAt: FieldValue.serverTimestamp() }, { merge: true });
});

export const writeGrade = onCall(async (request) => {
  const auth = requireStaff(request);
  if (auth.role === 'PROFESSEUR' || auth.role === 'professeur') {
    const assignment = await db.doc(schoolPath(auth.schoolId, 'affectations', auth.uid)).get();
    if (!assignment.exists) throw new HttpsError('permission-denied', 'Aucune affectation pédagogique active.');
  }
  const grade = request.data ?? {};
  const studentId = stringValue(grade.studentId ?? grade.eleveId, 'studentId');
  const note = Number(grade.note);
  const coefficient = Number(grade.coefficient ?? 1);
  if (!Number.isFinite(note) || note < 0 || note > 100) throw new HttpsError('invalid-argument', 'La note doit être comprise entre 0 et 100.');
  if (!Number.isFinite(coefficient) || coefficient <= 0) throw new HttpsError('invalid-argument', 'Le coefficient doit être positif.');
  const id = String(grade.id ?? `${studentId}_${grade.matiereId ?? grade.subject ?? 'matiere'}_${grade.trimestreId ?? grade.trimester ?? 'trimestre'}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  await db.doc(schoolPath(auth.schoolId, 'notes', id)).set({ ...grade, id, studentId, eleveId: studentId, note, coefficient, saisiParId: auth.uid, school_id: auth.schoolId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await audit(auth, 'write_grade', 'notes', id, { studentId, note });
  return { ok: true, id };
});

export const recordPayment = onCall(async (request) => {
  const auth = requireAuth(request);
  if (!adminRoles.has(auth.role) && !accountantRole(auth.role)) throw new HttpsError('permission-denied', 'Seul le comptable peut enregistrer un paiement.');
  const payment = request.data ?? {};
  const studentId = stringValue(payment.studentId ?? payment.eleveId, 'studentId');
  const amount = Number(payment.amount ?? payment.montantPaye);
  if (!Number.isFinite(amount) || amount <= 0) throw new HttpsError('invalid-argument', 'Le montant du paiement doit être positif.');
  const id = String(payment.id ?? randomUUID());
  await db.doc(schoolPath(auth.schoolId, 'paiements', id)).create({ ...payment, id, studentId, eleveId: studentId, amount, montantPaye: amount, school_id: auth.schoolId, enregistreParId: auth.uid, createdAt: FieldValue.serverTimestamp() }).catch(async (error: { code?: number }) => { if (error.code === 6) await db.doc(schoolPath(auth.schoolId, 'paiements', id)).set({ ...payment, updatedAt: FieldValue.serverTimestamp() }, { merge: true }); else throw error; });
  await audit(auth, 'record_payment', 'paiements', id, { studentId, amount });
  return { ok: true, id };
});

function accountantRole(role: string) { return role === 'COMPTABLE' || role === 'comptable'; }

const allowedCapabilities = new Set(['students.read', 'students.write', 'attendance.read', 'attendance.write', 'grades.read', 'grades.write', 'bulletins.read', 'bulletins.write', 'payments.read', 'payments.write', 'documents.read', 'documents.write', 'messages.use', 'planning.read', 'planning.write']);

export const upsertAssignment = onCall(async (request) => {
  const auth = requireAdmin(request);
  const input = request.data ?? {};
  const profileId = stringValue(input.profileId, 'profileId');
  const anneeScolaireId = stringValue(input.anneeScolaireId, 'anneeScolaireId');
  const classeIds = arrayOfStrings(input.classeIds, 'classeIds');
  const matiereIds = arrayOfStrings(input.matiereIds, 'matiereIds');
  const creneauIds = arrayOfStrings(input.creneauIds ?? [], 'creneauIds');
  const id = profileId;
  await db.doc(schoolPath(auth.schoolId, 'affectations', id)).set({ id, profileId, school_id: auth.schoolId, anneeScolaireId, classeIds, matiereIds, creneauIds, titulaire: Boolean(input.titulaire), active: input.active !== false, updatedAt: FieldValue.serverTimestamp(), updatedBy: auth.uid }, { merge: true });
  await audit(auth, 'upsert_assignment', 'affectations', id, { classeIds, matiereIds, anneeScolaireId });
  return { ok: true, id };
});

export const upsertCustomRole = onCall(async (request) => {
  const auth = requireAdmin(request);
  const input = request.data ?? {};
  const id = stringValue(input.id ?? input.nom, 'id').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const nom = stringValue(input.nom, 'nom');
  const capabilities = arrayOfStrings(input.capabilities, 'capabilities');
  if (capabilities.some((capability) => !allowedCapabilities.has(capability))) throw new HttpsError('invalid-argument', 'Capacité non reconnue.');
  await db.doc(schoolPath(auth.schoolId, 'roles', id)).set({ id, nom, description: String(input.description ?? ''), capabilities, active: input.active !== false, school_id: auth.schoolId, updatedAt: FieldValue.serverTimestamp(), updatedBy: auth.uid }, { merge: true });
  await audit(auth, 'upsert_custom_role', 'roles', id, { capabilities });
  return { ok: true, id };
});

export const transitionEnrollments = onCall(async (request) => {
  const auth = requireAdmin(request);
  const fromYearId = stringValue(request.data?.fromYearId, 'fromYearId');
  const toYearId = stringValue(request.data?.toYearId, 'toYearId');
  const rows = request.data?.rows;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 450) throw new HttpsError('invalid-argument', 'rows doit contenir entre 1 et 450 transitions.');
  const batch = db.batch();
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== 'object') throw new HttpsError('invalid-argument', 'Transition invalide.');
    const item = row as Data;
    const eleveId = stringValue(item.eleveId, 'eleveId');
    const classeId = stringValue(item.classeId, 'classeId');
    const decision = stringValue(item.decision, 'decision');
    if (!['PROMOTION', 'REDOUBLEMENT', 'TRANSFERT', 'RADIATION', 'AUTRE'].includes(decision)) throw new HttpsError('invalid-argument', 'Décision de transition invalide.');
    const id = `${eleveId}_${toYearId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (ids.has(id)) throw new HttpsError('invalid-argument', 'Deux transitions concernent la même inscription.');
    ids.add(id);
    batch.set(db.doc(schoolPath(auth.schoolId, 'inscriptions', id)), { id, eleveId, classeId: String(item.toClasseId ?? classeId), fromClasseId: classeId, anneeScolaireId: toYearId, previousYearId: fromYearId, decision, statut: decision === 'RADIATION' ? 'ABANDON' : 'ACTIF', school_id: auth.schoolId, confirmedBy: auth.uid, confirmedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
  await audit(auth, 'transition_enrollments', 'inscriptions', toYearId, { fromYearId, count: rows.length });
  return { ok: true, count: rows.length, toYearId };
});

export const sendMessage = onCall(async (request) => {
  const auth = requireStaff(request);
  const input = request.data ?? {};
  const destinataireId = stringValue(input.destinataireId, 'destinataireId');
  const contenu = stringValue(input.contenu, 'contenu');
  if (contenu.length > 5000) throw new HttpsError('invalid-argument', 'Message trop long.');
  const recipient = await db.doc(schoolPath(auth.schoolId, 'profiles', destinataireId)).get();
  if (!recipient.exists || recipient.data()?.school_id !== auth.schoolId) throw new HttpsError('not-found', 'Destinataire introuvable dans cette école.');
  const ref = db.collection(schoolPath(auth.schoolId, 'messages')).doc();
  await ref.set({ id: ref.id, school_id: auth.schoolId, expediteurId: auth.uid, destinataireId, contenu, lu: false, createdAt: FieldValue.serverTimestamp() });
  await db.collection(schoolPath(auth.schoolId, 'notifications')).add({ school_id: auth.schoolId, recipientId: destinataireId, kind: 'MESSAGE', title: 'Nouveau message', body: contenu.slice(0, 120), targetView: 'messages', read: false, createdAt: FieldValue.serverTimestamp() });
  return { ok: true, id: ref.id };
});

export const markMessageRead = onCall(async (request) => {
  const auth = requireStaff(request);
  const messageId = stringValue(request.data?.messageId, 'messageId');
  const ref = db.doc(schoolPath(auth.schoolId, 'messages', messageId));
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data()?.destinataireId !== auth.uid) throw new HttpsError('permission-denied', 'Message non autorisé.');
  await ref.update({ lu: true, readAt: FieldValue.serverTimestamp() });
  return { ok: true, id: messageId };
});

export const declareTeacherAbsence = onCall(async (request) => {
  const auth = requireStaff(request);
  if (!adminRoles.has(auth.role) && !['PROFESSEUR', 'professeur'].includes(auth.role)) throw new HttpsError('permission-denied', 'Absence non autorisée.');
  const profileId = adminRoles.has(auth.role) ? stringValue(request.data?.profileId, 'profileId') : auth.uid;
  const date = stringValue(request.data?.date, 'date');
  const timetableEntryIds = arrayOfStrings(request.data?.timetableEntryIds ?? [], 'timetableEntryIds');
  const ref = db.collection(schoolPath(auth.schoolId, 'absences_enseignants')).doc(`${profileId}_${date}`);
  await ref.set({ id: ref.id, school_id: auth.schoolId, profileId, date, timetableEntryIds, reason: String(request.data?.reason ?? ''), status: 'DECLAREE', createdBy: auth.uid, createdAt: FieldValue.serverTimestamp() }, { merge: true });
  await db.collection(schoolPath(auth.schoolId, 'notifications')).add({ school_id: auth.schoolId, recipientId: auth.uid, kind: 'ABSENCE', title: 'Absence enseignant déclarée', body: `Absence du ${date}`, targetView: 'staff', read: false, createdAt: FieldValue.serverTimestamp() });
  return { ok: true, id: ref.id };
});

export const upsertSchoolLicense = onCall(async (request) => {
  const auth = requireAdmin(request);
  const input = request.data ?? {};
  const planId = stringValue(input.planId, 'planId');
  const startsAt = stringValue(input.startsAt, 'startsAt');
  const expiresAt = stringValue(input.expiresAt, 'expiresAt');
  if (new Date(expiresAt).getTime() <= new Date(startsAt).getTime()) throw new HttpsError('invalid-argument', 'La date d’expiration doit suivre la date de début.');
  const id = String(input.id ?? `${auth.schoolId}_${planId}`);
  await db.doc(schoolPath(auth.schoolId, 'licence', id)).set({ id, school_id: auth.schoolId, planId, startsAt, expiresAt, status: 'ACTIVE', updatedBy: auth.uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await audit(auth, 'upsert_license', 'licence', id, { planId, expiresAt });
  return { ok: true, id };
});

function arrayOfStrings(value: unknown, field: string): string[] { if (!Array.isArray(value)) throw new HttpsError('invalid-argument', `Le champ ${field} doit être une liste.`); const values = value.map((item) => String(item).trim()).filter(Boolean); if (values.length !== value.length) throw new HttpsError('invalid-argument', `Le champ ${field} contient une valeur invalide.`); return values; }

export const registerDeviceToken = onCall(async (request) => {
  const auth = requireStaff(request);
  const token = stringValue(request.data?.token, 'token');
  if (token.length > 512) throw new HttpsError('invalid-argument', 'Token d’appareil invalide.');
  const id = `${auth.uid}_${token.slice(-24)}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  await db.doc(schoolPath(auth.schoolId, 'device_tokens', id)).set({ id, school_id: auth.schoolId, uid: auth.uid, token, platform: String(request.data?.platform ?? 'unknown'), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true, id };
});

export const registerDocumentMetadata = onCall(async (request) => {
  const auth = requireStaff(request);
  const input = request.data ?? {};
  const storagePath = stringValue(input.storagePath, 'storagePath');
  if (!storagePath.startsWith(`ecoles/${auth.schoolId}/`)) throw new HttpsError('permission-denied', 'Document hors périmètre de l’école.');
  const ownerType = stringValue(input.ownerType, 'ownerType');
  if (!['ECOLE', 'ELEVE', 'CLASSE', 'ANNEE'].includes(ownerType)) throw new HttpsError('invalid-argument', 'Type de document invalide.');
  const ownerId = stringValue(input.ownerId, 'ownerId');
  const ref = db.collection(schoolPath(auth.schoolId, 'documents')).doc();
  await ref.set({ id: ref.id, school_id: auth.schoolId, ownerType, ownerId, anneeScolaireId: String(input.anneeScolaireId ?? ''), name: stringValue(input.name, 'name'), contentType: stringValue(input.contentType, 'contentType'), storagePath, size: Number(input.size ?? 0), uploadedBy: auth.uid, createdAt: FieldValue.serverTimestamp() });
  await audit(auth, 'register_document', 'documents', ref.id, { ownerType, ownerId });
  return { ok: true, id: ref.id };
});

export const notifyPaymentCreated = onDocumentCreated('ecoles/{schoolId}/paiements/{paymentId}', async (event) => {
  const payment = event.data?.data() ?? {};
  const schoolId = event.params.schoolId;
  const profiles = await db.collection(schoolPath(schoolId, 'profiles')).where('role', 'in', ['ADMINISTRATEUR', 'DIRECTEUR', 'admin', 'directeur']).limit(50).get();
  const batch = db.batch();
  profiles.docs.forEach((profile) => { const ref = db.collection(schoolPath(schoolId, 'notifications')).doc(); batch.set(ref, { id: ref.id, school_id: schoolId, recipientId: profile.id, kind: 'PAIEMENT', title: 'Nouveau paiement enregistré', body: `${String(payment.amount ?? payment.montantPaye ?? '')} enregistré pour ${String(payment.studentId ?? payment.eleveId ?? 'un élève')}`, targetView: 'finance', read: false, createdAt: FieldValue.serverTimestamp() }); });
  if (!profiles.empty) await batch.commit();
});

export const upsertSchoolConfig = onCall(async (request) => {
  const auth = requireAdmin(request);
  const input = request.data ?? {};
  const allowed = ['name', 'form', 'legalStatus', 'address', 'phone', 'year', 'enabledLevels', 'gradingScale', 'rankingEnabled', 'reminderEnabled'];
  const config: Data = { school_id: auth.schoolId, updatedBy: auth.uid, updatedAt: FieldValue.serverTimestamp() };
  for (const key of allowed) if (input[key] !== undefined) config[key] = input[key];
  if (config.name !== undefined) config.name = stringValue(config.name, 'name');
  if (config.year !== undefined) config.year = stringValue(config.year, 'year');
  await db.doc(schoolPath(auth.schoolId, 'config', 'active')).set(config, { merge: true });
  await audit(auth, 'upsert_school_config', 'config', 'active');
  return { ok: true, schoolId: auth.schoolId };
});
