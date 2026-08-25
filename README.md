# Zeno — School OS

Zeno est une interface de gestion scolaire construite à partir de la fusion des parcours UXPilot et du langage visuel Stitch. Le dépôt est volontairement autonome et ne partage aucun code de déploiement avec Idealy.

## Contenu

L’application contient un shell responsive avec les rôles Directeur, Enseignant, Secrétaire et Comptable. Les espaces disponibles couvrent le tableau de bord par rôle, les élèves, le personnel, les classes, les présences, les notes, les bulletins, le planning, les finances, les rapports, l’administration, les notifications, l’activité et les paramètres.

Les workflows frontend fonctionnels incluent l’onboarding progressif avec identité, forme, statut, niveaux, structure, classes, équipe et droits ; l’ajout et la recherche d’élèves ; l’import CSV avec détection de doublons ; la présence Présent/Retard/Absent avec compteurs ; la saisie et la soumission des notes ; l’aperçu imprimable des bulletins ; l’enregistrement des paiements ; l’export d’une synthèse JSON ; et la conservation locale des données dans le navigateur. Lorsqu’un utilisateur est authentifié et possède une école active, l’ajout individuel d’un élève appelle la RPC Supabase tenant-aware qui crée également son enrollment dans l’année et la classe choisies.

## Vérification locale

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Le serveur local utilise le port `4174` par défaut. Le build Vite produit le site dans `dist/public`.

## Publication sur le projet Vercel Zeno

Le projet cible est `zeno-school-live`, avec le domaine [zeno-school-live.vercel.app](https://zeno-school-live.vercel.app). Le dépôt source est [obrienmak18-maker/ZENO](https://github.com/obrienmak18-maker/ZENO). Le projet Vercel n’est pas encore relié automatiquement à GitHub en raison d’un refus d’autorisation du compte ; le dépôt est néanmoins prêt pour une publication manuelle depuis l’interface Vercel ou le CLI.

Utiliser exclusivement cette configuration :

| Paramètre | Valeur |
|---|---|
| Projet Vercel | `zeno-school-live` |
| Framework Preset | Vite |
| Root Directory | `.` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist/public` |
| Production Branch | `main` |

Depuis une copie locale du dépôt, exécutez :

```bash
gh repo clone obrienmak18-maker/ZENO
cd ZENO
npm install
npm run typecheck
npm run build
vercel --prod
```

Lorsque Vercel demande le projet, sélectionnez `zeno-school-live` et l’environnement `Production`. Une tentative de publication automatique directe a été refusée par Vercel avec une erreur de permission `403`; cela concerne le compte de publication, pas le code Zeno. Il faut donc réautoriser la connexion GitHub/Vercel ou effectuer l’import manuel depuis un compte qui possède les droits de production. Ne modifiez pas `inia`, le dépôt Idealy, Netlify Idealy ou un projet Vercel qui ne porte pas le nom `zeno-school-live`.

## Supabase Zeno

La base dédiée est le projet Supabase `pjrwkppngrpkaedfuunh` (`supabase-indigo-dog`). Les variables publiques attendues par le frontend sont `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Copiez `.env.example` vers `.env.local` pour le développement local, puis configurez ces deux variables dans le projet Vercel Zeno uniquement. La clé anonyme est destinée au frontend ; aucune clé service-role ne doit être ajoutée au dépôt ou à Vercel côté navigateur.

Appliquez les migrations dans l’ordre suivant, uniquement dans la base Zeno :

| Migration | Rôle | État |
|---|---|---|
| `20260825000000_zeno_core.sql` | Tables multi-tenant et RLS | Appliquée manuellement |
| `20260825000001_zeno_bootstrap.sql` | Création initiale école/année/classes/rôles | Appliquée manuellement |
| `20260825000002_zeno_security_hardening.sql` | Helpers privés et policies RLS durcies | Appliquée |
| `20260825000003_zeno_student_enrollment.sql` | RPC atomique élève + enrollment | Appliquée |

Les advisors sécurité Supabase sont sans alerte après ces changements. L’onboarding appelle `zeno_bootstrap_school` uniquement lorsqu’aucune école active n’est déjà enregistrée localement, ce qui empêche la création accidentelle d’un second tenant lors d’une reconfiguration.

## Sécurité et limites honnêtes

Ce dépôt ne contient aucune clé secrète, aucun token Idealy et aucune configuration Netlify. Les données scolaires réelles doivent rester dans la base Supabase dédiée à Zeno et être filtrées par les policies RLS. L’application affiche explicitement le mode local lorsqu’elle fonctionne sans Supabase.

La connexion, l’onboarding initial et l’ajout individuel d’un élève avec son enrollment sont reliés à Supabase. L’import CSV, les présences, les notes, les paiements et les rapports restent fonctionnels localement mais ne doivent pas encore être décrits comme synchronisés côté serveur. Le mode `Mobile Money · test` est un libellé de préparation UX et ne constitue pas une intégration de paiement en production.

## État de la livraison

Le dépôt `ZENO` contient le code autonome, le lockfile npm, la configuration Vercel, les migrations Supabase, le cahier des charges et le journal QA. Le site public existant répond correctement sur `zeno-school-live.vercel.app`; la republication du dernier commit nécessite encore l’autorisation Vercel/GitHub ou l’import manuel du dépôt. La base Zeno est séparée d’Idealy et aucune opération de configuration n’a été effectuée sur Idealy.
