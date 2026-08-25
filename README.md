# Zeno — School OS

Zeno est une interface de gestion scolaire construite à partir de la fusion des parcours UXPilot et du langage visuel Stitch. Le dépôt est volontairement autonome et ne partage aucun code de déploiement avec Idealy.

## Contenu

L’application contient un shell responsive avec les rôles Directeur, Enseignant, Secrétaire et Comptable. Les espaces disponibles couvrent le tableau de bord par rôle, les élèves, le personnel, les classes, les présences, les notes, le planning, les finances et les paramètres.

Les interactions de démonstration incluent l’ajout local d’un élève, la recherche, la sélection Présent/Retard/Absent avec recalcul des compteurs, la validation d’un appel et le changement de rôle depuis le profil. Les données sont volontairement locales dans cette tranche ; la migration Supabase de base se trouve dans `supabase/migrations/20260825000000_zeno_core.sql`.

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

Ce dépôt ne contient aucune clé secrète, aucun token Idealy et aucune configuration Netlify. Les données scolaires réelles ne doivent pas être placées dans le frontend. Avant une utilisation en production, connecter la migration Supabase via un backend sécurisé, activer les politiques RLS et définir les variables d’environnement dans le projet Vercel Zeno uniquement.

La migration prépare l’isolation par établissement, les rôles, les inscriptions, les affectations, le planning, les présences, les notes, les frais, les factures, les paiements et le journal d’audit. Elle ne doit être appliquée qu’à la base Supabase dédiée à Zeno.

## État de la livraison

Le dépôt `ZENO` contient le code autonome, le lockfile npm, la configuration Vercel, la migration Supabase et le cahier des charges. Le dernier commit de publication doit être vérifié avec `git status` avant import dans Vercel. La connexion GitHub automatique peut être ajoutée plus tard depuis les réglages du projet Zeno, mais elle n’est pas nécessaire pour l’import manuel.
