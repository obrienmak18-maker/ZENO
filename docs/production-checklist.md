# Zeno — checklist de mise en production

Cette procédure concerne uniquement le dépôt GitHub `obrienmak18-maker/ZENO`, le projet Vercel séparé de Zeno et une base Supabase dédiée à Zeno. Ne sélectionnez jamais `obrienmak18-maker/idealy`, le projet Vercel `inia`, la base `IDEALY` ou le site Netlify Idealy.

## 1. Base Supabase dédiée

Créez ou sélectionnez un projet Supabase vierge destiné à Zeno. Appliquez dans l’ordre `supabase/migrations/20260825000000_zeno_core.sql`, puis `supabase/migrations/20260825000001_zeno_bootstrap.sql`. Vérifiez dans les advisors Supabase que les tables sensibles ont RLS activé et qu’aucune clé service-role n’est exposée au frontend.

## 2. Projet Vercel Zeno

Importez uniquement `obrienmak18-maker/ZENO`. Utilisez `Root Directory: .`, `Framework: Vite`, `Install Command: npm install`, `Build Command: npm run build`, `Output Directory: dist/public` et la branche `main`.

Ajoutez uniquement dans les variables du projet Zeno : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Ne copiez pas de fichier `.env.local` dans GitHub et n’ajoutez jamais `SUPABASE_SERVICE_ROLE_KEY` à un projet frontend.

## 3. Vérifications après publication

Ouvrez l’URL Vercel Zeno dans une fenêtre privée. Vérifiez que l’écran de connexion apparaît lorsque les variables Supabase sont configurées. Créez un compte de test, terminez l’onboarding et vérifiez la création de l’école, de l’année active, des rôles, du niveau Primaire, des classes et de la période de notes. Ajoutez ensuite un élève et confirmez sa présence dans `zeno_students` avec le bon `school_id`.

Testez un second compte sans membership et confirmez qu’il ne peut pas lire les tables de l’école. Testez la déconnexion. Enfin, contrôlez que l’URL Idealy sur Netlify, le projet Vercel `inia` et le dépôt Idealy n’ont pas été sélectionnés dans la configuration Zeno.

## 4. Mode local

Sans variables Supabase, Zeno reste utilisable en mode local de démonstration avec persistance navigateur. Ce mode ne doit pas recevoir de données scolaires réelles et ne doit pas être présenté comme une synchronisation serveur.
