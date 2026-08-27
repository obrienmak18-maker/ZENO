`
# INSTRUCTIONS COMPLÈTES DE DÉVELOPPEMENT
# APPLICATION CLASSE – Gestion Scolaire Multi-Établissements

## 🎯 OBJECTIF FINAL
Développer intégralement une plateforme de gestion scolaire nommée CLASSE, fonctionnelle, prête à être déployée, avec un niveau de finition premium. L'application doit être multi-établissements (chaque école a ses propres données isolées), avec une version Desktop pour l'administration et une version Mobile pour les professeurs et comptables.

---

## 👤 CRÉDITS
- **Créateur :** O'Brien Mak
- **Design :** Inspiration Maya Le Clark (Nickelodeon moderne, épuré, lumineux, premium)
- **Nom de l'application :** CLASSE
- **Slogan :** "La gestion scolaire avec style"

---

## 🏗️ STACK TECHNIQUE

### Backend (Cloud Firebase)
- **Base de données :** Cloud Firestore (NoSQL)
- **Authentification :** Firebase Authentication (Custom Tokens)
- **Fonctions serverless :** Firebase Cloud Functions (Node.js 20, TypeScript)
- **Stockage fichiers :** Firebase Storage (bulletins PDF, logos école)
- **Hébergement :** Firebase Hosting (optionnel, pour PWA admin)

### Frontend Desktop (Administration, Comptabilité)
- **Framework :** Tauri 2.0 (fenêtre native légère, ~5 Mo)
- **Frontend :** React 19 + TypeScript 5.4
- **Build tool :** Vite 5
- **Style :** Tailwind CSS 3.4
- **Icônes :** Lucide React
- **PDF :** @react-pdf/renderer (génération bulletins)

### Frontend Mobile (Professeurs, Comptables)
- **Framework :** Expo SDK 52 (React Native 0.76)
- **Navigation :** Expo Router 4 (file-based routing)
- **Style :** Tailwind CSS via NativeWind 4
- **Caméra :** expo-camera (scan QR Code)
- **Icônes :** Lucide React Native
- **Notifications :** expo-notifications

### Monorepo
- **Orchestration :** Turborepo 2
- **Gestionnaire de paquets :** pnpm 9
- **Partage de code :** packages/shared (types, utils, hooks)

---

## 📐 1. ARCHITECTURE MULTI-TENANCY (ISOLATION DES ÉCOLES)

### Principe fondamental
Chaque école possède un `school_id` unique (UUID v4). **Toutes** les données sont filtrées par ce `school_id`. Aucune école ne peut voir les données d'une autre école. Cette isolation est garantie à deux niveaux : Firestore Rules (serveur) et filtres dans le code (client).

### Structure complète de Firestore

```

ecoles/
{school_id}/
├── nom: string
├── logo: string (URL Firebase Storage)
├── adresse: string
├── telephone: string
├── anneeScolaireActive: string (ex: "2025-2026")
├── dateCreation: Timestamp
│
├── classes/
│   {classe_id}/
│     ├── nom: string (ex: "7ème A")
│     ├── niveau: number (7, 8, 1, 2, 3, 4)
│     ├── groupe: string ("A", "B", "C"...)
│     ├── sectionId: string | null
│     ├── anneeScolaireId: string
│     ├── titulaireId: string (profile_id du titulaire)
│     ├── capacite: number
│     └── createdAt: Timestamp
│
├── sections/
│   {section_id}/
│     ├── nom: string ("Scientifique", "Commerciale", "Construction", "Générale")
│     └── description: string
│
├── eleves/
│   {eleve_id}/
│     ├── codeUnique: string (auto-incrémenté, format EL001)
│     ├── nom: string
│     ├── postnom: string
│     ├── prenom: string
│     ├── dateNaissance: Timestamp
│     ├── lieuNaissance: string
│     ├── commune: string
│     ├── sexe: "M" | "F"
│     ├── classeId: string
│     ├── photoUrl: string | null
│     ├── statut: "ACTIF" | "ABANDON" | "TRANSFERE"
│     ├── createdAt: Timestamp
│     └── updatedAt: Timestamp
│     │
│     ├── notes/
│     │   {note_id}/
│     │     ├── matiereId: string
│     │     ├── trimestreId: string
│     │     ├── note: float (sur 100)
│     │     ├── appreciation: string | null
│     │     ├── saisiParId: string (profile_id du prof)
│     │     ├── estValide: boolean
│     │     ├── createdAt: Timestamp
│     │     └── updatedAt: Timestamp
│     │
│     ├── paiements/
│     │   {paiement_id}/
│     │     ├── montantPaye: float
│     │     ├── montantTotal: float
│     │     ├── motif: "INSCRIPTION" | "MENSUALITE" | "EXAMEN" | "AUTRE"
│     │     ├── statutPaiement: "NORMAL" | "ECHELONNE" | "EXONERE" | "BOURSIER"
│     │     ├── recu: string (numéro reçu)
│     │     ├── commentaire: string | null
│     │     ├── enregistreParId: string (profile_id du comptable)
│     │     ├── datePaiement: Timestamp
│     │     └── createdAt: Timestamp
│     │
│     └── presences/
│         {presence_id}/
│           ├── date: Timestamp
│           ├── statut: "PRESENT" | "ABSENT" | "RETARD" | "EXCUSE"
│           ├── creneauId: string
│           ├── matiereId: string
│           ├── enregistreParId: string (profile_id du prof)
│           └── createdAt: Timestamp
│
├── matieres/
│   {matiere_id}/
│     ├── nom: string ("Mathématiques", "Français"...)
│     ├── coefficient: number
│     ├── classeId: string
│     ├── professeurId: string | null
│     └── createdAt: Timestamp
│
├── trimestres/
│   {trimestre_id}/
│     ├── numero: number (1, 2, 3)
│     ├── libelle: string ("Premier Trimestre"...)
│     ├── dateDebut: Timestamp
│     ├── dateFin: Timestamp
│     ├── anneeScolaireId: string
│     └── createdAt: Timestamp
│
├── anneesScolaires/
│   {annee_id}/
│     ├── libelle: string ("2025-2026")
│     ├── dateDebut: Timestamp
│     ├── dateFin: Timestamp
│     ├── estActive: boolean
│     └── createdAt: Timestamp
│
├── bulletins/
│   {bulletin_id}/
│     ├── eleveId: string
│     ├── classeId: string
│     ├── trimestreId: string
│     ├── moyenneGenerale: float
│     ├── rang: number
│     ├── mention: "ECHEC" | "PASSABLE" | "SATISFACTION" | "DISTINCTION" | "GRANDE_DISTINCTION"
│     ├── pourcentage: float
│     ├── total: float
│     ├── estBloque: boolean
│     ├── forceImpression: boolean
│     ├── fichierPdf: string | null
│     ├── createdAt: Timestamp
│     └── imprimeLe: Timestamp | null
│
├── emploiDuTemps/
│   {jour}/
│     creneaux/
│       {creneau_id}/
│         ├── jour: "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI"
│         ├── heureDebut: string ("08:00")
│         ├── heureFin: string ("09:30")
│         ├── numeroHeure: number (1 à 10)
│         ├── matiereId: string
│         ├── classeId: string
│         ├── professeurId: string
│         └── createdAt: Timestamp
│
├── qr_tokens/
│   {token_id}/
│     ├── profileId: string
│     ├── schoolId: string
│     ├── role: "PROFESSEUR" | "COMPTABLE"
│     ├── statut: "pending" | "used" | "revoked" | "expired"
│     ├── createdAt: Timestamp
│     ├── expiresAt: Timestamp
│     ├── usedAt: Timestamp | null
│     ├── usedFromDevice: string | null
│     ├── revokedBy: string | null
│     └── revokedAt: Timestamp | null
│
└── messages/
{message_id}/
├── expediteurId: string
├── destinataireId: string
├── contenu: string
├── dateEnvoi: Timestamp
├── lu: boolean
└── createdAt: Timestamp

