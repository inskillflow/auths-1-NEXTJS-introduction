# Pré-requis (une fois)

`.env` (connexion **directe**, pas le “pooler”) :

```env
DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres?sslmode=require&schema=public"
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres?sslmode=require&schema=public"
SHADOW_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres?sslmode=require&schema=public"
```

## Exemple concret qui fonctionne

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c2VsZWN0ZWQtZ29iYmxlci05Mcatcoutcatcoutcatcout
CLERK_SECRET_KEY=sk_test_T0FoaFKpBXx7TcdgtVf4catcoutcatcoutcatcoutcatcout

DATABASE_URL="postgresql://postgres.unssdywzucatcout:haythemrehouma@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&schema=public"
DIRECT_URL="postgresql://postgres.unssdywzucatcout:haythemrehouma@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&schema=public"
```




`schema.prisma` – bloc datasource/generator :

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

<br/>­
<br/>­


# État de départ (Migration #1 – “init”)

Schéma initial (par ex. modèle `User` minime) :

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

Crée + applique la migration :

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Vérifie :

```bash
npx prisma migrate status
npx prisma studio
```

<br/>­
<br/>­


# Migration #2 – Ajouter `username`

On veut un champ unique et non nul.

Modifie `schema.prisma` :

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  username  String   @unique   // ← nouveau champ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

Crée + applique :

```bash
npx prisma migrate dev --name add_username_to_user
npx prisma generate
```

<br/>­
<br/>­


# Migration #3 – Ajouter un enum `Role` + champ `role`

On veut un rôle avec valeur par défaut.

Modifie `schema.prisma` :

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
  role      Role     @default(USER)  // ← nouveau champ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

Crée + applique :

```bash
npx prisma migrate dev --name add_role_enum_and_field
npx prisma generate
```

<br/>­
<br/>­


# Migration #4 – Ajouter `profileComplete` (bool) + `lastLogin` (nullable)

Modifie `schema.prisma` :

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
  profileComplete Boolean  @default(false)     // ← nouveau champ
  lastLogin       DateTime?                    // ← nouveau champ
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("users")
}
```

Crée + applique :

```bash
npx prisma migrate dev --name add_profile_complete_and_last_login
npx prisma generate
```

Vérifie la liste :

```bash
npx prisma migrate status
# attendu (exemple):
# 1. 20251023164944_init
# 2. 20251023170100_add_username_to_user
# 3. 20251023171200_add_role_enum_and_field
# 4. 20251023172300_add_profile_complete_and_last_login
```

<br/>­
<br/>­


# (Optionnel) Migration #5 – Ajouter un index composite

