# Zeno — état d’implémentation

## Fondation produit

Zeno est livré dans le dépôt GitHub dédié `obrienmak18-maker/ZENO`. Le dépôt ne contient aucun code, token ou réglage d’Idealy. Le langage visuel reste celui de Stitch : Inter, Zeno Blue, surfaces lavande très claires, hiérarchie institutionnelle, espaces généreux et ombres discrètes. Les parcours UXPilot sont intégrés lorsqu’ils améliorent l’action quotidienne.

## Fonctionnalités disponibles

Le shell dispose d’une navigation adaptée aux rôles Directeur, Enseignant, Secrétaire et Comptable. Le Directeur voit les opérations générales ; l’Enseignant voit ses tâches, classes, présences et notes ; le Secrétaire voit les inscriptions et opérations administratives ; le Comptable voit les finances. Les modules Notes, Bulletins, Planning, Présences, Finances, Rapports, Administration, Notifications, Activité et Paramètres sont accessibles depuis le workspace.

L’onboarding accessible avec `?onboarding=1` suit une configuration progressive : bienvenue, identité de l’établissement, forme, statut, niveaux pédagogiques, structure proposée et confirmation finale. La configuration est conservée sur l’appareil et distingue correctement le nom de l’établissement, son statut et les niveaux enseignés.

Le parcours Élèves permet l’ajout d’un élève, la recherche, la conservation locale et l’import CSV. L’import analyse les lignes, ignore les doublons exacts et signale le nombre d’élèves ajoutés. La présence permet de choisir Présent, Retard ou Absent, recalcule les compteurs et conserve les choix localement. Les notes sont éditables, la moyenne est recalculée et un lot passe de Brouillon à Soumis. Les paiements peuvent être enregistrés avec élève, montant, mode, date et référence. Les rapports exportent une synthèse JSON et les bulletins offrent un aperçu imprimable.

## Vérifications

Le dépôt passe `npm run typecheck`, `npm run build` et `git diff --check`. Le rendu a été vérifié dans une prévisualisation locale séparée du port utilisé par l’ancien package Idealy. Les tests manuels ont couvert l’onboarding, l’import CSV avec doublon, la modification d’une note, la soumission d’un lot et l’ouverture du module financier. Les résultats détaillés sont dans `docs/zeno-qa.md`.

## Limites assumées avant production

La version actuelle est une tranche fonctionnelle frontend avec persistance navigateur. Elle ne doit pas encore recevoir de données scolaires sensibles en production. Il reste à brancher Supabase dans un projet dédié Zeno, appliquer la migration et les politiques RLS, ajouter l’authentification réelle, l’évaluation serveur des permissions, la synchronisation offline, les documents privés, les transitions d’année et les workflows complets de validation des bulletins.

Le choix `Mobile Money · test` est explicitement un mode de démonstration. Aucune intégration Orange Money, Airtel Money ou M-Pesa n’est simulée comme réelle. Les portails parent et élève restent hors du périmètre initial, conformément au cahier des charges.

## Publication

Le dépôt est prêt à être importé manuellement dans Vercel avec `Root Directory: .`, `Framework: Vite`, `Build Command: npm run build`, `Output Directory: dist/public` et branche de production `main`. Aucun déploiement Vercel n’est exécuté par cette livraison.