profiles/
{user_id}/
├── email: string (email Firebase Auth)
├── telephone: string (numéro unique)
├── nom: string
├── postnom: string | null
├── prenom: string | null
├── role: "ADMINISTRATEUR" | "PROFESSEUR" | "COMPTABLE"
├── school_id: string
├── photoUrl: string | null
├── actif: boolean
├── createdAt: Timestamp
└── updatedAt: Timestamp

```

### Règles Firestore complètes

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function userSchoolId() {
      return request.auth.token.school_id;
    }
    
    function userRole() {
      return request.auth.token.role;
    }
    
    function isAdmin() {
      return userRole() == 'ADMINISTRATEUR';
    }
    
    function isProf() {
      return userRole() == 'PROFESSEUR';
    }
    
    function isComptable() {
      return userRole() == 'COMPTABLE';
    }
    
    function sameSchool(schoolId) {
      return userSchoolId() == schoolId;
    }
    
    // Profiles : lecture limitée à son école, écriture limitée à soi-même ou admin
    match /profiles/{userId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == userId || 
         (isAdmin() && resource.data.school_id == userSchoolId()));
      allow create: if isAuthenticated() && isAdmin();
      allow update: if isAuthenticated() && 
        (request.auth.uid == userId || isAdmin());
      allow delete: if isAuthenticated() && isAdmin();
    }
    
    // Données des écoles
    match /ecoles/{schoolId} {
      allow read: if isAuthenticated() && sameSchool(schoolId);
      allow create: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      allow update: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      allow delete: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      
      // Classes
      match /classes/{docId} {
        allow read: if isAuthenticated() && sameSchool(schoolId);
        allow write: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      }
      
      // Sections
      match /sections/{docId} {
        allow read: if isAuthenticated() && sameSchool(schoolId);
        allow write: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      }
      
      // Élèves
      match /eleves/{eleveId} {
        allow read: if isAuthenticated() && sameSchool(schoolId);
        allow write: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
        
        // Notes
        match /notes/{noteId} {
          allow read: if isAuthenticated() && sameSchool(schoolId);
          allow create, update: if isAuthenticated() && sameSchool(schoolId) && 
            (isAdmin() || (isProf() && request.resource.data.saisiParId == request.auth.uid));
          allow delete: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
        }
        
        // Paiements
        match /paiements/{paiementId} {
          allow read: if isAuthenticated() && sameSchool(schoolId);
          allow create, update: if isAuthenticated() && sameSchool(schoolId) && 
            (isAdmin() || isComptable());
          allow delete: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
        }
        
        // Présences
        match /presences/{presenceId} {
          allow read: if isAuthenticated() && sameSchool(schoolId);
          allow create: if isAuthenticated() && sameSchool(schoolId) && 
            (isAdmin() || (isProf() && request.resource.data.enregistreParId == request.auth.uid));
          allow delete: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
        }
      }
      
      // Matières
      match /matieres/{docId} {
        allow read: if isAuthenticated() && sameSchool(schoolId);
        allow write: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      }
      
      // Trimestres
      match /trimestres/{docId} {
        allow read: if isAuthenticated() && sameSchool(schoolId);
        allow write: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      }
      
      // Années scolaires
      match /anneesScolaires/{docId} {
        allow read: if isAuthenticated() && sameSchool(schoolId);
        allow write: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      }
      
      // Bulletins
      match /bulletins/{docId} {
        allow read: if isAuthenticated() && sameSchool(schoolId);
        allow write: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      }
      
      // Emploi du temps
      match /emploiDuTemps/{jour}/creneaux/{docId} {
        allow read: if isAuthenticated() && sameSchool(schoolId);
        allow write: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
      }
      
      // QR Tokens : accès spécial pour vérification avant auth
      match /qr_tokens/{tokenId} {
        allow read: if true; // Doit être lisible pour le scan avant connexion
        allow create: if isAuthenticated() && isAdmin() && sameSchool(schoolId);
        allow update: if isAuthenticated() && 
          (isAdmin() && sameSchool(schoolId));
      }
      
      // Messages
      match /messages/{docId} {
        allow read: if isAuthenticated() && sameSchool(schoolId) &&
          (resource.data.expediteurId == request.auth.uid || 
           resource.data.destinataireId == request.auth.uid);
        allow create: if isAuthenticated() && sameSchool(schoolId);
        allow update: if isAuthenticated() && 
          (resource.data.destinataireId == request.auth.uid);
      }
    }
  }
}
```