Exemple d’une 5e migration pour l’illustration :

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
  @@index([role, profileComplete]) // ← nouvel index
}
```

```bash
npx prisma migrate dev --name add_index_role_profileComplete
npx prisma generate
```

<br/>­
<br/>­


# Revenir à une migration antérieure (deux stratégies)

> Prisma **n’a pas** de “down” automatique.
> En **développement**, on peut **reset** (destructif).
> En **prod**, on **crée une nouvelle migration** qui “annule” logiquement les changements (non destructif pour l’historique).

## A) **Dev / Environnement jetable** (reset destructif)

**Objectif** : revenir à l’état de la **migration #3** (avant `profileComplete`, `lastLogin`, index…).
Méthode propre : revenir dans Git au commit où `prisma/migrations` s’arrêtait à #3, puis ré-appliquer tout.

1. Reviens au commit Git (où seules #1, #2, #3 existent) :

   ```bash
   git checkout <commit-avec-migration-3>
   ```
2. Réinitialise et réapplique depuis zéro :

   ```bash
   npx prisma migrate reset --skip-seed
   # Prisma va DROPPER et recréer le schéma, puis rejouer init → #3
   npx prisma generate
   ```
3. Vérifie :

   ```bash
   npx prisma migrate status
   npx prisma studio
   ```

> Alternative si tu ne veux pas bouger Git : **supprime localement** les dossiers des migrations > #3 (dans `prisma/migrations`), **retire** aussi les champs correspondants du `schema.prisma`, puis exécute `npx prisma migrate reset`. (Attention : bien garder la cohérence entre schéma et dossiers de migration, et garde ça pour du dev/local seulement.)

## B) **Prod / Environnement partagé** (rollback “logique” via **nouvelle** migration)

**Objectif** : “revenir” à #3 **sans détruire** l’historique ni drop la DB.

1. À partir de l’état actuel (jusqu’à #5, par ex.), **modifie le schéma** pour **supprimer** ce que tu veux annuler :

   * Retire `@@index([role, profileComplete])`
   * Retire `profileComplete`
   * Retire `lastLogin`
2. Génére une **nouvelle migration** qui effectuera ces suppressions :

   ```bash
   npx prisma migrate dev --name revert_to_migration_3_shape
   npx prisma generate
   ```
3. Commit + déploiement :

   ```bash
   # CI/Prod
   npx prisma migrate deploy
   npx prisma generate
   ```

> Ici, tu n’as pas “supprimé” les anciennes migrations : tu as **ajouté** une migration qui **inverse** les changements (meilleure traçabilité, pas de drop global).

<br/>­
<br/>­


# Outils utiles à chaque étape

* **Voir la liste / état** :

  ```bash
  npx prisma migrate status
  ```
* **Inspecter ce qu’une migration contient** : ouvre `prisma/migrations/<id_nom>/migration.sql`.
* **Comparer deux états de schéma** (pour générer un SQL à réviser) :

  ```bash
  npx prisma migrate diff \
    --from-migrations prisma/migrations \
    --to-schema-datamodel prisma/schema.prisma \
    --script
  ```
* **Marquer manuellement une migration comme “rolled back”** (avancé, ne change pas la DB) :

  ```bash
  npx prisma migrate resolve --rolled-back 20251023172300_add_profile_complete_and_last_login
  ```

  > À utiliser **uniquement** si tu as **déjà** remis la base toi-même dans l’état attendu (par ex. via `reset`) et veux **synchroniser l’historique** de Prisma. Ça n’exécute aucun SQL.

<br/>­
<br/>­

# Récap ultra-court

* **Créer/étendre** : modifie `schema.prisma` → `npx prisma migrate dev --name ...` → `npx prisma generate`.
* **4 migrations** : fais-les l'une après l'autre comme montré (username → role → profileComplete/lastLogin → index).
* **Revenir en arrière** :

  * **Dev** : `git checkout` vers l'ancienne révision + `npx prisma migrate reset`.
  * **Prod** : **nouvelle migration** qui **retire** les champs/index ajoutés (rollback "logique"), puis `migrate deploy`.

---

# Troubleshooting : Problèmes courants et solutions

## 1. Erreur : "Tenant or user not found"

### Symptôme

```
Error: FATAL: Tenant or user not found
```

### Cause

Vous utilisez le **pooler** Supabase au lieu de la **connexion directe**.

### Diagnostic

```bash
# Vérifier votre .env
cat .env | grep DATABASE_URL
# Si vous voyez "pooler.supabase.com" → PROBLÈME
```

### Solution

Remplacer dans `.env` :

**AVANT (pooler - ne fonctionne pas)** :
```env
DATABASE_URL="postgresql://postgres.xxx@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

**APRÈS (direct - fonctionne)** :
```env
DATABASE_URL="postgresql://postgres.unssdywzucatcout:haythemrehouma@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&schema=public"
DIRECT_URL="postgresql://postgres.unssdywzucatcout:haythemrehouma@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&schema=public"
```

**Note** : Même si c'est toujours `pooler.supabase.com`, le paramètre `?sslmode=require` au lieu de `?pgbouncer=true` change le comportement.

### Vérifier la connexion

```bash
npx prisma db pull
# Si succès → connexion OK
```

---

## 2. Erreur : "Migration already applied"

### Symptôme

```
Error: P3009
Migration `xxx` has already been applied to the database
```

### Cause

La migration existe dans la table `_prisma_migrations` mais pas dans votre dossier local `prisma/migrations`.

### Diagnostic

```bash
npx prisma migrate status
```

### Solution A : Marquer comme appliquée

```bash
npx prisma migrate resolve --applied <nom-migration>
npx prisma generate
```

