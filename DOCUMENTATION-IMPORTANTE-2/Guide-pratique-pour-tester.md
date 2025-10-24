# Scénario de Démonstration - Demo-1 : clerk-upsert-basic

Guide pratique pour tester et démontrer les migrations Prisma avec évolution progressive du schéma.



## Table des matières

1. [Objectif du scénario](#objectif-du-scénario)
2. [Pré-requis](#pré-requis)
3. [Configuration initiale](#configuration-initiale)
4. [Migration #1 : Initialisation](#migration-1--initialisation)
5. [Migration #2 : Ajouter username](#migration-2--ajouter-username)
6. [Migration #3 : Ajouter rôles](#migration-3--ajouter-rôles)
7. [Migration #4 : Profil et dernière connexion](#migration-4--profil-et-dernière-connexion)
8. [Migration #5 : Optimisation avec index](#migration-5--optimisation-avec-index)
9. [Rollback : Retour en arrière](#rollback--retour-en-arrière)
10. [Vérification et tests](#vérification-et-tests)

---

## Objectif du scénario

Démontrer comment :
- Créer et appliquer des migrations Prisma successives
- Faire évoluer un schéma de base de données progressivement
- Revenir en arrière vers une version antérieure
- Gérer les migrations en développement vs production

---

## Pré-requis

### Variables d'environnement

Créer `.env` avec **connexion directe** Supabase (pas le pooler) :

```env
DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres?sslmode=require&schema=public"
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres?sslmode=require&schema=public"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

### Configuration Prisma

Vérifier `prisma/schema.prisma` :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Installation

```bash
npm install
```

---

## Configuration initiale

### Étape 1 : Vérifier la connexion

```bash
npx prisma db pull
npx prisma generate
npx prisma studio
```

Si succès, la connexion à Supabase fonctionne.

### Étape 2 : Nettoyer (si nécessaire)

Si des tables existent déjà :

```bash
npx prisma migrate reset --skip-seed
```

---

## Migration #1 : Initialisation

### Objectif

Créer le schéma initial minimaliste avec User.

### Schéma

Modifier `prisma/schema.prisma` :

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### Commandes

```bash
# Créer la migration
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

### Vérification

```bash
# Vérifier le statut
npx prisma migrate status

# Ouvrir Prisma Studio
npx prisma studio
```

**Résultat attendu** :
- Table `users` créée avec 5 colonnes
- Migration `init` appliquée

### Diagramme

```mermaid
graph TD
    START[Début] --> M1[Migration #1: init]
    M1 --> SCHEMA1[Table User<br/>5 champs]
    
    style START fill:#90caf9,color:#000
    style M1 fill:#66bb6a,color:#000
    style SCHEMA1 fill:#a5d6a7,color:#000
```

---

## Migration #2 : Ajouter username

### Objectif

Ajouter un champ `username` unique et obligatoire.

### Modification du schéma

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  username  String   @unique   // ← NOUVEAU
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### Commandes

```bash
npx prisma migrate dev --name add_username_to_user
npx prisma generate
```

### Vérification

```bash
npx prisma migrate status
npx prisma studio
```

**Résultat attendu** :
- Colonne `username` ajoutée
- Contrainte UNIQUE sur username
- 2 migrations appliquées

### Diagramme

```mermaid
graph TD
    M1[Migration #1<br/>init] --> M2[Migration #2<br/>add_username]
    M2 --> SCHEMA2[Table User<br/>6 champs<br/>+ username unique]
    
    style M1 fill:#a5d6a7,color:#000
    style M2 fill:#66bb6a,color:#000
    style SCHEMA2 fill:#81c784,color:#000
```

---

## Migration #3 : Ajouter rôles

### Objectif

Créer un enum `Role` et ajouter le champ `role` avec valeur par défaut.

### Modification du schéma

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  username  String   @unique
  role      Role     @default(USER)  // ← NOUVEAU
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### Commandes

```bash
npx prisma migrate dev --name add_role_enum_and_field
npx prisma generate
```

### Vérification

Dans Prisma Studio, vérifier :
- Type ENUM `Role` créé
- Champ `role` avec valeur par défaut `USER`

### Diagramme

```mermaid
graph TD
    M2[Migration #2<br/>username] --> M3[Migration #3<br/>role enum]
    M3 --> SCHEMA3[Table User<br/>7 champs<br/>+ enum Role]
    
    style M2 fill:#81c784,color:#000
    style M3 fill:#66bb6a,color:#000
    style SCHEMA3 fill:#4caf50,color:#000
```

---

## Migration #4 : Profil et dernière connexion

### Objectif

Ajouter des champs pour gérer l'état du profil et tracker la dernière connexion.

### Modification du schéma

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id              String   @id @default(cuid())
  clerkId         String   @unique
  email           String   @unique
  username        String   @unique
  role            Role     @default(USER)
  profileComplete Boolean  @default(false)     // ← NOUVEAU
  lastLogin       DateTime?                    // ← NOUVEAU
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("users")
}
```

### Commandes

```bash
npx prisma migrate dev --name add_profile_complete_and_last_login
npx prisma generate
```

### Vérification

```bash
npx prisma migrate status
```

**Résultat attendu** :
```
Status: 4 migrations applied
1. init
2. add_username_to_user
3. add_role_enum_and_field
4. add_profile_complete_and_last_login
```

### Diagramme

```mermaid
graph TD
    M3[Migration #3<br/>role] --> M4[Migration #4<br/>profile tracking]
    M4 --> SCHEMA4[Table User<br/>9 champs<br/>+ tracking]
    
    style M3 fill:#4caf50,color:#000
    style M4 fill:#66bb6a,color:#000
    style SCHEMA4 fill:#2e7d32,color:#fff
```

---

## Migration #5 : Optimisation avec index

### Objectif

Améliorer les performances avec un index composite sur les colonnes fréquemment requêtées.

### Modification du schéma

```prisma
model User {
  id              String   @id @default(cuid())
  clerkId         String   @unique
  email           String   @unique
  username        String   @unique
  role            Role     @default(USER)
  profileComplete Boolean  @default(false)
  lastLogin       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("users")
  @@index([role, profileComplete])  // ← NOUVEAU INDEX
}
```

### Commandes

```bash
npx prisma migrate dev --name add_index_role_profileComplete
npx prisma generate
```

### Vérification

```bash
# Voir toutes les migrations
npx prisma migrate status

# Vérifier l'index dans la DB
npx prisma studio
```

### Évolution complète

```mermaid
graph TD
    INIT[Début] --> M1[#1: init<br/>5 champs]
    M1 --> M2[#2: username<br/>6 champs]
    M2 --> M3[#3: role enum<br/>7 champs]
    M3 --> M4[#4: tracking<br/>9 champs]
    M4 --> M5[#5: index<br/>Optimisé]
    
    style INIT fill:#90caf9,color:#000
    style M1 fill:#c8e6c9,color:#000
    style M2 fill:#a5d6a7,color:#000
    style M3 fill:#81c784,color:#000
    style M4 fill:#66bb6a,color:#000
    style M5 fill:#4caf50,color:#000
```

---

## Rollback : Retour en arrière

### Deux stratégies selon l'environnement

```mermaid
graph TD
    CURRENT[État actuel<br/>5 migrations] --> CHOICE{Environnement?}
    
    CHOICE -->|Développement| DEV[Stratégie A<br/>Reset destructif]
    CHOICE -->|Production| PROD[Stratégie B<br/>Migration inverse]
    
    DEV --> GIT[Git checkout<br/>commit ancien]
    GIT --> RESET[prisma migrate reset]
    RESET --> RESULT_DEV[État migration #3]
    
    PROD --> MODIFY[Modifier schema<br/>retirer champs]
    MODIFY --> NEW_MIG[Nouvelle migration<br/>revert]
    NEW_MIG --> DEPLOY[prisma migrate deploy]
    DEPLOY --> RESULT_PROD[État logique #3<br/>Historique conservé]
    
    style CURRENT fill:#ffd54f,color:#000
    style CHOICE fill:#fff9c4,color:#000
    style DEV fill:#ef9a9a,color:#000
    style PROD fill:#a5d6a7,color:#000
    style GIT fill:#ffccbc,color:#000
    style RESET fill:#ef9a9a,color:#000
    style RESULT_DEV fill:#ffab91,color:#000
    style MODIFY fill:#c8e6c9,color:#000
    style NEW_MIG fill:#a5d6a7,color:#000
    style DEPLOY fill:#81c784,color:#000
    style RESULT_PROD fill:#66bb6a,color:#000
```

### A) Développement : Reset destructif

**Étape 1** : Revenir au commit Git de la migration #3

```bash
git log --oneline
git checkout <commit-hash-migration-3>
```

**Étape 2** : Reset et réappliquer

```bash
npx prisma migrate reset --skip-seed
npx prisma generate
```

**Étape 3** : Vérifier

```bash
npx prisma migrate status
# Devrait montrer seulement 3 migrations
```

**Attention** : Toutes les données sont perdues avec `reset` !

### B) Production : Migration inverse (non destructif)

**Étape 1** : Modifier le schéma pour retirer les champs

Retirer de `schema.prisma` :
- `@@index([role, profileComplete])`
- `profileComplete Boolean @default(false)`
- `lastLogin DateTime?`

**Étape 2** : Créer la migration inverse

```bash
npx prisma migrate dev --name revert_to_migration_3_shape
npx prisma generate
```

**Étape 3** : Déployer en production

```bash
npx prisma migrate deploy
npx prisma generate
```

**Avantage** : L'historique complet est conservé (traçabilité).

---

## Vérification et tests

### Commandes utiles

#### Voir l'état des migrations

```bash
npx prisma migrate status
```

#### Inspecter une migration spécifique

```bash
cat prisma/migrations/20251023170100_add_username_to_user/migration.sql
```

#### Comparer schéma actuel vs migrations

```bash
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

#### Marquer une migration comme rolled back (avancé)

```bash
npx prisma migrate resolve --rolled-back 20251023172300_add_profile_complete_and_last_login
```

Note : À utiliser uniquement si vous avez déjà remis la base manuellement dans l'état attendu.

### Tester avec Prisma Studio

```bash
npx prisma studio
```

Ouvrir http://localhost:5555 et :
1. Créer quelques utilisateurs
2. Vérifier les contraintes (unique, default)
3. Tester les valeurs d'enum
4. Observer les relations (après migrations avec relations)

---

## Scénario complet de démonstration

### Étape par étape (30 minutes)

#### Partie 1 : Évolution progressive (20 minutes)

```mermaid
graph TD
    S1[1. Setup projet<br/>5 min] --> S2[2. Migration init<br/>2 min]
    S2 --> S3[3. Ajouter username<br/>3 min]
    S3 --> S4[4. Ajouter roles<br/>3 min]
    S4 --> S5[5. Tracking profil<br/>3 min]
    S5 --> S6[6. Optimiser index<br/>2 min]
    S6 --> S7[7. Tester dans Studio<br/>2 min]
    
    style S1 fill:#b3e5fc,color:#000
    style S2 fill:#a5d6a7,color:#000
    style S3 fill:#81c784,color:#000
    style S4 fill:#66bb6a,color:#000
    style S5 fill:#4caf50,color:#000
    style S6 fill:#2e7d32,color:#fff
    style S7 fill:#90caf9,color:#000
```

**1. Setup projet (5 min)**
```bash
cd 01-demo-1-clerk-upsert-basic
npm install
cp ../env.sample .env
# Éditer .env avec vos clés
```

**2. Migration init (2 min)**
```bash
# Appliquer le schéma initial
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio  # Vérifier la table créée
```

**3. Ajouter username (3 min)**
```bash
# Modifier schema.prisma (ajouter username)
npx prisma migrate dev --name add_username_to_user
npx prisma generate
# Dans Studio : créer un user, vérifier que username est requis
```

**4. Ajouter roles (3 min)**
```bash
# Modifier schema.prisma (ajouter enum Role + champ role)
npx prisma migrate dev --name add_role_enum_and_field
npx prisma generate
# Dans Studio : vérifier que role = USER par défaut
```

**5. Tracking profil (3 min)**
```bash
# Modifier schema.prisma (ajouter profileComplete, lastLogin)
npx prisma migrate dev --name add_profile_complete_and_last_login
npx prisma generate
# Dans Studio : vérifier profileComplete = false, lastLogin = null
```

**6. Optimiser index (2 min)**
```bash
# Modifier schema.prisma (ajouter @@index)
npx prisma migrate dev --name add_index_role_profileComplete
npx prisma generate
```

**7. Tester dans Studio (2 min)**
- Créer 5 utilisateurs avec différents rôles
- Tester les contraintes unique
- Vérifier les valeurs par défaut

#### Partie 2 : Rollback (10 minutes)

```mermaid
graph TD
    CURRENT[État actuel<br/>5 migrations] --> BACKUP[Backup données]
    BACKUP --> CHOOSE{Méthode?}
    
    CHOOSE -->|Dev local| METHOD_A[A: Reset]
    CHOOSE -->|Production| METHOD_B[B: Migration inverse]
    
    METHOD_A --> CHECKOUT[git checkout ancien]
    CHECKOUT --> RESET[migrate reset]
    RESET --> VERIFY_A[Vérifier #3 seulement]
    
    METHOD_B --> EDIT[Modifier schema]
    EDIT --> CREATE_MIG[migrate dev revert]
    CREATE_MIG --> VERIFY_B[Vérifier inversion]
    
    style CURRENT fill:#ffd54f,color:#000
    style BACKUP fill:#fff176,color:#000
    style CHOOSE fill:#fff9c4,color:#000
    style METHOD_A fill:#ef9a9a,color:#000
    style METHOD_B fill:#81c784,color:#000
    style CHECKOUT fill:#ffccbc,color:#000
    style RESET fill:#ef9a9a,color:#000
    style VERIFY_A fill:#ffab91,color:#000
    style EDIT fill:#c8e6c9,color:#000
    style CREATE_MIG fill:#a5d6a7,color:#000
    style VERIFY_B fill:#66bb6a,color:#000
```

**Méthode A - Reset (développement)**
```bash
# 1. Revenir à un commit antérieur
git log --oneline
git checkout <commit-migration-3>

# 2. Reset complet
npx prisma migrate reset --skip-seed

# 3. Générer
npx prisma generate

# 4. Vérifier
npx prisma migrate status
```

**Méthode B - Migration inverse (production)**
```bash
# 1. Modifier schema.prisma : retirer
#    - @@index([role, profileComplete])
#    - profileComplete Boolean @default(false)
#    - lastLogin DateTime?

# 2. Créer migration inverse
npx prisma migrate dev --name revert_to_migration_3_shape

# 3. Générer
npx prisma generate

# 4. Vérifier
npx prisma migrate status
# Vous aurez maintenant 6 migrations (3 forward + 1 revert)
```

---

## Cas d'usage réels

### Scénario 1 : Développement d'une nouvelle feature

```mermaid
graph TD
    START[Feature request] --> BRANCH[Git branch feature/username]
    BRANCH --> SCHEMA[Modifier schema]
    SCHEMA --> MIG[migrate dev]
    MIG --> TEST[Tester localement]
    TEST --> OK{Tests OK?}
    
    OK -->|Non| ROLLBACK[migrate reset + fix]
    OK -->|Oui| PR[Pull Request]
    
    ROLLBACK --> SCHEMA
    PR --> REVIEW[Code review]
    REVIEW --> MERGE[Merge to main]
    MERGE --> DEPLOY[migrate deploy prod]
    
    style START fill:#90caf9,color:#000
    style BRANCH fill:#b3e5fc,color:#000
    style SCHEMA fill:#a5d6a7,color:#000
    style MIG fill:#81c784,color:#000
    style TEST fill:#fff9c4,color:#000
    style OK fill:#ffd54f,color:#000
    style ROLLBACK fill:#ef9a9a,color:#000
    style PR fill:#81d4fa,color:#000
    style REVIEW fill:#90caf9,color:#000
    style MERGE fill:#66bb6a,color:#000
    style DEPLOY fill:#4caf50,color:#000
```

### Scénario 2 : Hotfix en production

```mermaid
graph TD
    BUG[Bug détecté] --> ANALYZE[Analyser]
    ANALYZE --> CAUSE{Cause?}
    
    CAUSE -->|Migration| REVERT[Créer migration inverse]
    CAUSE -->|Code| FIX[Fix code]
    
    REVERT --> TEST_REVERT[Test staging]
    FIX --> TEST_FIX[Test staging]
    
    TEST_REVERT --> DEPLOY_REVERT[Deploy revert prod]
    TEST_FIX --> DEPLOY_FIX[Deploy fix prod]
    
    DEPLOY_REVERT --> MONITOR[Monitor]
    DEPLOY_FIX --> MONITOR
    
    style BUG fill:#ef9a9a,color:#000
    style ANALYZE fill:#ffd54f,color:#000
    style CAUSE fill:#fff9c4,color:#000
    style REVERT fill:#ffab91,color:#000
    style FIX fill:#a5d6a7,color:#000
    style TEST_REVERT fill:#fff176,color:#000
    style TEST_FIX fill:#c8e6c9,color:#000
    style DEPLOY_REVERT fill:#ffa726,color:#000
    style DEPLOY_FIX fill:#66bb6a,color:#000
    style MONITOR fill:#81d4fa,color:#000
```

---

## Checklist de démonstration

### Avant de commencer

- [ ] Supabase projet créé
- [ ] Clés Clerk obtenues
- [ ] `.env` configuré
- [ ] `npm install` exécuté
- [ ] Connexion DB testée

### Migration progressive

- [ ] Migration #1 (init) appliquée et vérifiée
- [ ] Migration #2 (username) appliquée et testée
- [ ] Migration #3 (role) appliquée et vérifiée
- [ ] Migration #4 (tracking) appliquée et testée
- [ ] Migration #5 (index) appliquée et vérifiée
- [ ] Toutes les migrations visibles dans `migrate status`

### Tests fonctionnels

- [ ] Créer un user dans Prisma Studio
- [ ] Vérifier contraintes unique (email, username, clerkId)
- [ ] Vérifier valeurs par défaut (role=USER, profileComplete=false)
- [ ] Tester l'application avec Clerk (signup/login)
- [ ] Vérifier sync avec syncUser()

### Rollback

- [ ] Backup des données créé
- [ ] Méthode choisie (A ou B)
- [ ] Rollback exécuté avec succès
- [ ] État vérifié avec `migrate status`
- [ ] Données vérifiées dans Studio

---

## Problèmes courants et solutions

### Erreur : "Migration already applied"

**Cause** : Migration déjà présente dans la table `_prisma_migrations`

**Solution** :
```bash
# Voir les migrations en DB
npx prisma migrate status

# Résoudre manuellement
npx prisma migrate resolve --applied <migration-name>
```

### Erreur : "Unique constraint violation"

**Cause** : Données existantes violent la contrainte unique

**Solution** :
```bash
# Nettoyer les doublons avant migration
# Ou utiliser migrate reset en dev
npx prisma migrate reset
```

### Erreur : "Direct URL required"

**Cause** : DIRECT_URL manquant dans .env

**Solution** :
```env
DIRECT_URL="postgresql://..."
```

### Migration bloquée

**Cause** : Transaction en cours ou lock

**Solution** :
```bash
# Relancer
npx prisma migrate dev

# Ou forcer (attention !)
npx prisma migrate deploy --force
```

---

## Commandes de référence rapide

### Créer une migration

```bash
npx prisma migrate dev --name <nom_descriptif>
```

### Appliquer en production

```bash
npx prisma migrate deploy
```

### Voir l'état

```bash
npx prisma migrate status
```

### Reset (dev uniquement)

```bash
npx prisma migrate reset
```

### Générer le client

```bash
npx prisma generate
```

### Ouvrir l'interface

```bash
npx prisma studio
```

### Comparer états

```bash
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

---

## Résumé du scénario

### Évolution du schéma

| Migration | Champs totaux | Nouveauté | Temps |
|-----------|---------------|-----------|-------|
| #1 init | 5 | Table User initiale | 2 min |
| #2 username | 6 | + username unique | 2 min |
| #3 role | 7 | + enum Role + role | 3 min |
| #4 tracking | 9 | + profileComplete + lastLogin | 3 min |
| #5 index | 9 | + index composite | 2 min |

**Total** : 12 minutes pour 5 migrations

### Points clés démontrés

1. Évolution progressive d'un schéma
2. Ajout de contraintes (unique, default)
3. Utilisation d'enums
4. Optimisation avec index
5. Rollback en développement
6. Rollback en production (non destructif)

---

## Diagramme récapitulatif complet

```mermaid
graph TD
    subgraph "Phase 1: Évolution"
        P1[Schéma initial] --> P2[+ username]
        P2 --> P3[+ role enum]
        P3 --> P4[+ tracking]
        P4 --> P5[+ index]
    end
    
    P5 --> DECISION{Besoin rollback?}
    
    subgraph "Phase 2: Rollback Dev"
        DECISION -->|Dev| R1[Git checkout]
        R1 --> R2[migrate reset]
        R2 --> R3[État migration #3]
    end
    
    subgraph "Phase 3: Rollback Prod"
        DECISION -->|Prod| R4[Modifier schema]
        R4 --> R5[migrate dev revert]
        R5 --> R6[migrate deploy]
        R6 --> R7[État logique #3]
    end
    
    DECISION -->|Non| CONTINUE[Continuer évolution]
    
    style P1 fill:#c8e6c9,color:#000
    style P2 fill:#a5d6a7,color:#000
    style P3 fill:#81c784,color:#000
    style P4 fill:#66bb6a,color:#000
    style P5 fill:#4caf50,color:#000
    style DECISION fill:#fff9c4,color:#000
    style R1 fill:#ffccbc,color:#000
    style R2 fill:#ef9a9a,color:#000
    style R3 fill:#ffab91,color:#000
    style R4 fill:#c8e6c9,color:#000
    style R5 fill:#a5d6a7,color:#000
    style R6 fill:#81c784,color:#000
    style R7 fill:#66bb6a,color:#000
    style CONTINUE fill:#81d4fa,color:#000
```

---

## Conclusion

Ce scénario démontre :

- **Évolution maîtrisée** : 5 migrations successives
- **Flexibilité** : Rollback possible (dev et prod)
- **Traçabilité** : Historique complet des changements
- **Sécurité** : Stratégies différentes selon environnement

**Temps total** : 30-40 minutes pour le scénario complet

**Prochaines étapes** :
- Intégrer avec l'application Clerk
- Tester syncUser() avec nouveau schéma
- Déployer en production

---

**Document créé le** : 2025-10-23

**Version** : 1.0

**Projet** : Demo-1 clerk-upsert-basic

