# Pré-requis (une fois)

`.env` (connexion **directe**, pas le “pooler”) :

```env
DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres?sslmode=require&schema=public"
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres?sslmode=require&schema=public"
SHADOW_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres?sslmode=require&schema=public"
```

#### Exemple concret

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c2VsZWN0ZWQtZ29iYmxlci05My5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_T0FoaFKpBXx7TcdgtVf4xDpB52TfV0w2oT5cUY99Cr

DATABASE_URL="postgresql://postgres.unssdywzuzguqpiuezam:haythemrehouma@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&schema=public"
DIRECT_URL="postgresql://postgres.unssdywzuzguqpiuezam:haythemrehouma@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&schema=public"
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
* **4 migrations** : fais-les l’une après l’autre comme montré (username → role → profileComplete/lastLogin → index).
* **Revenir en arrière** :

  * **Dev** : `git checkout` vers l’ancienne révision + `npx prisma migrate reset`.
  * **Prod** : **nouvelle migration** qui **retire** les champs/index ajoutés (rollback “logique”), puis `migrate deploy`.