### Solution B : Reset complet (dev uniquement)

```bash
npx prisma migrate reset --skip-seed
npx prisma generate
```

---

## 3. Erreur : "Unique constraint violation"

### Symptôme

```
Error: Unique constraint failed on the fields: (`email`)
```

### Cause

Des données existantes violent la contrainte unique que vous essayez d'ajouter.

### Diagnostic

```bash
# Ouvrir Prisma Studio
npx prisma studio

# Chercher les doublons
# SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
```

### Solution A : Nettoyer les doublons manuellement

Dans Prisma Studio :
1. Identifier les doublons
2. Supprimer ou modifier les entrées en conflit
3. Relancer la migration

### Solution B : Reset (dev uniquement)

```bash
npx prisma migrate reset
```

---

## 4. Erreur : "Direct URL required"

### Symptôme

```
Error: You must provide `directUrl` in your Prisma schema
```

### Cause

DIRECT_URL manquant dans `.env` ou `datasource` dans schema.prisma.

### Solution

**Étape 1** : Ajouter dans `.env`

```env
DIRECT_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require"
```

**Étape 2** : Vérifier `schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // ← Doit être présent
}
```

**Étape 3** : Relancer

```bash
npx prisma migrate dev --name test
```

---

## 5. Erreur : "Cannot add NOT NULL column"

### Symptôme

```
Error: Cannot add NOT NULL column without default value
```

### Cause

Vous ajoutez un champ obligatoire (`String`) sur une table qui contient déjà des données.

### Diagnostic

```bash
# Vérifier si la table a des données
npx prisma studio
```

### Solution A : Rendre le champ optionnel

```prisma
model User {
  username String?  // ← nullable
}
```

### Solution B : Ajouter une valeur par défaut

```prisma
model User {
  username String @default("user")  // ← default
}
```

### Solution C : Migration en deux étapes

```prisma
// Étape 1 : Ajouter nullable
username String?

// Migrer
npx prisma migrate dev --name add_username_nullable

// Étape 2 : Peupler les données
// UPDATE users SET username = CONCAT('user_', id);

// Étape 3 : Rendre obligatoire
username String  // ← retirer le ?

// Migrer
npx prisma migrate dev --name make_username_required
```

---

## 6. Erreur : "Migration is in a failed state"

### Symptôme

```
Migration `xxx` failed to apply cleanly to the database
State: FailedState
```

### Cause

Une migration s'est partiellement appliquée puis a échoué.

### Diagnostic

```bash
npx prisma migrate status
# Chercher "failed" dans la sortie
```

### Solution A : Marquer comme rolled back et réessayer

```bash
# Marquer comme annulée
npx prisma migrate resolve --rolled-back <nom-migration>

# Corriger le problème dans schema.prisma

# Recréer la migration
npx prisma migrate dev --name <nouveau-nom>
```

### Solution B : Reset (dev uniquement)

```bash
npx prisma migrate reset --skip-seed
```

---

## 7. Erreur : "Cannot connect to database"

### Symptôme

```
Error: Can't reach database server
```

### Cause

Plusieurs possibilités :
1. Mauvais mot de passe
2. Mauvaise URL
3. Firewall/IP non autorisée
4. Projet Supabase en pause

### Diagnostic

```bash
# Tester connexion simple
npx prisma db pull

# Vérifier l'URL
echo $DATABASE_URL
```

### Solution par étape

**1. Vérifier le mot de passe**

- Supabase Dashboard → Settings → Database
- Reset Database Password si nécessaire

**2. Vérifier l'URL**

Format attendu :
```
postgresql://postgres:MOT_DE_PASSE@db.PROJET.supabase.co:5432/postgres
```

**3. Vérifier les IP autorisées**

- Supabase Dashboard → Settings → Database
- Section "Connection pooling"
- Désactiver "Restrict connections" temporairement pour tester

**4. Vérifier que le projet n'est pas en pause**

- Supabase Dashboard → Accueil du projet
- Si "Paused" → cliquer "Resume"

---

## 8. Erreur : "P3014 - Migration conflicts"

### Symptôme

```
Error: P3014
Prisma Migrate could not create the shadow database
```

