# Constat QA navigateur — desktop local

Le serveur Vite répond sur `http://localhost:4174/` et expose le titre `CLASSE — La gestion scolaire avec style`, mais la capture affiche une page blanche. Aucun élément interactif n’est détecté et la console navigateur ne renvoie aucun message. Ce constat doit être résolu avant de déclarer la validation navigateur terminée.

Après rechargement, Chromium télécharge bien `/src/main.tsx`, `/src/App.tsx` et les dépendances Firebase/Vite, mais `#root` reste vide. Le problème est donc un échec de montage runtime plutôt qu’un chemin HTTP introuvable. La cause doit être isolée côté module/exécution.

Après alignement de React et React DOM en 19.1.0, le desktop se monte correctement. La capture montre CLASSE, la sidebar rétractée avec logo visible, sans topbar permanente, et le clic vers Élèves ouvre bien la liste et ses actions.
