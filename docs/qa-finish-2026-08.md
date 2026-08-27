# QA — phase de finition CLASSE

## Ajouts réalisés

Cette phase a complété le socle partagé avec des contrats d’inscription annuelle, de transition, d’affectation, de rôle personnalisé, de document, de licence, de message, d’absence enseignant, de notification et de transaction Mobile Money préparatoire. `packages/ui` expose désormais Button, Card, Badge, Avatar, ProgressBar, Modal, Toast, Input, Select, Table et EmptyState, avec styles CLASSE.

Le backend Firebase expose maintenant les callables d’affectation, rôle personnalisé, transition annuelle, messagerie, marquage de message lu, absence enseignant, licence, token d’appareil, métadonnées documentaires et configuration école. Un trigger crée une notification aux administrateurs lors d’un paiement. Les Rules vérifient les classes et matières de l’affectation professeur et couvrent les nouvelles collections.

Le desktop dispose d’une génération de bulletin PDF locale avec `@react-pdf/renderer`, d’une messagerie Firestore temps réel, d’une persistance Firestore de la configuration école, et de nouveaux helpers pour messages, affectations, inscriptions et documents. Le mobile utilise réellement NativeWind/Metro, Expo Notifications, un replay automatique de la file offline, une messagerie commune, un appel basé sur le planning actif et les élèves Firestore, des notes filtrables avec appréciation et debounce, ainsi qu’un paiement mobile fondé sur la recherche d’élève et la référence de transaction.

## Vérifications

| Commande | Résultat |
|---|---|
| `pnpm install` | Réussi ; lockfile pnpm à jour. |
| `pnpm typecheck` | Réussi dans desktop, mobile, shared, UI et Functions. |
| `pnpm test` | Réussi : 3 tests de contrats partagés. |
| `pnpm test:rules` | Réussi : 5 tests Emulator, dont isolation multi-écoles et affectation classe/matière. |
| `pnpm build` | Réussi pour desktop, shared, UI et Functions. |
| `pnpm --filter classe-mobile export` | Réussi : 40 routes statiques exportées. |
| `pnpm --filter @classe/desktop tauri:check` | Réussi. |
| `pnpm --filter @classe/desktop tauri:build` | Réussi : `.deb`, `.rpm`, `.AppImage`. |

## Limites qui ne peuvent pas être activées sans informations externes

Aucun projet Firebase réel n’est configuré dans le clone : le `projectId`, les six variables publiques Web/Mobile, les valeurs EAS et le secret serveur `BOOTSTRAP_KEY` doivent être fournis par le propriétaire. Aucun déploiement de production Firebase n’est donc prétendu ici. Les signatures Android/iOS/Windows/macOS nécessitent aussi les certificats propriétaires et ne sont pas simulées.

Le cahier demande Expo 52/RN 0.76/Router 4, alors que la base WebDev fournie utilise Expo 54/RN 0.81/Router 6. Les versions actuelles sont cohérentes et exportées avec succès ; un retour aux versions anciennes demanderait une migration séparée et une validation native sur appareils.
