# Zeno — état d’implémentation

## Fondation produit

Zeno est livré dans le dépôt GitHub dédié `obrienmak18-maker/ZENO`. Le dépôt ne contient aucun code, token ou réglage d’Idealy. Le langage visuel reste celui de Stitch : Inter, Zeno Blue, surfaces lavande très claires, hiérarchie institutionnelle, espaces généreux et ombres discrètes. Les parcours UXPilot sont intégrés lorsqu’ils améliorent l’action quotidienne.

## Fonctionnalités disponibles

Le shell dispose d’une navigation adaptée aux rôles Directeur, Enseignant, Secrétaire et Comptable. Le Directeur voit les opérations générales ; l’Enseignant voit ses tâches, classes, présences et notes ; le Secrétaire voit les inscriptions et opérations administratives ; le Comptable voit les finances. Les modules Notes, Bulletins, Planning, Présences, Finances, Rapports, Administration, Notifications, Activité et Paramètres sont accessibles depuis le workspace.

L’onboarding accessible avec `?onboarding=1` suit une configuration progressive : bienvenue, identité de l’établissement, forme, statut, niveaux pédagogiques, structure proposée et confirmation finale. La configuration est conservée sur l’appareil. Lorsqu’une école active existe déjà, une reconfiguration ne relance pas le bootstrap et ne crée pas accidentellement un second tenant.

Le parcours Élèves permet l’ajout d’un élève, la recherche, la conservation locale et l’import CSV. L’import analyse les lignes, ignore les doublons exacts et signale le nombre d’élèves ajoutés. La présence permet de choisir Présent, Retard ou Absent, recalcule les compteurs et conserve les choix localement. Les notes sont éditables, la moyenne est recalculée et un lot passe de Brouillon à Soumis. Les paiements peuvent être enregistrés avec élève, montant, mode, date et référence. Les rapports exportent une synthèse JSON et les bulletins offrent un aperçu imprimable.

## Socle Supabase Zeno

La base dédiée est le projet Supabase `pjrwkppngrpkaedfuunh` (`supabase-indigo-dog`). Les dix-huit tables Zeno sont tenant-scoped, ont RLS activé et sont vides par défaut. Le bootstrap authentifié crée une école, une année active, les rôles, un niveau Primaire, deux classes, deux matières, une période de notes et une entrée d’audit.

Les helpers privilégiés ont été déplacés dans le schéma privé par `20260825000002_zeno_security_hardening.sql`. La migration `20260825000003_zeno_student_enrollment.sql` ajoute la RPC `zeno_create_student_with_enrollment`, qui vérifie l’accès au tenant, l’année active et la classe, puis crée de manière atomique l’élève et son enrollment. La RPC publique est `SECURITY INVOKER`, et son exécution est accordée uniquement au rôle `authenticated`. Les advisors sécurité Supabase ne remontent actuellement aucune alerte.

## Vérifications

Le dépôt passe `npm run typecheck`, `npm run build` et `git diff --check`. Le rendu a été vérifié dans une prévisualisation locale séparée du port utilisé par l’ancien package Idealy. Les tests manuels ont couvert l’onboarding, l’import CSV avec doublon, la modification d’une note, la soumission d’un lot, l’ouverture du module financier, l’écran Auth et le mode local explicite. Les résultats détaillés sont dans `docs/zeno-qa.md`.

## Limites assumées avant production complète

La connexion, l’onboarding initial et l’ajout individuel d’un élève avec son enrollment sont reliés à Supabase. L’import CSV, les présences, les notes, les paiements et les rapports restent fonctionnels localement mais ne doivent pas encore être décrits comme synchronisés côté serveur. Il reste à ajouter leurs mutateurs serveur tenant-aware, ainsi que les documents privés, la synchronisation offline, les transitions d’année et les workflows complets de validation des bulletins.

Le choix `Mobile Money · test` est explicitement un mode de préparation UX. Aucune intégration Orange Money, Airtel Money ou M-Pesa n’est simulée comme réelle. Les portails parent et élève restent hors du périmètre initial, conformément au cahier des charges.

## Publication

Le projet Vercel cible est `zeno-school-live`, avec le domaine [zeno-school-live.vercel.app](https://zeno-school-live.vercel.app). Les variables de production `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont enregistrées dans ce projet uniquement. Le domaine public répond et affiche le workspace Zeno. Une tentative de publication directe du dernier commit a été refusée par Vercel avec une erreur de permission `403`; le dépôt reste donc prêt pour l’import manuel ou la réautorisation de la connexion GitHub/Vercel. Le paquet `zeno-vercel-manual-upload.zip` accompagne cette remise.

Aucune opération récente n’a touché le dépôt Idealy, Netlify Idealy, le projet Vercel `inia` ou la base Supabase `IDEALY`.
