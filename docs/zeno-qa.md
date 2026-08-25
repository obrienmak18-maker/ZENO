# Zeno — journal QA

## Vérification locale

La prévisualisation du dépôt ZENO sur le port 4175 affiche l’écran d’accueil de l’onboarding Zeno avec les étapes Bienvenue, Identité, Établissement, Statut, Niveaux, Structure et Finaliser. La version affichée est distincte de l’ancienne prévisualisation Idealy. Le rendu conserve les surfaces Stitch, la typographie Inter, l’espace blanc et les accents Zeno Blue.

L’onboarding a été vérifié jusqu’à la finalisation : les champs sont préremplis avec les données de démonstration, les choix d’établissement et de statut restent modifiables, Primaire est sélectionnable et la structure « 1ère à 6ème primaire » est proposée. Le bouton « Entrer dans Zeno » revient au dashboard Directeur avec un toast de confirmation. Le garde-fou ajouté vérifie qu’une école active existe avant d’appeler le bootstrap Supabase, afin qu’une reconfiguration ne crée pas un nouveau tenant.

Le parcours d’import CSV a été testé avec trois lignes, dont un doublon. Zeno a ajouté deux élèves, ignoré le doublon et affiché un toast explicite. L’action est un traitement local réel pour les fichiers CSV.

Le module Notes a été vérifié : la note de Kevin Mukendi a été modifiée de 15 à 18 et la moyenne de classe s’est recalculée immédiatement. Le lot de notes passe de Brouillon à Soumis avec un toast de confirmation. Le module Finances s’ouvre avec un tableau de mouvements, références, modes de paiement et bouton d’enregistrement. Les bulletins sont imprimables et les rapports exportent une synthèse JSON.

## Authentification et production

Une prévisualisation isolée avec des variables Supabase de test affiche correctement le garde d’authentification : connexion e-mail/mot de passe, création de compte, affichage/masquage du mot de passe et mode local explicite. Le bouton de mode local ouvre le workspace sans appeler la base de test. Le build sans variables Supabase conserve automatiquement le mode local.

Le projet Supabase Zeno `pjrwkppngrpkaedfuunh` est actif. Les dix-huit tables Zeno ont été vérifiées avec RLS activé et zéro ligne initiale. Les migrations de durcissement et d’inscription sont enregistrées dans l’historique Supabase. La RPC `zeno_create_student_with_enrollment` a été vérifiée comme `SECURITY INVOKER`, et les advisors sécurité ne remontent aucune alerte.

Le projet Vercel `zeno-school-live` possède les deux variables de production publiques attendues et son domaine [zeno-school-live.vercel.app](https://zeno-school-live.vercel.app) répond avec le workspace Zeno. Le déploiement lancé depuis l’interface Vercel est marqué Ready. La tentative de publier automatiquement le dernier commit via l’API a toutefois reçu une réponse `403` de permission ; la liaison GitHub interactive a également demandé une authentification qui n’était pas disponible dans la session. Le dépôt et l’archive manuelle restent prêts pour une publication par le propriétaire du compte.

## Limites explicitement vérifiées

La prévisualisation n’a utilisé aucune donnée scolaire réelle et aucun projet Idealy n’a été modifié pendant ces contrôles. L’ajout individuel connecté est prévu pour créer l’élève et son enrollment côté Supabase lorsque l’année et la classe active existent. L’import CSV, les présences, les notes, les paiements et les rapports restent des workflows locaux jusqu’à l’ajout de leurs mutations serveur tenant-aware. Le libellé `Mobile Money · test` n’est pas une intégration de paiement réelle.
