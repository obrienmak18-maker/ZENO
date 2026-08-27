# Transfert de CLASSE dans ZENO

Le package CLASSE provenant de la maquette et du cahier des charges est conservé dans `artifacts/zeno/`. Les fichiers visuels, HTML et spécifications sont archivés dans `docs/maquette-classe/`.

Le point d’entrée de l’application ZENO reste `src/App.tsx`, avec son `src/AuthScreen.tsx`, son adaptateur Supabase et ses workflows existants. Le transfert est additif : aucun fichier de `src/` n’a été remplacé par le package CLASSE.

Le package CLASSE reste exécutable de manière indépendante avec son propre `package.json`, `vite.config.ts`, `tsconfig.json` et `src/main.tsx`. Son code a été transféré depuis le commit Idealy `d4f5475` afin de conserver la version complète vérifiée, sans dépendre d’un chemin temporaire local.

## Sources archivées

Le dossier `docs/maquette-classe/` contient les écrans et HTML de la maquette Stitch, le document `CLASSE_cahier_des_charges_plus_fonctionnalites_Zeno.md` fourni séparément et le document de design `luminous_institutional/DESIGN.md`.
