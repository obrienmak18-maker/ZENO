# CLASSE — Runbook de mise en production

## État publié

La branche `main` du dépôt `obrienmak18-maker/ZENO` contient CLASSE à la racine. La version actuelle est compilable avec React, TypeScript et Vite. La session Firebase Auth est supportée côté client lorsque les variables `VITE_FIREBASE_*` sont présentes. Sans ces variables, l’application reste en mode local explicite.

## Préparer le projet Firebase

Créer un projet Firebase dédié à l’établissement, activer **Authentication > Email/Password**, créer la base Firestore en mode production et enregistrer une application Web. Renseigner ensuite les valeurs de configuration dans un fichier `.env.local` à la racine du dépôt :

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Ces valeurs sont destinées au client web. Ne jamais placer de clé privée Admin SDK, de certificat JSON ou de secret de fonction dans une variable `VITE_*`.

## Lier et déployer

Installer la CLI Firebase, se connecter, copier `.firebaserc.example` vers `.firebaserc` et remplacer le projet indiqué :

```bash
pnpm install
pnpm exec firebase login
cp .firebaserc.example .firebaserc
pnpm exec firebase use --add
pnpm typecheck
pnpm build
pnpm firebase:build
pnpm exec firebase deploy --only firestore:rules,firestore:indexes,storage,functions,hosting
```

Le fichier `firebase.json` publie `apps/desktop/dist/public`, utilise `firebase/firestore.rules`, `firebase/storage.rules` et `firestore.indexes.json`, et compile les fonctions depuis `firebase/functions/`. La fonction régionale par défaut est `europe-west1`.

## Collections Firestore

Le schéma documenté dans `firebase/schema.md` utilise `ecoles/{schoolId}` comme racine d’isolation. Les collections principales sont `profiles`, `eleves`, `classes`, `personnel`, `presences`, `notes`, `paiements`, `emploi_du_temps`, `messages`, `qr_tokens` et `audit_logs`.

Avant l’ouverture aux utilisateurs, créer un premier administrateur et lui attribuer les custom claims `role=ADMINISTRATEUR` et `school_id={schoolId}` à l’aide de l’Admin SDK ou de `bootstrapSchool` avec le secret serveur `BOOTSTRAP_KEY` configuré dans l’environnement Functions. Les rôles ne doivent pas être modifiés depuis le navigateur. Les fonctions `setUserRole`, `createQrToken`, `consumeQrToken`, `generateQRAuthToken`, `revokeAllUserTokens`, `writeAttendanceBatch`, `writeGrade`, `recordPayment`, `importStudents`, `createStorageUploadUrl` et `bootstrapSchool` sont dans `firebase/functions/src/index.ts`.

## Vérifications avant ouverture

Exécuter le typecheck et la build Web, puis compiler les fonctions :

```bash
npm run typecheck
npm run build
npm --prefix functions run build
```

Tester ensuite un compte administrateur, un compte enseignant, un compte secrétaire et un compte comptable. Vérifier qu’un utilisateur d’une école ne peut pas lire une autre école, qu’un QR expiré ou déjà consommé est refusé, que les paiements et les notes respectent leurs rôles, et que l’historique d’audit est conservé.

Tant que le projet Firebase n’est pas renseigné et déployé, la version navigateur conserve les données dans `localStorage` et l’application mobile utilise AsyncStorage pour sa file offline. Cette limite est affichée explicitement dans l’interface et ne doit pas être présentée comme une synchronisation cloud. Quand Firebase est configuré, le desktop active Firestore avec persistance IndexedDB et abonnements `onSnapshot`; le mobile utilise Firestore pour les listes et les callables pour les mutations sensibles.

## Variables mobiles et tests locaux

L’application Expo lit les mêmes six valeurs publiques sous le préfixe `EXPO_PUBLIC_FIREBASE_*`, avec `EXPO_PUBLIC_FIREBASE_SCHOOL_ID` si le claim n’est pas encore présent. Le secret `BOOTSTRAP_KEY` reste exclusivement côté Functions et ne doit jamais être commité.

Les règles peuvent être testées sans projet de production avec :

```bash
pnpm test:rules
```

Cette commande démarre l’Emulator Firestore, seed deux écoles, vérifie l’isolation inter-écoles et refuse l’écriture d’un professeur sans affectation. Les messages de dépréciation du CLI ou l’absence de login ne signifient pas qu’une base de production est connectée.

## Références officielles

[1]: https://firebase.google.com/docs/web/setup "Firebase Web setup"
[2]: https://firebase.google.com/docs/functions/get-started "Firebase Cloud Functions"
[3]: https://firebase.google.com/docs/firestore/security/get-started "Firestore Security Rules"
[4]: https://firebase.google.com/docs/auth/admin/custom-claims "Firebase custom claims"
