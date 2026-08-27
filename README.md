# CLASSE — La gestion scolaire avec style

CLASSE est désormais l’application principale du dépôt. Elle est construite avec React, TypeScript et Vite, avec une interface responsive orientée gestion scolaire. La navigation latérale est rétractée par défaut : le logo reste visible, les libellés sont accessibles par infobulle et un bouton permet de déployer la navigation. Aucune top bar permanente n’est rendue sur desktop.

## Fonctionnalités disponibles

L’application propose une expérience interactive persistée dans le navigateur : dashboard par rôle, recherche universelle, gestion des élèves et dossier unifié, ajout d’inscription avec code automatique, import avec analyse et détection des doublons, classes configurables, planning avec détection de conflits, appel avec présence/retard/absence/excusé, saisie des notes, calcul des bulletins pondérés, classement et mentions, paiements partiels et rapprochement Mobile Money, messagerie, QR d’accès avec expiration de quinze minutes et révocation, paramètres de structure, rôles, licence séparée des finances et indicateur réseau.

Les données de démonstration sont enregistrées dans `localStorage` sous les clés préfixées `classe-`. Cette stratégie permet de vérifier les parcours sans compte ni secret. Quand les six variables Firebase sont renseignées, `src/lib/firebase.ts` initialise Firebase Auth côté client et la session authentifiée est pilotée par `onAuthStateChanged`. Sans ces variables, la saisie manuelle indique clairement qu’elle fonctionne en mode local et ne transmet pas les identifiants.

## Développement local

Depuis la racine du dépôt :

```bash
npm install
npm run dev
```

La validation de production se fait avec :

```bash
npm run typecheck
npm run build
```

## Configuration Firebase

Créer un fichier `.env.local` à la racine avec `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` et `VITE_FIREBASE_APP_ID`. Ces valeurs activent l’initialisation Firebase Auth côté navigateur ; elles ne remplacent pas les règles de sécurité serveur.

Les règles Firestore sont dans `firebase/firestore.rules`, le schéma est dans `firebase/schema.md` et les Cloud Functions sécurisées sont dans `functions/src/index.ts`. Elles doivent être déployées dans le projet Firebase de l’établissement avant une utilisation multi-utilisateur en production. Aucun secret Admin SDK ne doit être placé dans les variables `VITE_*`.

## Maquette et cahier des charges

La maquette complète, ses fichiers HTML, ses captures d’écran, son design system et le cahier des charges sont archivés dans `docs/maquette-classe/`. Le compte-rendu du remplacement et la vérification de la navigation sont dans `docs/classe-root-verification.md` et `docs/qa-classe-navigation.md`.

## Limites de déploiement

Le projet contient la cible Web, la cible mobile Expo/React Native dans `mobile/` et la cible desktop Tauri dans `src-tauri/`. Les validations Web, Expo web, Cloud Functions et Tauri Linux passent dans l’environnement de développement. La persistance locale fonctionne immédiatement ; la synchronisation distante, les comptes Firebase, les certificats Android/iOS/macOS/Windows et les variables de production doivent encore être renseignés dans le projet de l’établissement avant l’ouverture à une école réelle.
