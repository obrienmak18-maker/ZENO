# QA navigation CLASSE

La racine du dépôt ZENO affiche CLASSE. Après authentification locale, la navigation latérale démarre rétractée : le logo C reste visible, les libellés sont masqués, chaque icône conserve un `title` et un `aria-label`, et un bouton permet de déployer la navigation. Le contenu principal s’élargit pour occuper l’espace libéré.

La top bar n’est plus rendue sur écran desktop. Le statut de synchronisation reste une bande légère dans le contenu, sans top bar ni recherche globale persistante. Sur mobile, le bouton d’ouverture de navigation est séparé du contenu et la sidebar devient un panneau coulissant.

La preview locale a été contrôlée sur `http://localhost:4175/`. Les boutons `Déployer la navigation`, les entrées de menu, l’utilisateur et les notifications sont présents. Le typecheck, la build de production et le diff whitespace passent avant publication.

Le module Élèves affiche les données réellement présentes. Le formulaire d’inscription a été validé avec un élève de test : le compteur est passé de 8 à 9, le code automatique EL009 a été créé et le compteur de la classe associée a été mis à jour. Les données ont été contrôlées dans `localStorage`, puis l’élève de test et l’état de session ont été nettoyés pour laisser la preview dans un état neutre.

La déconnexion a été testée : elle ramène à l’écran d’entrée QR CLASSE. Le typecheck, la build de production et `git diff --check` passent. La couche Cloud Functions a également été compilée avec succès dans `functions/`.
