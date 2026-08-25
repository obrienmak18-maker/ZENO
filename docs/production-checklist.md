# Zeno — checklist de mise en production

Cette procédure concerne uniquement le dépôt GitHub `obrienmak18-maker/ZENO`, le projet Vercel `zeno-school-live` et le projet Supabase `pjrwkppngrpkaedfuunh` (`supabase-indigo-dog`). Ne sélectionnez jamais `obrienmak18-maker/idealy`, le projet Vercel `inia`, la base Supabase `IDEALY` (`vhucjkyktdflwocrmzhe`) ou le site Netlify Idealy.

## 1. Base Supabase dédiée

Le projet Supabase Zeno est actif et séparé. Les tables Zeno sont tenant-scoped, vides par défaut et protégées par RLS. Les migrations `20260825000000_zeno_core.sql` et `20260825000001_zeno_bootstrap.sql` ont été exécutées manuellement dans cette base. Les migrations `20260825000002_zeno_security_hardening.sql` et `20260825000003_zeno_student_enrollment.sql` sont aussi appliquées ; l’historique Supabase les référence sous les noms `zeno_security_hardening` et `zeno_student_enrollment`.

Le durcissement déplace les helpers privilégiés dans le schéma privé et laisse au navigateur uniquement des RPC authentifiées. La RPC d’inscription est `SECURITY INVOKER`, vérifie le membership actif, retrouve l’année et la classe du tenant, puis crée l’élève et son enrollment de façon atomique. Les advisors sécurité Supabase sont actuellement sans alerte. Aucune clé service-role ne doit être exposée au frontend.

## 2. Variables et projet Vercel Zeno

Le projet Vercel cible est `zeno-school-live`, avec le domaine de production [zeno-school-live.vercel.app](https://zeno-school-live.vercel.app). Les deux variables de production ont été enregistrées dans ce projet uniquement : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Ne copiez pas de fichier `.env.local` dans GitHub et n’ajoutez jamais `SUPABASE_SERVICE_ROLE_KEY` à un projet frontend.

La configuration de build est la suivante :

| Paramètre | Valeur |
|---|---|
| Framework | Vite |
| Root Directory | `.` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist/public` |
| Branche du dépôt | `main` |

## 3. Publication manuelle si GitHub reste inaccessible

Le dépôt contient le commit final et le lockfile npm. Si la connexion GitHub de Vercel reste refusée, téléchargez le dépôt `ZENO` ou le paquet de publication préparé, décompressez-le, puis importez ce dossier dans le projet existant `zeno-school-live`. Dans Vercel, utilisez les paramètres du tableau ci-dessus et choisissez `Production`. Ne créez pas un nouveau projet portant un autre nom et ne sélectionnez aucun projet Idealy.

Une autre voie consiste à cloner le dépôt puis à publier avec le CLI Vercel depuis le dossier racine :

```bash
gh repo clone obrienmak18-maker/ZENO
cd ZENO
npm install
npm run typecheck
npm run build
vercel --prod
```

Lorsque Vercel propose le projet cible, choisissez exclusivement `zeno-school-live`. Si le compte affiche encore une erreur `403` de permission de production, l’administrateur du compte doit réautoriser GitHub/Vercel ou effectuer l’import depuis l’interface connectée. Le code et la base ne nécessitent aucune modification d’Idealy pour cette étape.

## 4. Vérifications après publication

Ouvrez l’URL Vercel Zeno dans une fenêtre privée. Avec les variables Supabase présentes, l’écran de connexion doit apparaître. Créez un compte de test, terminez l’onboarding et vérifiez dans le projet Supabase Zeno la création de l’école, de l’année active, du membre propriétaire, des rôles, du niveau Primaire, des classes, de la période de notes et du journal d’audit. Ajoutez ensuite un élève dans `6ème primaire A` ou `6ème primaire B` et confirmez la création de `zeno_students` ainsi que de `zeno_enrollments` avec le même `school_id`.

Testez la déconnexion, puis un second compte sans membership. Ce second compte ne doit pas pouvoir lire les données du premier tenant. Contrôlez aussi que les écrans Présences, Notes et Finances signalent honnêtement leur conservation locale tant que leurs mutateurs Supabase dédiés ne sont pas branchés.

## 5. Mode local et limites connues

Sans variables Supabase, Zeno reste utilisable en mode local de démonstration avec persistance navigateur. Ce mode ne doit pas recevoir de données scolaires réelles et ne doit pas être présenté comme une synchronisation serveur. L’ajout individuel d’un élève connecté est synchronisé avec son enrollment ; l’import CSV, les présences, les notes, les paiements et les rapports restent actuellement des workflows locaux à compléter par des mutations serveur tenant-aware.