---

🔐 2. AUTHENTIFICATION QR CODE (USAGE UNIQUE)

Principe

· L'Admin génère un QR Code pour un membre du personnel (Prof ou Comptable)
· Le QR Code est valable 15 minutes et scannable une seule fois
· Le scan connecte instantanément l'utilisateur sans aucune saisie de texte
· En cas de re-scan : message "Ce QR Code a déjà été utilisé"
· En cas d'expiration : message "QR Code expiré, demandez-en un nouveau"
· En cas de révocation par l'Admin : message "QR Code révoqué par l'administration"
· Si téléphone perdu/volé : Admin révoque et régénère, toutes les données sont conservées sur Firebase

Cloud Functions nécessaires

Fonction 1 : generateQRAuthToken

· Déclenchée par : appel HTTP depuis le mobile après scan réussi
· Paramètres : { tokenId: string, schoolId: string }
· Vérifie : token existe, statut === "pending", expiresAt > now
· Actions : passe le statut à "used", enregistre usedAt et usedFromDevice
· Retourne : { customToken: string } (Firebase Custom Token)

Fonction 2 : revokeAllUserTokens

· Déclenchée par : appel HTTP depuis le desktop admin
· Paramètres : { profileId: string, schoolId: string }
· Actions : tous les tokens pending/used de ce profil passent à "revoked"
· Retourne : { revokedCount: number }

Écran Mobile "Scan QR Code"