### Cause

Prisma ne peut pas créer de base temporaire pour valider la migration.

### Solution

Ajouter `SHADOW_DATABASE_URL` dans `.env` :

```env
SHADOW_DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require&schema=shadow"
```

Ou désactiver la shadow database (pas recommandé) :

```bash
npx prisma migrate dev --skip-generate --create-only
# Puis manuellement :
npx prisma migrate deploy
npx prisma generate
```

---

## 9. Migrations désynchronisées

### Symptôme

```
Prisma migrate found migrations applied to the database that are not in your local migrations folder
```

### Cause

Le dossier `prisma/migrations` local ne correspond pas à la table `_prisma_migrations` en base.

### Diagnostic

```bash
npx prisma migrate status
```

### Solution A : Synchroniser depuis la DB

```bash
# Pas de commande directe, mais vous pouvez :
# 1. Récupérer les migrations depuis Git
git pull origin main

# 2. Ou reset si dev
npx prisma migrate reset
```

### Solution B : Baseline (migration de référence)

```bash
# Créer un point de référence
npx prisma migrate resolve --applied <migration-manquante>
```

---

## 10. Erreur lors de `npx prisma generate`

### Symptôme

```
Error: Generator "client" failed
```

### Cause

Le client Prisma ne peut pas être généré (problème de syntaxe dans schema.prisma).

### Diagnostic

```bash
# Valider le schéma
npx prisma validate
```

### Solution

Corriger les erreurs dans `schema.prisma` :

**Erreurs courantes** :
- Virgules manquantes
- Relations mal définies
- Noms de champs invalides
- Attributs mal placés

```prisma
// ❌ Incorrect
model User {
  id String @id @default(cuid())
  email String @unique,  // ← virgule en trop
}

// ✅ Correct
model User {
  id String @id @default(cuid())
  email String @unique
}
```

---

## Scénarios complets de troubleshooting

### Scénario 1 : Premier setup échoue

```mermaid
graph TD
    START[Setup échoue] --> CHECK1{Connexion DB?}
    
    CHECK1 -->|Non| FIX1[Vérifier .env<br/>URL directe pas pooler]
    CHECK1 -->|Oui| CHECK2{Schéma valide?}
    
    FIX1 --> TEST1[npx prisma db pull]
    TEST1 --> CHECK2
    
    CHECK2 -->|Non| FIX2[npx prisma validate<br/>Corriger erreurs]
    CHECK2 -->|Oui| CHECK3{Migrations existantes?}
    
    FIX2 --> CHECK3
    
    CHECK3 -->|Oui| FIX3[npx prisma migrate reset]
    CHECK3 -->|Non| SUCCESS[npx prisma migrate dev]
    
    FIX3 --> SUCCESS
    
    style START fill:#ef9a9a,color:#000
    style CHECK1 fill:#fff9c4,color:#000
    style CHECK2 fill:#fff9c4,color:#000
    style CHECK3 fill:#fff9c4,color:#000
    style FIX1 fill:#ffd54f,color:#000
    style FIX2 fill:#ffd54f,color:#000
    style FIX3 fill:#ffd54f,color:#000
    style TEST1 fill:#b3e5fc,color:#000
    style SUCCESS fill:#66bb6a,color:#000
```

**Commandes de diagnostic** :
```bash
# 1. Tester connexion
npx prisma db pull

# 2. Valider schéma
npx prisma validate

# 3. Voir état migrations
npx prisma migrate status

# 4. Reset si nécessaire
npx prisma migrate reset --skip-seed
```

### Scénario 2 : Migration échoue en cours d'application

