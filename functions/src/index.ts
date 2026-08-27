import { randomUUID } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';

if (!getApps().length) initializeApp();
setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const db = getFirestore();
const adminRoles = new Set(['ADMINISTRATEUR', 'directeur', 'admin']);
const supportedRoles = new Set(['ADMINISTRATEUR', 'PROFESSEUR', 'SECRETAIRE', 'COMPTABLE']);

function requireAuth(request: CallableRequest<Record<string, unknown>>) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Une session Firebase est requise.');
  return request.auth;
}

function requireAdmin(request: CallableRequest<Record<string, unknown>>) {
  const auth = requireAuth(request);
  const role = String(auth.token.role ?? '');
  if (!adminRoles.has(role)) throw new HttpsError('permission-denied', 'Cette opération est réservée à un administrateur.');
  const schoolId = String(auth.token.school_id ?? '');
  if (!schoolId) throw new HttpsError('failed-precondition', 'Le compte ne possède pas de school_id.');
  return { auth, schoolId };
}

function stringValue(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) throw new HttpsError('invalid-argument', `Le champ ${field} est requis.`);
  return value.trim();
}

export const setUserRole = onCall(async (request) => {
  const { schoolId } = requireAdmin(request);
  const uid = stringValue(request.data?.uid, 'uid');
  const role = stringValue(request.data?.role, 'role').toUpperCase();
  const requestedSchoolId = stringValue(request.data?.schoolId, 'schoolId');
  if (requestedSchoolId !== schoolId) throw new HttpsError('permission-denied', 'École non autorisée.');
  if (!supportedRoles.has(role)) throw new HttpsError('invalid-argument', 'Rôle non reconnu.');
  await getAuth().setCustomUserClaims(uid, { role, school_id: schoolId });
  await db.doc(`ecoles/${schoolId}/profiles/${uid}`).set({ role, school_id: schoolId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true, uid, role, schoolId };
});

export const createQrToken = onCall(async (request) => {
  const { auth, schoolId } = requireAdmin(request);
  const profileId = stringValue(request.data?.profileId, 'profileId');
  const profileName = stringValue(request.data?.profileName, 'profileName');
  const role = stringValue(request.data?.role, 'role');
  const tokenId = randomUUID();
  const expiresAt = Date.now() + 15 * 60 * 1000;
  await db.doc(`ecoles/${schoolId}/qr_tokens/${tokenId}`).set({ tokenId, school_id: schoolId, profileId, profileName, role, status: 'pending', createdAt: FieldValue.serverTimestamp(), expiresAt, createdBy: auth.uid });
  return { tokenId, schoolId, expiresAt };
});

export const consumeQrToken = onCall(async (request) => {
  const tokenId = stringValue(request.data?.tokenId, 'tokenId');
  const schoolId = stringValue(request.data?.schoolId, 'schoolId');
  const ref = db.doc(`ecoles/${schoolId}/qr_tokens/${tokenId}`);
  const token = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new HttpsError('not-found', 'QR Code introuvable.');
    const data = snapshot.data() ?? {};
    if (data.status !== 'pending' || Number(data.expiresAt) <= Date.now()) throw new HttpsError('permission-denied', 'QR Code expiré ou déjà utilisé.');
    transaction.update(ref, { status: 'used', usedAt: FieldValue.serverTimestamp(), usedBy: request.auth?.uid ?? null });
    return data;
  });
  return { ok: true, profileId: token.profileId, role: token.role, schoolId };
});

export const bootstrapSchool = onCall(async (request) => {
  const auth = requireAuth(request);
  const bootstrapKey = stringValue(request.data?.bootstrapKey, 'bootstrapKey');
  const configuredKey = String(auth.token.bootstrap_key ?? '');
  if (!configuredKey || bootstrapKey !== configuredKey) throw new HttpsError('permission-denied', 'Clé d’amorçage invalide.');
  const schoolId = stringValue(request.data?.schoolId, 'schoolId');
  const name = stringValue(request.data?.name, 'name');
  await db.doc(`ecoles/${schoolId}`).set({ name, active: true, createdAt: FieldValue.serverTimestamp(), createdBy: auth.uid }, { merge: true });
  await getAuth().setCustomUserClaims(auth.uid, { ...(auth.token ?? {}), role: 'ADMINISTRATEUR', school_id: schoolId });
  return { ok: true, schoolId };
});
