# Toutes les commandes

# 0) Aide & version

### `npx prisma -h`

> Affiche l’aide générale et la liste des sous-commandes.

### `npx prisma --version`  *(alias : `-v`)*

> Affiche les versions du CLI, du client, et de l’Engine (utile pour déboguer).

---

# 1) Génération & validation

### `npx prisma generate`

> (Re)génère **Prisma Client** selon `schema.prisma` (met à jour `node_modules/@prisma/client`).

**Exemple**

```bash
npx prisma generate
```

### `npx prisma format`

> Formate `schema.prisma` (indentation, ordre des attributs) comme `prettier` pour Prisma.

**Exemple**

```bash
npx prisma format
```

### `npx prisma validate`

> Valide la **syntaxe** et la **cohérence** du `schema.prisma` (sans toucher à la DB).

**Exemple**

```bash
npx prisma validate
```

### `npx prisma init`

> Crée un squelette Prisma (dossier `prisma/`, `schema.prisma`, `.env` si absent).

**Exemple**

```bash
npx prisma init
```

---

# 2) Migrations (production-safe & dev)

## 2.1 Créer et appliquer (DEV)

### `npx prisma migrate dev --name <nom>`

> **Crée** un dossier de migration à partir des changements du schéma et **l’applique** sur la DB de dev. Peut demander un **reset** destructif s’il y a divergence.

**Exemples**

```bash
# 1) création initiale
npx prisma migrate dev --name init

# 2) ajout d'une colonne
npx prisma migrate dev --name add_username_to_user
```

### Option : `--create-only`

> Génère la migration **sans** l’appliquer (idéal pour CI → deploy en prod).

**Exemple**

```bash
npx prisma migrate dev --name add_role_enum --create-only
```

## 2.2 Déployer (STAGING/PROD)

### `npx prisma migrate deploy`

> **Applique** sur la DB cible toutes les migrations **déjà générées** (ne génère rien, **sans reset**).

**Exemple**

```bash
npx prisma migrate deploy
```

## 2.3 Statut & diff

### `npx prisma migrate status`

> Affiche l’état : migrations appliquées / en attente / divergence.

**Exemple**

```bash
npx prisma migrate status
```

### `npx prisma migrate diff ...`

> Compare deux états (**DB ↔ schéma** ou **migrations ↔ schéma**) et peut produire un **script SQL**.

**Exemples usuels**

```bash
# Comparer la DB réelle à ton schéma
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma

# Générer un script SQL pour aligner la DB sur le schéma
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > fix.sql

# Comparer l'historique des migrations à ton schéma (cohérence du repo)
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma
```

### `npx prisma migrate resolve --applied <id_ou_nom>`

> **Baselining** : marque une migration comme **appliquée** dans `_prisma_migrations` **sans exécuter de SQL** (utile si la table existe déjà en prod).

**Exemple**

```bash
npx prisma migrate resolve --applied 20251023164944_init
```

### `npx prisma migrate resolve --rolled-back <id_ou_nom>`

> Marque une migration comme **annulée** côté historique (ne change pas la DB). À utiliser **uniquement** si tu as déjà remis la DB au bon état par ailleurs.

**Exemple**

```bash
npx prisma migrate resolve --rolled-back 20251023172300_add_profile_complete
```

## 2.4 Reset (DEV uniquement – destructif)

### `npx prisma migrate reset [--skip-seed] [-f]`

> **Drop** le schéma, **rejoue** toutes les migrations depuis la #1, puis exécute (ou pas) le **seed**.

**Exemples**

```bash
# Reset "safe" (demande confirmation)
npx prisma migrate reset

# Reset forcé sans seed
npx prisma migrate reset -f --skip-seed
```

> **Jamais** en prod. Utile pour repartir propre en local.

---

# 3) Commandes « DB » (sans migrations)

### `npx prisma db pull`

> **Introspecte** la DB → met à jour ton `schema.prisma` depuis la DB (read-only).

**Exemple**

```bash
npx prisma db pull
```

