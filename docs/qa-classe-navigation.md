# QA navigation CLASSE

La racine du dépôt ZENO affiche CLASSE. Après authentification locale, la navigation latérale démarre rétractée : le logo C reste visible, les libellés sont masqués, chaque icône conserve un `title` et un `aria-label`, et un bouton permet de déployer la navigation. Le contenu principal s’élargit pour occuper l’espace libéré.

La top bar n’est plus rendue sur écran desktop. Le statut de synchronisation reste une bande légère dans le contenu, sans top bar ni recherche globale persistante. Sur mobile, le bouton d’ouverture de navigation est séparé du contenu et la sidebar devient un panneau coulissant.

La preview locale a été contrôlée sur `http://localhost:4175/`. Les boutons `Déployer la navigation`, les entrées de menu, l’utilisateur et les notifications sont présents. Le typecheck, la build de production et le diff whitespace passent avant publication.
