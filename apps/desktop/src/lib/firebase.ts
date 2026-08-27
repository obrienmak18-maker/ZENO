import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFunctions, type Functions } from 'firebase/functions';
import { enableIndexedDbPersistence, getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const requiredKeys = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID'];

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
const configured = requiredKeys.every((key) => Boolean(env[key]));

if (configured) {
  app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  auth = getAuth(app);
  functions = getFunctions(app, 'europe-west1');
  db = getFirestore(app);
  storage = getStorage(app);
  void enableIndexedDbPersistence(db).catch(() => undefined);
}

export function getFirebaseStatus() {
  return { configured, app, auth, functions, db, storage };
}