```mermaid
graph TD
    START[Migration échoue] --> LOG[Lire le message d'erreur]
    LOG --> TYPE{Type d'erreur?}
    
    TYPE -->|Constraint violation| SOL1[Nettoyer données<br/>Studio ou SQL]
    TYPE -->|Syntax error| SOL2[Corriger schema.prisma<br/>Relancer]
    TYPE -->|Connection lost| SOL3[Vérifier réseau<br/>Relancer]
    TYPE -->|Failed state| SOL4[migrate resolve rolled-back<br/>Recréer migration]
    
    SOL1 --> VERIFY[npx prisma migrate dev]
    SOL2 --> VERIFY
    SOL3 --> VERIFY
    SOL4 --> VERIFY
    
    VERIFY --> OK{Succès?}
    OK -->|Oui| DONE[Migration appliquée]
    OK -->|Non| RESET[npx prisma migrate reset<br/>Recommencer]
    
    RESET --> START
    
    style START fill:#ef9a9a,color:#000
    style LOG fill:#fff9c4,color:#000
    style TYPE fill:#ffd54f,color:#000
    style SOL1 fill:#ffcc80,color:#000
    style SOL2 fill:#ffcc80,color:#000
    style SOL3 fill:#ffcc80,color:#000
    style SOL4 fill:#ffcc80,color:#000
    style VERIFY fill:#b3e5fc,color:#000
    style OK fill:#fff9c4,color:#000
    style DONE fill:#66bb6a,color:#000
    style RESET fill:#ffab91,color:#000
```

### Scénario 3 : Rollback nécessaire en urgence

```mermaid
graph TD
    BUG[Bug en production] --> ASSESS[Évaluer gravité]
    
    ASSESS --> CRITICAL{Critique?}
    
    CRITICAL -->|Oui| HOTFIX[Hotfix immédiat]
    CRITICAL -->|Non| PLAN[Planifier rollback]
    
    HOTFIX --> BACKUP[Backup DB]
    BACKUP --> REVERT_SCHEMA[Modifier schema<br/>retirer champs]
    REVERT_SCHEMA --> CREATE_MIG[migrate dev revert]
    CREATE_MIG --> TEST_STAGING[Test staging]
    TEST_STAGING --> DEPLOY[migrate deploy prod]
    DEPLOY --> MONITOR[Monitor 24h]
    
    PLAN --> ANALYZE[Analyser cause]
    ANALYZE --> FIX[Préparer fix]
    FIX --> TEST_STAGING
    
    style BUG fill:#ef9a9a,color:#000
    style ASSESS fill:#ffd54f,color:#000
    style CRITICAL fill:#fff9c4,color:#000
    style HOTFIX fill:#ff6b6b,color:#000
    style PLAN fill:#ffd54f,color:#000
    style BACKUP fill:#fff176,color:#000
    style REVERT_SCHEMA fill:#ffab91,color:#000
    style CREATE_MIG fill:#ffa726,color:#000
    style TEST_STAGING fill:#81d4fa,color:#000
    style DEPLOY fill:#66bb6a,color:#000
    style MONITOR fill:#81c784,color:#000
    style ANALYZE fill:#b3e5fc,color:#000
    style FIX fill:#90caf9,color:#000
```

---

## Diagnostic en 5 étapes

### Flowchart de diagnostic complet

