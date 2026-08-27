# Schéma Firestore CLASSE

CLASSE utilise une structure multi-écoles. L’identifiant d’école doit provenir du custom claim `school_id` de l’utilisateur Firebase. Les données métier ne doivent jamais être mélangées entre deux écoles.

| Chemin | Usage | Champs principaux |
|---|---|---|
| `ecoles/{schoolId}` | Établissement actif | `name`, `active`, `year`, `address`, `phone` |
| `ecoles/{schoolId}/profiles/{uid}` | Profil et rôle utilisateur | `uid`, `email`, `displayName`, `role`, `school_id`, `active` |
| `ecoles/{schoolId}/eleves/{studentId}` | Dossier permanent élève | `code`, `name`, `className`, `sexe`, `birthDate`, `status`, `section`, `createdAt`, `updatedAt` |
| `ecoles/{schoolId}/classes/{classId}` | Structure de classe | `name`, `level`, `group`, `section`, `titular`, `capacity`, `active` |
| `ecoles/{schoolId}/personnel/{profileId}` | Personnel | `name`, `role`, `email`, `classes`, `subjects`, `active` |
| `ecoles/{schoolId}/presences/{presenceId}` | Appels | `studentId`, `classId`, `date`, `status`, `enregistreParId` |
| `ecoles/{schoolId}/notes/{gradeId}` | Notes | `studentId`, `classId`, `subject`, `trimester`, `note`, `coefficient`, `saisiParId` |
| `ecoles/{schoolId}/paiements/{paymentId}` | Encaissements | `studentId`, `amount`, `method`, `motif`, `status`, `date`, `createdBy` |
| `ecoles/{schoolId}/emploi_du_temps/{entryId}` | Planning | `day`, `start`, `end`, `subject`, `className`, `teacher`, `room` |
| `ecoles/{schoolId}/messages/{messageId}` | Messagerie interne | `expediteurId`, `destinataireId`, `content`, `read`, `createdAt` |
| `ecoles/{schoolId}/qr_tokens/{tokenId}` | Accès temporaire | `tokenId`, `school_id`, `profileId`, `role`, `status`, `expiresAt`, `createdBy` |
| `ecoles/{schoolId}/audit_logs/{logId}` | Journal d’audit | `actorId`, `action`, `entity`, `entityId`, `createdAt`, `metadata` |

Les opérations sensibles doivent passer par des Cloud Functions : attribution des rôles, création et consommation des QR, recalcul serveur des bulletins, import massif et journalisation d’audit. Le client ne doit pas pouvoir s’attribuer un rôle, modifier le propriétaire d’une école ou écrire un QR au nom d’un autre administrateur.

## Déploiement

Copier `.firebaserc.example` vers `.firebaserc`, remplacer l’identifiant de projet, connecter la CLI Firebase, puis déployer les règles et les fonctions. Les variables `VITE_FIREBASE_*` restent réservées au client web ; la clé de service Admin SDK doit rester dans l’environnement sécurisé des Cloud Functions.