### `npx prisma db push`

> Pousse ton **schéma** sur la DB **sans créer de migration**.
> **Attention** : pratique pour des POC ou dev rapide, **à éviter en prod** (pas d’historique).

**Exemple**

```bash
npx prisma db push
```

### `npx prisma db seed`

> Lance le script de **seed** défini dans `package.json` (`"prisma": {"seed": "tsx prisma/seed.ts"}`).

**Exemple**

```bash
npx prisma db seed
```

### `npx prisma db execute --file <path.sql> [--url ... | --schema ...]`

> Exécute un **script SQL** brut contre la DB (idéal pour appliquer `fix.sql` généré via `migrate diff`).

**Exemples**

```bash
# Exécuter un SQL depuis un fichier
npx prisma db execute --file fix.sql --url "$DATABASE_URL"

# Lire le SQL depuis STDIN
cat fix.sql | npx prisma db execute --stdin --url "$DATABASE_URL"
```

---

# 4) Studio (CRUD visuel)

### `npx prisma studio`

> Ouvre une UI locale pour **voir/éditer** tes tables (très pratique en dev).

**Exemple**

```bash
npx prisma studio
```

---

# 5) Bonnes pratiques Supabase (URLs)

> **Règle d’or** :
> **App (runtime)** → **Pooler** (`...pooler.supabase.com?pgbouncer=true`)
> **Migrations/Introspection** → **Direct** (`db.<project>.supabase.co`)

**Exemple `.env`**

```env
# App (Next.js)
DATABASE_URL="postgresql://postgres.<hash>:<pwd>@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&schema=public"

# Prisma (migrate/introspection)
DIRECT_URL="postgresql://postgres:<pwd>@db.<project>.supabase.co:5432/postgres?sslmode=require&schema=public"
SHADOW_DATABASE_URL="postgresql://postgres:<pwd>@db.<project>.supabase.co:5432/postgres?sslmode=require&schema=public"
```

---

# 6) Recettes rapides (copier-coller)

## Créer → appliquer migration en dev

```bash
npx prisma migrate dev --name add_profile_flags
npx prisma generate
```

> **Crée et applique** une migration basée sur tes changements du schéma. Regénère le client.

## Générer migration sans l’appliquer (pour prod)

```bash
npx prisma migrate dev --name add_index --create-only
git add prisma/migrations
git commit -m "feat(db): add index"
# Sur prod/staging :
npx prisma migrate deploy
```

> **Sépare** génération (dev/CI) et **déploiement** (prod).

## Baselining quand la table existe déjà

```bash
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma
npx prisma migrate resolve --applied 20251023164944_init
npx prisma migrate deploy
```

> **Vérifie** le diff, puis **marque** la migration initiale comme **appliquée**, et **déploie** la suite.

## Produire un SQL de correction (sans migrations)

```bash
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > fix.sql

# Relire, puis appliquer :
npx prisma db execute --file fix.sql --url "$DATABASE_URL"
```

> Utile quand tu veux **garder le contrôle** des changements SQL.

## Reset local propre

```bash
npx prisma migrate reset -f --skip-seed
npx prisma generate
```

> Repart **de zéro** en dev, rejoue tout, regénère le client.

---

# 7) Anti-pièges

> **Ne jamais** accepter un **reset** en prod/staging (utilise `migrate deploy`).
> Si tu vois `ERROR: relation "users" already exists` → **baseline** avec `migrate resolve --applied <init>` **après** un `migrate diff`.
> Les contraintes **UNIQUE** (email/username/clerkId) échouent si tu as des **doublons** : **nettoie** d’abord.

**Requêtes utiles (Supabase)**

```sql
SELECT email, COUNT(*) FROM public.users GROUP BY 1 HAVING COUNT(*) > 1;
SELECT username, COUNT(*) FROM public.users GROUP BY 1 HAVING COUNT(*) > 1;
SELECT clerkid, COUNT(*) FROM public.users GROUP BY 1 HAVING COUNT(*) > 1;
```