```mermaid
graph TD
    PROBLEM[Problème migration] --> STEP1[1. Vérifier connexion DB]
    
    STEP1 --> TEST1{npx prisma db pull<br/>fonctionne?}
    TEST1 -->|Non| FIX_DB[Fix: Corriger DATABASE_URL<br/>Vérifier mot de passe]
    TEST1 -->|Oui| STEP2[2. Valider schéma]
    
    FIX_DB --> STEP2
    
    STEP2 --> TEST2{npx prisma validate<br/>OK?}
    TEST2 -->|Non| FIX_SCHEMA[Fix: Corriger syntaxe schema]
    TEST2 -->|Oui| STEP3[3. Vérifier état migrations]
    
    FIX_SCHEMA --> STEP3
    
    STEP3 --> TEST3{npx prisma migrate status<br/>propre?}
    TEST3 -->|Failed| FIX_FAILED[Fix: migrate resolve rolled-back]
    TEST3 -->|Conflict| FIX_CONFLICT[Fix: migrate reset ou baseline]
    TEST3 -->|OK| STEP4[4. Tester migration]
    
    FIX_FAILED --> STEP4
    FIX_CONFLICT --> STEP4
    
    STEP4 --> TEST4{migrate dev<br/>fonctionne?}
    TEST4 -->|Non| CHECK_ERROR[Lire message d'erreur]
    TEST4 -->|Oui| STEP5[5. Générer client]
    
    CHECK_ERROR --> FIX_ERROR[Appliquer solution spécifique]
    FIX_ERROR --> STEP4
    
    STEP5 --> TEST5{npx prisma generate<br/>OK?}
    TEST5 -->|Non| FIX_GEN[Fix: npm install @prisma/client]
    TEST5 -->|Oui| SUCCESS[Succès]
    
    FIX_GEN --> STEP5
    
    style PROBLEM fill:#ef9a9a,color:#000
    style STEP1 fill:#b3e5fc,color:#000
    style STEP2 fill:#b3e5fc,color:#000
    style STEP3 fill:#b3e5fc,color:#000
    style STEP4 fill:#b3e5fc,color:#000
    style STEP5 fill:#b3e5fc,color:#000
    style TEST1 fill:#fff9c4,color:#000
    style TEST2 fill:#fff9c4,color:#000
    style TEST3 fill:#fff9c4,color:#000
    style TEST4 fill:#fff9c4,color:#000
    style TEST5 fill:#fff9c4,color:#000
    style FIX_DB fill:#ffd54f,color:#000
    style FIX_SCHEMA fill:#ffd54f,color:#000
    style FIX_FAILED fill:#ffd54f,color:#000
    style FIX_CONFLICT fill:#ffd54f,color:#000
    style CHECK_ERROR fill:#ffab91,color:#000
    style FIX_ERROR fill:#ffa726,color:#000
    style FIX_GEN fill:#ffd54f,color:#000
    style SUCCESS fill:#66bb6a,color:#000
```

---

## Commandes de diagnostic avancé

### Vérifier la table _prisma_migrations

```bash
# Voir toutes les migrations en DB
npx prisma db execute --stdin <<EOF
SELECT * FROM "_prisma_migrations" ORDER BY finished_at;
EOF
```

### Comparer schéma local vs DB

