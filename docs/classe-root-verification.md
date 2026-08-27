# CLASSE à la racine de ZENO

La branche `main` de ZENO est désormais l’application CLASSE. Le package CLASSE a été déplacé de `artifacts/zeno/` vers la racine afin que `npm run dev`, `npm run typecheck` et `npm run build` s’exécutent directement depuis le dépôt.

Les écrans et fichiers HTML de la maquette restent archivés dans `docs/maquette-classe/`. L’état précédent de ZENO est conservé sur la branche distante `backup/zeno-before-classe-replacement-20260827041919` et dans une archive locale avec empreinte SHA-256.

La validation navigateur sur `http://localhost:4175/` a confirmé le titre CLASSE, l’écran d’entrée QR, la saisie manuelle et l’ouverture du dashboard après connexion locale. Le typecheck et la build de production de la racine passent.
