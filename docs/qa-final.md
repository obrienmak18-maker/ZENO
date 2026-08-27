# CLASSE — Rapport QA final de la migration monorepo

## Périmètre vérifié

Le dépôt `obrienmak18-maker/ZENO` contient désormais un workspace pnpm/Turborepo avec `apps/desktop`, `apps/mobile`, `packages/shared`, `packages/ui` et `firebase/functions`. Les anciens lockfiles npm ont été supprimés. Les artefacts générés (`dist`, `lib`, `target`, `gen`, `node_modules`) sont exclus du versionnement.

| Vérification | Résultat | Détail |
|---|---:|---|
| `pnpm install` | Réussi | Lockfile pnpm régénéré pour 6 workspaces |
| `pnpm typecheck` | Réussi | Desktop, mobile, Functions, shared et UI |
| `pnpm lint` | Réussi | Vérification TypeScript des workspaces configurés |
| `pnpm build` | Réussi | Desktop Vite, shared, UI et Functions |
| `pnpm --filter classe-mobile export` | Réussi | Export Expo web avec 34 routes statiques |
| `pnpm test` | Réussi | Checks des packages shared/UI |
| `pnpm test:rules` | Réussi | 4 tests Emulator multi-écoles |
| `pnpm --filter @classe/desktop tauri:check` | Réussi | Compilation Rust après suppression du cache hérité |
| `pnpm --filter @classe/desktop tauri:build` | Réussi | `.deb`, `.rpm` et `.AppImage` Linux générés |
| QA navigateur Vite | Réussi | Écran CLASSE, sidebar rétractée/logo visible, navigation Élèves |

## Fonctions et sécurité livrées

Les Functions Firebase couvrent l’attribution de rôle, la création et consommation atomique des QR, l’émission du Custom Token, la révocation des sessions, l’appel batch idempotent, la saisie de notes, l’enregistrement de paiements, l’import contrôlé d’élèves, les URL d’upload Storage signées, le bootstrap protégé par `BOOTSTRAP_KEY`, l’audit et le recalcul automatique des bulletins.

Les règles Firestore imposent l’isolation par `school_id`, les permissions par rôle et l’existence d’une affectation pour les écritures pédagogiques. Les règles Storage limitent les fichiers à une école, aux rôles autorisés et à 10 Mo. Les index sont déclarés dans `firestore.indexes.json`.

## Parcours mobile livrés

Le scan mobile échange maintenant un QR contre un Custom Token Firebase. Les groupes de routes professeur et comptable sont présents, avec onglets dédiés pour l’appel, les notes, le profil, les paiements et les débiteurs. La file offline AsyncStorage rejoue les mutations quand les Functions redeviennent disponibles. Les élèves et les compteurs du dashboard utilisent Firestore lorsqu’un compte et un `school_id` sont disponibles, avec cache local explicite sinon.

## Limites externes restantes

Aucun `projectId` Firebase ni configuration publique Web/Mobile n’a été fourni dans cette session : aucun déploiement Firebase de production n’a donc été exécuté et aucune donnée distante n’a été simulée. Pour activer la production, il faut fournir le `projectId`, les six valeurs publiques Firebase sous `VITE_FIREBASE_*` et `EXPO_PUBLIC_FIREBASE_*`, puis configurer le secret serveur `BOOTSTRAP_KEY` hors dépôt.

Le poste de validation utilise Node 22 alors que les Functions déclarent Node 20 ; le build passe, mais le déploiement doit être testé dans le runtime Node 20 configuré par Firebase. Les paquets Android/iOS Tauri/Expo nécessitant signature et certificats ne peuvent pas être signés dans ce clone Linux sans les certificats de l’établissement.