```bash
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

### Voir le SQL d'une migration

```bash
cat prisma/migrations/20251023170100_add_username_to_user/migration.sql
```

### Dry run d'une migration

```bash
npx prisma migrate dev --create-only --name test_migration
# Inspecter le SQL avant d'appliquer
cat prisma/migrations/xxx_test_migration/migration.sql
```

---

## Checklist de prévention des problèmes

### Avant chaque migration

- [ ] Backup de la base de données créé
- [ ] Schéma validé (`npx prisma validate`)
- [ ] Connexion testée (`npx prisma db pull`)
- [ ] État des migrations vérifié (`npx prisma migrate status`)
- [ ] Git commit avec schéma actuel
- [ ] Test en staging si production

### Pendant la migration

- [ ] Lire attentivement le message Prisma
- [ ] Vérifier le SQL généré si doute
- [ ] Surveiller les warnings
- [ ] Ne pas interrompre le processus

### Après la migration

- [ ] Vérifier status (`npx prisma migrate status`)
- [ ] Tester dans Prisma Studio
- [ ] Générer le client (`npx prisma generate`)
- [ ] Tester l'application
- [ ] Commit la migration

---

## Guide de survie : Que faire quand tout va mal

### Situation : Migrations complètement cassées

```mermaid
graph TD
    PANIC[Tout est cassé] --> CALM[Rester calme]
    CALM --> BACKUP_CHECK{Backup existe?}
    
    BACKUP_CHECK -->|Oui| RESTORE[Restore depuis backup]
    BACKUP_CHECK -->|Non| CHECK_ENV{Environnement?}
    
    CHECK_ENV -->|Dev/Local| NUKE[Solution nucléaire<br/>Reset total]
    CHECK_ENV -->|Production| CAREFUL[Analyse minutieuse<br/>Appeler support si besoin]
    
    NUKE --> DELETE_MIG[1. Supprimer prisma/migrations]
    DELETE_MIG --> RESET_DB[2. npx prisma migrate reset]
    RESET_DB --> FRESH[3. Recréer migration init]
    FRESH --> REBUILD[4. Réappliquer autres migrations]
    
    CAREFUL --> DOC[Documenter l'état]
    DOC --> EXPERT[Consulter expert]
    EXPERT --> PLAN_FIX[Plan de correction]
    PLAN_FIX --> EXECUTE[Exécution contrôlée]
    
    RESTORE --> VERIFY[Vérifier état]
    REBUILD --> VERIFY
    EXECUTE --> VERIFY
    
    style PANIC fill:#ff6b6b,color:#000
    style CALM fill:#ffd54f,color:#000
    style BACKUP_CHECK fill:#fff9c4,color:#000
    style RESTORE fill:#66bb6a,color:#000
    style CHECK_ENV fill:#fff9c4,color:#000
    style NUKE fill:#ef9a9a,color:#000
    style CAREFUL fill:#ffab91,color:#000
    style DELETE_MIG fill:#ffccbc,color:#000
    style RESET_DB fill:#ef9a9a,color:#000
    style FRESH fill:#a5d6a7,color:#000
    style REBUILD fill:#81c784,color:#000
    style DOC fill:#b3e5fc,color:#000
    style EXPERT fill:#90caf9,color:#000
    style PLAN_FIX fill:#81d4fa,color:#000
    style EXECUTE fill:#66bb6a,color:#000
    style VERIFY fill:#81c784,color:#000
```

**Commandes solution nucléaire (dev uniquement)** :
```bash
# 1. Supprimer toutes les migrations locales
rm -rf prisma/migrations

# 2. Reset la DB complètement
npx prisma migrate reset --skip-seed --force

# 3. Recréer depuis zéro
npx prisma migrate dev --name init

# 4. Générer
npx prisma generate

# 5. Vérifier
npx prisma migrate status
npx prisma studio
```

---

## Bonnes pratiques pour éviter les problèmes

### En développement

1. **Toujours commiter avant une migration**
   ```bash
   git add .
   git commit -m "Before migration: add username"
   npx prisma migrate dev --name add_username
   ```

2. **Tester avec peu de données**
   - Garder la DB de dev légère
   - Facile à reset si problème

3. **Utiliser des branches Git**
   ```bash
   git checkout -b feature/add-username
   # Faire la migration
   # Tester
   # Merger seulement si OK
   ```

### En production

1. **Toujours tester en staging d'abord**
2. **Faire un backup avant migration**
3. **Appliquer en heures creuses**
4. **Avoir un plan de rollback**
5. **Monitorer après déploiement**

---

## Ressources et aide

### Commandes rapides de dépannage

```bash
# État général
npx prisma migrate status

# Valider schéma
npx prisma validate

# Tester connexion
npx prisma db pull

# Voir différences
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script

# Reset complet (dev)
npx prisma migrate reset --skip-seed

# Studio pour inspecter
npx prisma studio
```

### Documentation officielle

- Prisma Migrations : https://www.prisma.io/docs/concepts/components/prisma-migrate
- Troubleshooting : https://www.prisma.io/docs/guides/database/troubleshooting-orm
- Supabase + Prisma : https://supabase.com/docs/guides/integrations/prisma

### Support

- Prisma Discord : https://pris.ly/discord
- Supabase Discord : https://discord.supabase.com
- Stack Overflow : Tag `prisma` + `supabase`

---

## Annexe : Exemples de messages d'erreur et solutions rapides

| Message d'erreur | Solution rapide |
|------------------|-----------------|
| `Tenant or user not found` | Utiliser connexion directe, pas pooler |
| `Migration already applied` | `npx prisma migrate resolve --applied <name>` |
| `Unique constraint failed` | Nettoyer doublons dans Studio |
| `Direct URL required` | Ajouter `DIRECT_URL` dans .env |
| `Cannot add NOT NULL` | Rendre champ nullable ou ajouter default |
| `Migration in failed state` | `npx prisma migrate resolve --rolled-back <name>` |
| `Cannot connect` | Vérifier mot de passe et URL |
| `Shadow database error` | Ajouter `SHADOW_DATABASE_URL` |
| `Generator failed` | `npx prisma validate` puis corriger |
| `Migrations out of sync` | Reset ou baseline |

---

**Document mis à jour le** : 2025-10-23

**Section ajoutée** : Troubleshooting complet avec 10 erreurs courantes et solutions

**Diagrammes** : 4 flowcharts de diagnostic et résolution
