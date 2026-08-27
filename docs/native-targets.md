# Cibles natives CLASSE

CLASSE utilise une seule identité et une seule base de code métier, avec trois sorties adaptées à chaque environnement : Web/Vite à la racine, Expo/React Native dans `mobile/` et Tauri dans `src-tauri/`.

## Mobile Expo / React Native

Le package `mobile/` utilise Expo SDK 54, React Native 0.81, Expo Router 6, Expo Camera et AsyncStorage. Il contient l’écran d’entrée, le scan QR réel via caméra, la saisie Firebase Auth optionnelle, le tableau de bord, les élèves, le QR et les réglages.

```bash
cd mobile
npm install
npm run typecheck
npm run export
npm start
npm run android
npm run ios
```

La configuration mobile utilise `EXPO_PUBLIC_FIREBASE_*` dans `mobile/.env`. Les clés publiques peuvent être injectées dans le build Expo ; les secrets Admin SDK ne doivent jamais y être placés. `npm run export` produit un export web Expo contrôlé. Les builds Android et iOS natifs doivent être exécutés sur leurs toolchains respectives ou via EAS Build.

## Desktop Tauri

Le package `src-tauri/` emballe le build Vite CLASSE sans réimplémenter l’interface. Il utilise Rust/Tauri 2, un shell sans top bar applicative interne, et les permissions minimales `core:default` et `opener:default`.

```bash
npm install
npm run typecheck
npm run build
npm run tauri:check
npm run tauri:dev
npm run tauri:build
```

La compilation Linux a été vérifiée. Elle produit les artefacts suivants dans `src-tauri/target/release/bundle/` : `.deb`, `.rpm` et `.AppImage`. Les plateformes Windows et macOS doivent être compilées sur leurs runners natifs ou avec une chaîne CI adaptée ; les certificats de signature ne sont pas inclus dans Git.

## Contrat partagé

Les trois cibles utilisent les mêmes noms de rôles, le même format de QR `{ tokenId, schoolId }`, la même région Cloud Functions `europe-west1` et les mêmes règles Firestore. Le Web et le mobile appellent les fonctions `createQrToken` et `consumeQrToken` lorsque Firebase est configuré ; sans configuration, les données de démonstration restent explicitement locales.
