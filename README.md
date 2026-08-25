# Zeno — School OS

Zeno est une interface de gestion scolaire construite à partir de la fusion des parcours UXPilot et du langage visuel Stitch. Le dépôt est volontairement autonome et ne partage aucun code de déploiement avec Idealy.

## Contenu

L’application contient un shell responsive avec les rôles Directeur, Enseignant, Secrétaire et Comptable. Les espaces disponibles couvrent le tableau de bord par rôle, les élèves, le personnel, les classes, les présences, les notes, les bulletins, le planning, les finances, les rapports, l’administration, les notifications, l’activité et les paramètres.

Les workflows frontend fonctionnels incluent l’onboarding progressif avec identité, forme, statut, niveaux, structure, classes, équipe et droits ; l’ajout et la recherche d’élèves ; l’import CSV avec détection de doublons ; la présence Présent/Retard/Absent avec compteurs ; la saisie et la soumission des notes ; l’aperçu imprimable des bulletins ; l’enregistrement des paiements ; l’export d’une synthèse JSON ; et la conservation locale des données dans le navigateur. La migration Supabase de base se trouve dans `supabase/migrations/20260825000000_zeno_core.sql`.

## Vérification locale

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Le serveur local utilise le port `4174` par défaut. Le build Vite produit le site dans `dist/public`.

## Publication manuelle sur Vercel

Dans Vercel, créer ou sélectionner un projet exclusivement réservé à Zeno. Importer le dépôt GitHub `obrienmak18-maker/ZENO`. Ne pas importer le dépôt `obrienmak18-maker/idealy` et ne pas modifier le projet `inia`.

Utiliser la configuration suivante :

| Paramètre | Valeur |
|---|---|
| Framework Preset | Vite |
| Root Directory | `.` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist/public` |
| Production Branch | `main` |

Le fichier `vercel.json` contient déjà les valeurs de build et de sortie. Si Vercel les détecte automatiquement, conserver néanmoins `dist/public` comme dossier de sortie explicite.

## Sécurité et séparation

Ce dépôt ne contient aucune clé secrète, aucun token Idealy et aucune configuration Netlify. Les données scolaires réelles ne doivent pas être placées dans le frontend. La base Supabase doit être une base dédiée à Zeno, distincte de toute base Idealy.

Appliquez les migrations dans l’ordre : `supabase/migrations/20260825000000_zeno_core.sql`, puis `supabase/migrations/20260825000001_zeno_bootstrap.sql`. La première crée les entités tenant-scoped et les politiques RLS ; la seconde expose uniquement la fonction authentifiée `zeno_bootstrap_school` pour créer l’établissement initial, l’année active, le membre propriétaire, les rôles et l’événement d’audit.

Copiez `.env.example` vers `.env.local` pour le développement local, puis configurez les mêmes valeurs dans les variables du projet Vercel Zeno uniquement : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. La clé anonyme est destinée au frontend ; aucune clé service-role ne doit être ajoutée au dépôt ou à Vercel côté navigateur. Si ces variables sont absentes, Zeno affiche ses parcours en mode local de démonstration sans prétendre synchroniser les données.

La migration prépare l’isolation par établissement, les rôles, les inscriptions, les affectations, le planning, les présences, les notes, les frais, les factures, les paiements et le journal d’audit. Elle ne doit être appliquée qu’à la base Supabase dédiée à Zeno.

## État de la livraison

Le dépôt `ZENO` contient le code autonome, le lockfile npm, la configuration Vercel, la migration Supabase, le cahier des charges et le journal QA. Le frontend est prêt pour une publication manuelle, mais la version actuelle doit être considérée comme une pré-production tant que Supabase dédié, authentification réelle, RLS et permissions serveur ne sont pas activés. La connexion GitHub automatique peut être ajoutée plus tard depuis les réglages du projet Zeno, mais elle n’est pas nécessaire pour l’import manuel.