· S'ouvre automatiquement au lancement de l'app si non connecté
· Utilise expo-camera CameraView en plein écran
· Une bordure animée violette (#7C3AED) entoure la zone de scan
· Un texte "Scannez votre QR Code" centré en bas
· Au scan réussi : vibration légère + transition fluide vers le dashboard
· Au scan échoué : Message toast rouge avec l'erreur, la caméra reste active pour un nouveau scan
· Bouton "Besoin d'aide ?" en bas → affiche instructions simples

Écran Desktop "Générer QR Code"

· Liste déroulante des profils (Professeurs et Comptables actifs)
· Bouton "Générer QR Code" → affiche le QR Code en grand
· Timer visible : "Expire dans 14:30" (décompte en temps réel)
· Le QR Code est généré avec la librairie qrcode côté desktop
· Contient uniquement : JSON.stringify({ tokenId, schoolId })
· Bouton "Annuler" pour révoquer immédiatement le token
· Après expiration automatique → le QR disparaît, message "Expiré"

---

⏰ 3. LOGIQUE D'APPEL (PRÉSENCES) AVEC RESTRICTION HORAIRE

Principe

· Le bouton "Faire l'Appel" n'apparaît sur le mobile du prof QUE pendant son créneau horaire actuel
· Si le prof est prévu à la 3ème heure, il ne peut pas voir ni modifier l'appel de la 1ère heure
· Logique de saisie inversée : le prof coche UNIQUEMENT les absents (ou les présents, au choix de l'école dans les paramètres)
· Par défaut : cocher = présent, non-coché = absent

Algorithme côté mobile (hook useAppelDisponible)

1. Récupérer l'heure actuelle via new Date()
2. Formater en "HH:MM"
3. Déterminer le jour actuel (LUNDI, MARDI...)
4. Query Firestore : ecoles/{schoolId}/emploiDuTemps/{jour}/creneaux où professeurId == currentUser.uid
5. Trouver le créneau où heureDebut <= heureActuelle <= heureFin
6. Si trouvé → retourner { disponible: true, creneau: CreneauHoraire, classe: Classe, matiere: Matiere }
7. Si non trouvé → retourner { disponible: false, message: "Aucun appel en cours" }

Écran "Appel" Mobile

· Navigation : (prof)/(tabs)/appel.tsx
· Si appel indisponible : afficher message "Aucun appel en cours - Prochain créneau : [jour] [heure]"
· Si appel disponible :
  · Header : "Appel - {nomMatiere} - {nomClasse}"
  · Liste des élèves de la classe (triés par nom)
  · Chaque élève : avatar (initiales si pas de photo), nom complet, toggle switch (cocher = présent)
  · Par défaut : tous les switchs sont OFF (absent)
  · Bouton "Tout marquer présent" en haut à droite
  · Bouton "Enregistrer l'appel" en bas (sticky, large, violet)
  · À la validation : confirmation modale "X présents, Y absents - Confirmer ?"
  · Une fois enregistré : succès toast vert, les données sont persistées

Stockage des présences

· Batch write Firestore pour performance
· Pour chaque élève de la classe, créer un document dans ecoles/{schoolId}/eleves/{eleveId}/presences/{presenceId}
· presenceId = ${creneauId}_${date}_${eleveId} (pour éviter les doublons)

---

🧮 4. MOTEUR DE CALCUL AUTOMATIQUE (BULLETINS)

Cloud Function : calculerBulletin

· Déclencheur : Firestore onDocumentWritten sur ecoles/{schoolId}/eleves/{eleveId}/notes/{noteId}
· Actions :
  1. Récupérer toutes les notes de l'élève pour le trimestre concerné
  2. Pour chaque note, récupérer le coefficient de la matière
  3. Calculer le total pondéré = Σ(note × coefficient)
  4. Calculer la moyenne = total pondéré / Σ(coefficients)
  5. Récupérer toutes les moyennes des élèves de la même classe et trimestre
  6. Calculer le rang (avec gestion ex-aequo : 1er, 2ème, 2ème, 3ème)
  7. Déterminer la mention : ≥80 Grande Distinction, ≥70 Distinction, ≥60 Satisfaction, ≥50 Passable, <50 Échec
  8. Calculer le pourcentage = moyenne (déjà sur 100)
  9. Créer/mettre à jour le document dans ecoles/{schoolId}/bulletins/
  10. Vérifier le statut de paiement de l'élève : si statut NORMAL et paiements insuffisants → estBloque = true

Fonctions utilitaires partagées (packages/shared/src/utils/calculs.ts)

```typescript
export function calculerMoyenne(notes: NoteAvecCoefficient[]): number {
  const total = notes.reduce((sum, n) => sum + n.note * n.coefficient, 0);
  const sommeCoeffs = notes.reduce((sum, n) => sum + n.coefficient, 0);
  return sommeCoeffs > 0 ? total / sommeCoeffs : 0;
}

export function calculerRang(moyenneEleve: number, toutesMoyennes: number[]): number {
  const triees = [...toutesMoyennes].sort((a, b) => b - a);
  let rang = 1;
  for (const moy of triees) {
    if (moy > moyenneEleve) rang++;
    else break;
  }
  return rang;
}

export function determinerMention(moyenne: number): string {
  if (moyenne >= 80) return 'GRANDE_DISTINCTION';
  if (moyenne >= 70) return 'DISTINCTION';
  if (moyenne >= 60) return 'SATISFACTION';
  if (moyenne >= 50) return 'PASSABLE';
  return 'ECHEC';
}
```

Interface de calcul côté Desktop Admin

· Bouton "Recalculer tous les bulletins" pour le trimestre sélectionné
· Bouton "Forcer l'impression" pour débloquer un bulletin malgré paiements insuffisants
· Génération PDF automatique du bulletin

---

📊 5. INTERFACES UTILISATEUR

5.1 Desktop Admin (Tauri + React)

Structure des pages : Dashboard, Élèves, Classes, Emploi du Temps, QR Codes, Bulletins, Comptabilité, Paramètres, Messagerie.

Dashboard (page d'accueil)

· Cartes statistiques : nombre total élèves, filles, garçons, taux réussite, paiements en attente
· Graphique : répartition élèves par classe (barres horizontales)
· Liste des 5 derniers élèves inscrits
· Liste des 5 derniers paiements
· Activité récente : "Prof BAHATI a saisi les notes de 7ème A", "Comptable a enregistré 5 paiements"

Élèves

· Tableau avec toutes les colonnes (codeUnique, nom, postnom, prenom, sexe, classe, statut)
· Tri par n'importe quelle colonne
· Barre de recherche (recherche dans nom, postnom, prenom)
· Filtres : classe, section, sexe, statut
· Bouton "Ajouter un élève" → formulaire complet
· Import Excel/CSV possible
· Auto-génération du codeUnique (EL001, EL002...)
· Clic sur un élève → page détail avec notes, paiements, présences, bulletin
· Bouton "Modifier", "Désactiver", "Transférer de classe"

QR Codes

· Sélection d'un membre du personnel (Prof ou Comptable)
· Bouton "Générer QR Code"
· Affichage du QR Code en grand
· Timer de 15 minutes avec barre de progression
· Historique des QR Codes générés (avec statut : utilisé, expiré, révoqué)

Emploi du Temps

· Grille hebdomadaire (Lundi à Samedi, 1ère à 10ème heure)
· Chaque case = créneau avec matière + prof + classe
· Clic sur une case → modal de modification
· Drag and drop pour déplacer un créneau
· Possibilité de dupliquer une semaine type

Bulletins

· Sélection : classe + trimestre
· Tableau des moyennes : élève, moyenne, rang, mention, statut paiement, actions
· Bouton "Générer PDF" par élève ou pour toute la classe
· Bouton "Forcer impression" sur élèves avec paiements insuffisants
· Les PDF sont stockés dans Firebase Storage et accessibles via URL

Comptabilité

· Vue d'ensemble : total attendu, total reçu, reste à recouvrer
· Tableau des élèves avec statut de paiement (NORMAL, ECHELONNE, EXONERE, BOURSIER)
· Filtre : classe, statut
· Clic sur un élève → historique des paiements + formulaire nouveau paiement
· Bouton "Enregistrer un paiement" → modal avec montant, motif, date
· Génération de reçu imprimable
· Alertes visuelles : rouge si impayé, orange si partiel, vert si complet

Paramètres

· Informations école : nom, logo, adresse, téléphone, année scolaire active
· Gestion classes : créer, modifier, supprimer
· Gestion sections : créer, modifier, supprimer
· Gestion matières : créer, modifier, supprimer, assigner professeur
· Gestion trimestres : créer, dater
· Gestion profil Admin : photo, nom, téléphone

5.2 Mobile Prof (Expo + React Native)

Structure : Scan QR → Dashboard → Onglets (Horaire, Appel, Notes, Messages, Profil)

Écran de Scan QR (auth/scan.tsx)

· Caméra plein écran
· Zone de scan avec contour violet animé
· Texte "Scannez votre QR Code"
· Aucun bouton de navigation (flux forcé : scan → dashboard)
· Toast en cas d'erreur

Dashboard (prof/(tabs)/index.tsx)

· "Bonjour, {prenom}" en haut
· Carte "Prochain cours" avec matière, classe, heure, salle
· Si créneau actif → bouton "Faire l'Appel" (violet, pulsation légère)
· Si pas de créneau → message "Pas de cours en ce moment"
· Liste des cours du jour (emploi du temps complet)
· Badge notifications messages non lus

Appel (prof/(tabs)/appel.tsx)

· Voir description section 3
· Accessible uniquement via le bouton du dashboard (vérification créneau actif)

Notes (prof/(tabs)/notes.tsx)

· Sélection de la classe (liste déroulante, UNIQUEMENT ses classes)
· Sélection de la matière (UNIQUEMENT ses matières assignées)
· Sélection du trimestre
· Tableau des élèves avec champ de saisie note + appreciation
· Clavier numérique optimisé pour saisie rapide
· Sauvegarde automatique quand on quitte le champ (débounce 500ms)
· Indicateur visuel : vert si note sauvegardée, gris si en attente

Messages (prof/messagerie.tsx)

· Liste des conversations (filtrée par école)
· Nouveau message : sélectionner destinataire (liste collègues)
· Chat temps réel via Firestore onSnapshot

Profil (prof/(tabs)/profil.tsx)

· Photo, nom, rôle, école
· Bouton "Se déconnecter" → confirmation → signOut → retour écran scan

5.3 Mobile Comptable (Expo + React Native)

Structure : Scan QR → Dashboard → Onglets (Paiements, Débiteurs, Profil)

Paiements (comptable/(tabs)/paiements.tsx)

· Recherche élève par nom ou code
· Fiche élève : nom, classe, photo, statut paiement
· Bouton "Enregistrer paiement" → modal avec montant, motif, date
· Historique des paiements récents

Débiteurs (comptable/(tabs)/debiteurs.tsx)

· Liste des élèves avec paiements en retard
· Filtre par classe
· Badge rouge avec montant dû
· Clic → détail + possibilité d'enregistrer paiement

---

🎨 6. DESIGN SYSTEM

Palette de couleurs

```typescript
export const colors = {
  primary: {
    50: '#F5F0FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',  // Principal
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  accent: {
    400: '#F472B6',  // Corail Premium
    500: '#EC4899',
  },
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F5F0FF',
  surface: '#FFFFFF',
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
  }
};
```

Composants UI Réutilisables (packages/ui)

Button : variants (primary, secondary, outline, ghost, danger), tailles (sm, md, lg), état loading, icône gauche/droite, disabled

Card : glassmorphism (bg-white/70, backdrop-blur-xl, rounded-3xl, shadow-lg shadow-primary-200), padding 20px

Badge : variants (success, warning, danger, info, neutral), avec ou sans icône, rounded-full

Avatar : taille paramétrable, image ou initiales en fallback, anneau de statut optionnel

ProgressBar : hauteur 6px, arrondie, couleur paramétrable, animation de progression

Modal : centrée, backdrop blur, animation scale-in, fermeture clic extérieur ou bouton X

Toast : position top-right ou bottom, variants success/error/warning/info, auto-fermeture 3s

Input : label flottant, icône gauche possible, message erreur dessous, variants (default, error, success)

Typographie

· Famille : Inter
· Poids : Regular 400, SemiBold 600, Bold 700
· Tailles : xs(12), sm(14), base(16), lg(18), xl(20), 2xl(24), 3xl(30), 4xl(36)

Animations

· Toutes les transitions : 200ms ease-in-out
· Hover boutons : scale(1.02)
· Apparition cartes : fade-in + translateY(10px → 0)
· Scan QR Code : pulsation douce sur le contour violet

---

📱 7. SYNCHRONISATION OFFLINE-FIRST

· Activer enableIndexedDbPersistence() sur Firestore pour le desktop
· Activer enableNetwork() / disableNetwork() selon la connectivité
· Toutes les écritures (notes, appels, paiements) sont mises en file d'attente locale si hors ligne
· Dès que le réseau revient, synchronisation automatique
· Indicateur visuel persistant : icône nuage vert (sync OK) / orange (en attente) / rouge (erreur)

---

🚀 8. DÉPLOIEMENT

Firebase

· Projet Firebase avec Firestore (mode production), Authentication (Custom Tokens), Cloud Functions (Node.js 20, région europe-west1), Storage (bucket standard)
· Déployer les Cloud Functions : firebase deploy --only functions
· Déployer les règles Firestore : firebase deploy --only firestore:rules

Desktop (Tauri)

· Build : pnpm tauri build dans apps/desktop
· Génère un .exe Windows (ou .dmg macOS) < 15 Mo
· Distribution via clé USB ou téléchargement direct

Mobile (Expo)

· Build : eas build --platform android pour APK
· Build : eas build --platform ios pour IPA
· Distribution via Firebase App Distribution ou Google Play Store

---

📦 9. STRUCTURE FICHIERS COMPLÈTE

```
classe-platform/
├── apps/
│   ├── desktop/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Eleves.tsx
│   │   │   │   ├── EleveDetail.tsx
│   │   │   │   ├── Classes.tsx
│   │   │   │   ├── EmploiDuTemps.tsx
│   │   │   │   ├── QRGenerator.tsx
│   │   │   │   ├── Bulletins.tsx
│   │   │   │   ├── Comptabilite.tsx
│   │   │   │   ├── Parametres.tsx
│   │   │   │   └── Messagerie.tsx
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   └── Layout.tsx
│   │   │   │   ├── eleves/
│   │   │   │   ├── classes/
│   │   │   │   ├── emploiDuTemps/
│   │   │   │   ├── qr/
│   │   │   │   ├── bulletins/
│   │   │   │   └── comptabilite/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useEcole.ts
│   │   │   │   └── useQRCode.ts
│   │   │   └── lib/
│   │   │       ├── firebase.ts
│   │   │       └── supabase.ts (optionnel)
│   │   ├── src-tauri/
│   │   │   ├── Cargo.toml
│   │   │   ├── tauri.conf.json
│   │   │   └── src/
│   │   │       └── main.rs
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── mobile/
│       ├── app/
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── (auth)/
│       │   │   └── scan.tsx
│       │   ├── (prof)/
│       │   │   ├── _layout.tsx
│       │   │   ├── (tabs)/
│       │   │   │   ├── _layout.tsx
│       │   │   │   ├── index.tsx
│       │   │   │   ├── appel.tsx
│       │   │   │   ├── notes.tsx
│       │   │   │   └── profil.tsx
│       │   │   └── messagerie.tsx
│       │   └── (comptable)/
│       │       ├── _layout.tsx
│       │       └── (tabs)/
│       │           ├── _layout.tsx
│       │           ├── index.tsx
│       │           ├── paiements.tsx
│       │           ├── debiteurs.tsx
│       │           └── profil.tsx
│       ├── components/
│       │   ├── ui/
│       │   ├── appel/
│       │   └── notes/
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useAppelDisponible.ts
│       │   └── useSynchronisation.ts
│       ├── lib/
│       │   └── firebase.ts
│       ├── app.json
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   ├── profile.ts
│   │   │   │   ├── eleve.ts
│   │   │   │   ├── note.ts
│   │   │   │   ├── paiement.ts
│   │   │   │   ├── presence.ts
│   │   │   │   ├── bulletin.ts
│   │   │   │   ├── emploiDuTemps.ts
│   │   │   │   └── message.ts
│   │   │   ├── api/
│   │   │   │   ├── firestore.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── storage.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useCollection.ts
│   │   │   │   └── useDocument.ts
│   │   │   └── utils/
│   │   │       ├── calculs.ts
│   │   │       ├── formatters.ts
│   │   │       └── validators.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── ui/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Avatar.tsx
│       │   │   ├── ProgressBar.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Toast.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Select.tsx
│       │   │   ├── Table.tsx
│       │   │   └── EmptyState.tsx
│       │   ├── theme.ts
│       │   ├── tokens.ts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── firebase/
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   ├── functions/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── auth/
│   │   │   │   ├── generateQRAuthToken.ts
│   │   │   │   └── revokeAllUserTokens.ts
│   │   │   └── calculs/
│   │   │       └── calculerBulletin.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── .firebaserc
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

🔧 10. CONFIGURATION INITIALE

Firebase

1. Créer projet Firebase
2. Activer Firestore, Authentication, Functions, Storage
3. Déployer les règles Firestore ci-dessus
4. Configurer les Custom Claims dans Firebase Auth
5. Déployer les Cloud Functions

Desktop

```bash
pnpm create tauri-app apps/desktop --template react-ts
cd apps/desktop
pnpm add firebase react-router-dom @tanstack/react-query lucide-react
pnpm add -D tailwindcss postcss autoprefixer @tailwindcss/forms
```

Mobile

```bash
npx create-expo-app@latest apps/mobile --template tabs
cd apps/mobile
npx expo install firebase expo-camera expo-notifications expo-router react-native-reanimated
npx expo install nativewind tailwindcss
```

---

✅ 11. CHECKLIST DE VÉRIFICATION FINALE

Avant de considérer le projet terminé, vérifier :

· Firestore Rules déployées et testées (tentative accès autre école = bloqué)
· QR Code : scan unique fonctionnel, expiration 15 minutes, révocation admin
· Appel : restriction horaire, saisie inverse, batch write
· Notes : restriction prof/matière, sauvegarde automatique
· Calcul bulletin : moyenne, rang ex-aequo, mention, blocage paiement
· Offline : saisie sans réseau, synchronisation au retour
· Desktop : Tauri compile en .exe < 15 Mo
· Mobile : Expo compile en APK
· Design : glassmorphism, palette CLASSE, typographie Inter, animations 200ms
· Tous les messages utilisateur en français

---

📝 NOTE FINALE

Développe cette application avec rigueur. Chaque fonctionnalité doit être robuste, sécurisée, et élégante. Le code doit être propre, typé avec TypeScript, et modulaire. Les commentaires dans le code doivent être en français. L'interface utilisateur doit refléter le premium, le sérieux

---

# AJOUT — FONCTIONNALITÉS À INTÉGRER DE ZENO DANS CLASSE

IMPORTANT : CETTE SECTION EST UN AJOUT AU CAHIER DES CHARGES CLASSE.
NE MODIFIE AUCUNE DES INSTRUCTIONS PRÉCÉDENTES.
NE SUPPRIME AUCUNE FONCTIONNALITÉ CLASSE.
NE REMPLACE PAS LE STACK TECHNIQUE CLASSE.
NE CHANGE PAS LE NOM DE L’APPLICATION CLASSE.

Le but de cette section est uniquement d’intégrer dans CLASSE certaines idées et fonctionnalités provenant du concept Zeno afin de rendre CLASSE plus intelligent, plus adaptable, plus simple à utiliser et mieux adapté aux réalités des établissements scolaires en RDC.

Ces fonctionnalités doivent être intégrées dans les écrans, composants et flux CLASSE déjà prévus lorsque cela est possible.
Ne pas créer une deuxième application ou une deuxième interface parallèle.

---

## 12. ADAPTATION AUTOMATIQUE À LA STRUCTURE DE L’ÉTABLISSEMENT

Ajouter à la configuration initiale de l’école une structure pédagogique configurable.

Séparer clairement :

1. Le statut / mode de gestion de l’établissement
2. L’appellation de l’établissement
3. Les niveaux et filières réellement proposés

L’appellation « Complexe scolaire », « Institut », « Collège », « Lycée » ou « École » ne doit pas, à elle seule, déterminer les niveaux proposés.

Le directeur doit pouvoir configurer les niveaux réellement disponibles.

Exemples de niveaux configurables :

Maternelle :
- 1ère maternelle
- 2ème maternelle
- 3ème maternelle

Primaire :
- 1ère primaire
- 2ème primaire
- 3ème primaire
- 4ème primaire
- 5ème primaire
- 6ème primaire

Éducation de base :
- 7ème année
- 8ème année

Humanités :
- 1ère
- 2ème
- 3ème
- 4ème

Humanités techniques et professionnelles :
- sections/options/programmes configurables

Une école peut sélectionner plusieurs parcours.

---

## 13. INTERFACE DYNAMIQUE SELON L’ÉCOLE

L’application doit masquer les modules qui ne concernent pas l’établissement.

Exemple :

SI une école n’a pas de maternelle
→ ne pas afficher les fonctionnalités maternelle.

SI une école n’a pas d’humanités
→ ne pas afficher les fonctions liées aux humanités.

SI une école possède des filières techniques
→ afficher les sections et options techniques configurées.

L’objectif est que deux écoles utilisant CLASSE puissent avoir des environnements différents sans utiliser deux produits différents.

---

## 14. CONFIGURATION INTELLIGENTE DES CLASSES

Lors de la création des classes, le système doit utiliser la structure configurée.

Exemple :

6ème primaire → groupe A, B, C

7ème année → groupe A, B

4ème humanités → section configurée + groupe

Une classe doit pouvoir connaître :
- niveau
- groupe
- section / option si applicable
- année scolaire
- capacité
- titulaire

---

## 15. ANNÉE SCOLAIRE ET HISTORIQUE DES ÉLÈVES

Renforcer le système d’année scolaire déjà présent.

Un élève doit conserver une identité permanente à travers les années.

Ne pas recréer un nouvel élève à chaque année scolaire.

Créer une notion d’inscription / affectation par année scolaire.

Exemple :

Kévin Mukendi

2024–2025 → 4ème primaire A
2025–2026 → 5ème primaire A
2026–2027 → 6ème primaire A

L’historique doit rester accessible.

---

## 16. PASSAGE À L’ANNÉE SUIVANTE

À la fin de l’année scolaire, le directeur doit pouvoir préparer l’année suivante sans détruire l’historique.

Proposer :
- promotion
- redoublement
- transfert
- départ / radiation selon les règles de l’école
- autre statut configurable

Exemple :

5ème A → proposition 6ème A

Le directeur valide.

Créer une nouvelle inscription pour la nouvelle année scolaire.

---

## 17. DOSSIER ÉLÈVE UNIFIÉ

Améliorer la fiche élève existante afin qu’elle devienne un dossier unifié.

La fiche doit pouvoir regrouper selon les permissions :
- identité
- classe actuelle
- historique scolaire
- inscriptions
- présences
- notes
- bulletins
- paiements
- documents
- changements de classe
- événements administratifs

Présenter l’historique sous forme de timeline lorsque cela améliore la compréhension.

---

## 18. IMPORT EXCEL / CSV INTELLIGENT

Renforcer la fonction d’import existante.

Le flux doit être :

Fichier
→ Analyse
→ Correspondance des colonnes
→ Aperçu
→ Détection des erreurs
→ Détection des doublons potentiels
→ Confirmation
→ Import

Le système doit comprendre des noms de colonnes différents.

Exemple :

« Nom », « Nom de famille », « Last Name »
→ proposer une même correspondance.

Avant l’import :

300 lignes détectées
287 prêtes
9 incomplètes
4 doublons possibles

Ne jamais importer silencieusement des données douteuses.

---

## 19. ATTRIBUTION DES ENSEIGNANTS

Renforcer l’attribution existante.

Un enseignant peut être associé à :
- une ou plusieurs matières
- une ou plusieurs classes
- une année scolaire
- plusieurs créneaux
- une classe comme titulaire

Le système doit automatiquement utiliser ces informations pour déterminer ce que l’enseignant voit dans son application.

---

## 20. RÔLES ET PERMISSIONS PERSONNALISABLES

Conserver les rôles existants.

Ajouter une architecture permettant au directeur de créer des rôles supplémentaires.

Exemples :
- Directeur
- Directeur adjoint
- Secrétaire
- Comptable
- Enseignant
- Surveillant
- Responsable pédagogique
- rôle personnalisé

Le directeur doit pouvoir choisir les capacités du rôle en langage simple.

Exemples :
- Consulter les élèves
- Modifier les dossiers
- Enregistrer les présences
- Saisir les notes
- Consulter les bulletins
- Consulter les finances
- Enregistrer les paiements

Les permissions techniques restent côté backend.

---

## 21. PERMISSIONS BASÉES SUR L’AFFECTATION

Les permissions ne doivent pas seulement dépendre du rôle.

Elles doivent également respecter les affectations.

Exemple :

Un enseignant peut être professeur de mathématiques en 6A et 6B.

Il voit :
- 6A
- 6B
- mathématiques

Il ne voit pas automatiquement :
- 6C
- les matières d’un autre enseignant
- les données financières

Cette restriction doit être garantie côté serveur.

---

## 22. TABLEAU DE BORD DIRECTEUR ORIENTÉ ACTION

Améliorer le dashboard directeur existant.

Le dashboard doit répondre à :

« Qu’est-ce qui nécessite mon attention aujourd’hui ? »

Afficher prioritairement :
- appels non effectués
- enseignants absents
- conflits de planning
- dossiers incomplets
- activités récentes importantes
- indicateurs de réussite
- informations financières déjà disponibles dans CLASSE

Chaque alerte doit permettre d’aller directement à l’action correspondante.

Éviter d’ajouter des graphiques uniquement décoratifs.

---

## 23. DASHBOARD ENSEIGNANT ORIENTÉ JOURNÉE

Le dashboard mobile professeur doit répondre à :

« Qu’est-ce que je dois faire aujourd’hui ? »

Afficher :
- prochain cours
- classe
- matière
- heure
- salle si disponible
- appel à effectuer
- notes à saisir
- tâches en attente

Les informations doivent provenir automatiquement du planning et des affectations existants.

---

## 24. RAPPEL AUTOMATIQUE DE L’APPEL

Conserver la logique d’appel existante.

Ajouter une expérience de rappel claire et discrète lorsqu’un cours commence.

Exemple :

« Il est temps de faire l’appel de 6ème A. »

Lorsque les permissions du système le permettent, un son bref peut être utilisé.

Ne pas créer de notifications agressives.

---

## 25. EXPÉRIENCE D’APPEL SIMPLIFIÉE

Conserver l’appel existant et améliorer l’ergonomie.

Le système connaît déjà :
- professeur
- classe
- matière
- heure
- date

Le professeur ne doit donc pas ressaisir ces informations.

Le système doit permettre une saisie très rapide des absences et retards.

Préférer une interaction adaptée au téléphone et aux grands écrans tactiles.

Après validation, mettre automatiquement à jour les données concernées.

---

## 26. ABSENCE DES ENSEIGNANTS

Ajouter la gestion des absences du personnel enseignant.

Le directeur doit pouvoir voir :

« Patrick est absent aujourd’hui. »

Puis voir les cours concernés.

Le système peut proposer les enseignants potentiellement disponibles pour un remplacement, sans effectuer automatiquement le remplacement sans validation.

---

## 27. CHARGE DES ENSEIGNANTS

Ajouter une vue directeur permettant de voir la charge d’un enseignant.

Exemple :

Patrick
18 h / semaine
4 classes
2 matières

Détecter :
- conflit
- surcharge
- sous-affectation éventuelle

Utiliser des avertissements compréhensibles.

---

## 28. RECHERCHE UNIVERSELLE

Ajouter une recherche globale qui respecte les permissions.

La recherche peut couvrir :
- élèves
- enseignants
- classes
- matières
- bulletins
- factures
- paiements
- documents

Le même terme peut produire des résultats différents selon le rôle de l’utilisateur.

---

## 29. NOTIFICATIONS ACTIONNABLES

Conserver la messagerie et les notifications CLASSE.

Améliorer leur utilité.

Exemples :

Professeur :
« Appel de 6A à faire. »

Secrétaire :
« Le dossier de Kevin est incomplet. »

Directeur :
« 2 enseignants sont absents aujourd’hui. »

Comptable :
« 17 paiements restent à traiter. »

Une notification importante doit conduire directement à l’écran concerné.

---

## 30. ANNÉE SCOLAIRE — VUE DE TRANSITION

Ajouter une vue de préparation du changement d’année.

Le directeur peut :
- visualiser les élèves
- revoir les résultats
- proposer le passage
- modifier les affectations
- confirmer la nouvelle année

Afficher un résumé avant validation.

Ne jamais écraser l’année précédente.

---

## 31. BULLETINS PLUS FLEXIBLES

Conserver le moteur de bulletin CLASSE.

Mais rendre les règles de calcul configurables lorsqu’elles varient selon l’établissement.

Préparer notamment :
- coefficient
- période
- évaluations
- appréciation
- classement si l’école l’utilise
- modèle de bulletin

Ne pas imposer des règles scolaires non vérifiées.

---

## 32. FINANCES ET LICENCES ZENO / CLASSE

Conserver toute la logique de comptabilité déjà présente dans CLASSE.

Ajouter une distinction entre :

A. les finances de l’école
B. l’abonnement/licence de l’application

Le système doit pouvoir suivre :
- plan
- date de début
- date d’expiration
- statut de licence
- fonctionnalités incluses
- limites éventuelles

La licence est liée à une période, idéalement à l’année scolaire ou au contrat choisi.

À expiration :
- ne pas supprimer les données
- conserver l’historique
- afficher une interface de renouvellement

---

## 33. PLANS COMMERCIAUX

Préparer l’architecture à plusieurs plans.

Exemples :

Starter
School
Pro

Les prix et limites doivent être configurables et non codés en dur.

Les plans peuvent contrôler :
- nombre d’élèves
- nombre de membres du personnel
- modules disponibles
- stockage
- fonctionnalités avancées

Ne pas afficher de fonctionnalités payantes inutiles aux utilisateurs qui n’y ont pas accès.

---

## 34. MOBILE MONEY — PRÉPARATION

Conserver la comptabilité CLASSE.

Préparer l’architecture pour l’intégration future de prestataires de paiement Mobile Money.

Le paiement doit pouvoir être rattaché à :
- école
- facture
- élève
- montant
- opérateur/prestataire
- référence de transaction
- date

Ne jamais identifier un paiement uniquement avec le numéro de téléphone.

Supporter conceptuellement :
- paiement partiel
- paiement multiple
- surpaiement
- remboursement
- doublon
- transaction non rapprochée
- confirmation asynchrone

Ne pas simuler une intégration réelle si les API et autorisations correspondantes ne sont pas disponibles.

---

## 35. DOCUMENTS ET HISTORIQUE

Renforcer la gestion documentaire existante.

Les documents peuvent appartenir à :
- l’école
- un élève
- une classe
- une année scolaire

Les accès doivent respecter les permissions.

---

## 36. ÉTATS DE SYNCHRONISATION

Le mode offline-first déjà spécifié dans CLASSE doit être visible mais discret.

Afficher clairement :

Synchronisé
En attente
Hors connexion
Erreur de synchronisation

Ne pas inquiéter l’utilisateur avec des messages techniques.

---

## 37. EXPÉRIENCE UTILISATEUR — RÈGLE SUPÉRIEURE

Chaque fonctionnalité doit essayer d’éviter la double saisie.

Si Zeno/CLASSE connaît déjà :

Professeur + classe + matière + horaire

alors le système doit les réutiliser automatiquement pour l’appel.

Si le directeur affecte un enseignant à une classe :

mettre automatiquement à jour les espaces concernés.

Si un élève change de classe :

mettre à jour les listes, affectations et contextes concernés sans détruire son historique.

---

## 38. PRINCIPES DE DESIGN À AJOUTER SANS CASSER LE DESIGN CLASSE

Ne pas remplacer le design system existant.

Améliorer uniquement :
- hiérarchie visuelle
- lisibilité
- densité d'information
- cohérence des interactions
- micro-animations
- états de chargement
- états vides
- états d’erreur
- états de réussite

Le design doit rester fidèle à CLASSE.

Les améliorations ne doivent pas produire un nouveau produit visuel.

---

## 39. ÉTATS VIDES INTELLIGENTS

Chaque écran vide doit expliquer :

1. pourquoi il est vide
2. ce que l’utilisateur peut faire
3. l’action principale

Exemple :

« Aucun élève pour le moment. »

[Ajouter un élève]
[Importer Excel]

---

## 40. CONTRAINTES PRODUIT

Les fonctionnalités ajoutées ici doivent être considérées comme des modules fonctionnels supplémentaires de CLASSE.

Elles ne doivent pas conduire à :
- créer une deuxième application
- créer une deuxième marque
- créer une deuxième navigation
- créer des écrans dupliqués
- remplacer le stack CLASSE
- remplacer les écrans CLASSE sans nécessité

Utiliser les écrans CLASSE existants lorsque la fonctionnalité peut y être intégrée.

---

## 41. RÉSULTAT ATTENDU

À la fin, CLASSE doit rester CLASSE dans son architecture et son identité, mais gagner les qualités fonctionnelles de Zeno :

- adaptation intelligente à la structure de l’école
- expérience différente selon le rôle
- permissions plus fines
- meilleure expérience directeur
- meilleure expérience enseignant
- année scolaire mieux gérée
- dossier élève permanent
- import Excel plus intelligent
- planning mieux exploité
- appel plus fluide
- suivi des enseignants
- recherche globale
- notifications actionnables
- licences et plans configurables
- préparation Mobile Money
- expérience plus simple malgré une architecture riche

Le principe final reste :

COMPLEXE DERRIÈRE.
SIMPLE DEVANT.

Et surtout :

UNE SEULE APPLICATION.

CLASSE.
