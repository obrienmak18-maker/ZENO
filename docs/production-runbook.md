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
npm install -g firebase-tools
firebase login
cp .firebaserc.example .firebaserc
firebase use --add
npm install
npm --prefix functions install
npm run build
npm --prefix functions run build
firebase deploy --only firestore:rules,functions,hosting
```

Le fichier `firebase.json` publie `dist/public`, déploie les règles `firebase/firestore.rules` et compile les fonctions depuis `functions/`. La fonction régionale par défaut est `europe-west1`.

## Collections Firestore

Le schéma documenté dans `firebase/schema.md` utilise `ecoles/{schoolId}` comme racine d’isolation. Les collections principales sont `profiles`, `eleves`, `classes`, `personnel`, `presences`, `notes`, `paiements`, `emploi_du_temps`, `messages`, `qr_tokens` et `audit_logs`.

Avant l’ouverture aux utilisateurs, créer un premier administrateur et lui attribuer les custom claims `role=ADMINISTRATEUR` et `school_id={schoolId}` à l’aide de l’Admin SDK ou d’un script exécuté dans un environnement sécurisé. Les rôles ne doivent pas être modifiés depuis le navigateur. Les fonctions `setUserRole`, `createQrToken`, `consumeQrToken` et `bootstrapSchool` sont dans `functions/src/index.ts`.

## Vérifications avant ouverture

Exécuter le typecheck et la build Web, puis compiler les fonctions :

```bash
npm run typecheck
npm run build
npm --prefix functions run build
```

Tester ensuite un compte administrateur, un compte enseignant, un compte secrétaire et un compte comptable. Vérifier qu’un utilisateur d’une école ne peut pas lire une autre école, qu’un QR expiré ou déjà consommé est refusé, que les paiements et les notes respectent leurs rôles, et que l’historique d’audit est conservé.

Tant que le projet Firebase n’est pas renseigné et déployé, la version navigateur conserve les données dans `localStorage`. Cette limite est affichée explicitement dans l’interface et ne doit pas être présentée comme une synchronisation cloud.

## Références officielles

[1]: https://firebase.google.com/docs/web/setup "Firebase Web setup"
[2]: https://firebase.google.com/docs/functions/get-started "Firebase Cloud Functions"
[3]: https://firebase.google.com/docs/firestore/security/get-started "Firestore Security Rules"
[4]: https://firebase.google.com/docs/auth/admin/custom-claims "Firebase custom claims"
