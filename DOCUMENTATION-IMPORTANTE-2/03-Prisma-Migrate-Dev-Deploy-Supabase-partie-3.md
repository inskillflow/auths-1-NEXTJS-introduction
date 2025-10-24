# 1) Variables d’environnement (.env)

* `DATABASE_URL`
  **URL principale** utilisée par Prisma Migrate et par ton app en runtime.
  → Sur Supabase, préfère l’URL **pooler (pgbouncer)** pour l’app en prod (meilleure gestion des connexions), et l’URL **directe** pour les migrations (voir ci-dessous).

* `DIRECT_URL`
  **URL directe** (non-poolée) utilisée par Prisma pour certaines opérations (p. ex. introspection, push).
  → Sur Supabase, mets l’URL **directe** (host `db.<project>.supabase.co`) pour éviter les limitations du pooler lors des migrations/générations.

* `SHADOW_DATABASE_URL`
  Utilisée par `migrate dev` pour créer une **shadow DB** temporaire afin de calculer les diffs en local.
  → Sur Supabase, tu peux aussi la pointer vers l’URL directe. (En local, souvent c’est une DB docker/postgres).

**Astuce Supabase**

* **App (Next.js)** : `DATABASE_URL` = **pooler** (`...pooler.supabase.com?...&pgbouncer=true`)
* **Prisma (migrations)** : `DIRECT_URL`/**`SHADOW_DATABASE_URL`** = **direct** (`db.<project>.supabase.co`)

<br/>
<br/>

# 2) Bloc `datasource` / `generator` (schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pour l’app
  directUrl = env("DIRECT_URL")     // pour prisma (introspection/migrations)
}
```

* `generator client` : indique à Prisma de générer le **client JS/TS**.
* `datasource db` : configure la **source de données** (PostgreSQL) et d’où Prisma lit les URLs.

<br/>
<br/>


# 3) Commandes Prisma — explications complètes

## a) Créer / appliquer des migrations en **développement**

### `npx prisma migrate dev --name <nom>`

* **But** : créer **et appliquer** une nouvelle migration basée sur tes changements dans `schema.prisma`.
* **Ce que ça fait** :

  1. Compare `schema.prisma` ↔ DB (via shadow DB).
  2. Crée un dossier `prisma/migrations/<timestamp>_<nom>/migration.sql`.
  3. **Applique** ce SQL sur ta base de dev.
  4. Met à jour la table interne `_prisma_migrations`.
* **Quand l’utiliser** : en **local/dev** après avoir modifié le schéma.
* ⚠️ En cas de divergence, `migrate dev` peut proposer un **reset destructif** (drop + recreate). À éviter sur une DB à conserver.

### `--create-only`

* Variante utile : `npx prisma migrate dev --name <nom> --create-only`
* **But** : **créer** le dossier de migration **sans l’appliquer**.
* **Quand** : quand tu veux versionner la migration et la faire appliquer plus tard via `deploy` (prod/staging).

<br/>
<br/>


## b) Déployer des migrations en **staging/prod**

### `npx prisma migrate deploy`

* **But** : **appliquer** toutes les migrations **déjà générées** (dans `prisma/migrations`) à la base cible.
* **Ce que ça fait** : lit l’historique `_prisma_migrations`, applique l’ordre manquant, **sans rien générer**.
* **Quand** : en **CI/Prod/Staging**. Jamais de génération, uniquement l’application “en lecture” de ce qui est versionné.
* ✅ **Sûr** (comparé à `dev`) : n’essaie pas de reset et n’invente aucune migration.

<br/>
<br/>


## c) Générer le client

### `npx prisma generate`

* **But** : (re)générer le **Prisma Client** à partir du schéma.
* **Quand** : après `migrate dev`, après un changement dans `schema.prisma`, ou dans la CI avant build/deploy.
* **Effet** : met à jour `node_modules/@prisma/client` et types TS.

<br/>
<br/>


## d) Inspecter / diagnostiquer

### `npx prisma migrate status`

* **But** : afficher l’état des migrations (appliquées/pas appliquées, divergence potentielle).
* **Quand** : avant un déploiement, en cas de doute sur l’alignement.

### `npx prisma studio`

* **But** : ouvrir une UI web locale pour **visualiser/éditer** les données (CRUD rapide).
* **Quand** : pour vérifier tes records, tester rapidement. (Dev surtout.)

### `npx prisma migrate diff ...`

* **But** : **comparer** deux états et éventuellement produire un **script SQL**.
* **Usages courants** :

  * **DB → schema** : voir ce qui diffère entre **la base actuelle** et ton `schema.prisma`.

    ```bash
    npx prisma migrate diff \
      --from-url "$DATABASE_URL" \
      --to-schema-datamodel prisma/schema.prisma
    ```
  * **Migrations → schema** : voir ce qui changerait si on regénérait à partir des migrations.

    ```bash
    npx prisma migrate diff \
      --from-migrations prisma/migrations \
      --to-schema-datamodel prisma/schema.prisma
    ```
  * **Produire un SQL** (à relire et exécuter manuellement si besoin) :

    ```bash
    npx prisma migrate diff \
      --from-url "$DATABASE_URL" \
      --to-schema-datamodel prisma/schema.prisma \
      --script > fix.sql
    ```

<br/>
<br/>


## e) Résoudre des problèmes d’historique (sans toucher aux données)

### `npx prisma migrate resolve --applied <id_ou_nom>`

* **But** : dire à Prisma “**considère cette migration comme appliquée**” **sans exécuter de SQL**.
* **Quand** : par exemple si la DB a déjà la table `users`, mais que `_prisma_migrations` ne le reflète pas (cas “baseline” en prod).
* **Effet** : met à jour `_prisma_migrations` pour réaligner l’historique.

### `npx prisma migrate resolve --rolled-back <id_ou_nom>`

* **But** : marquer une migration comme **annulée** côté historique (toujours **sans** exécuter de SQL).
* **Quand** : tu as manuellement remis la DB dans un état antérieur (ex. via `reset`) et tu veux synchroniser l’historique Prisma.

> ⚠️ `migrate resolve` **ne modifie pas** le schéma de la base. Il sert à **rattraper l’état** administratif des migrations.

<br/>
<br/>


## f) Repartir de zéro (Destructif — Dev uniquement)

### `npx prisma migrate reset`

* **But** : **DROPPER** le schéma (ou la base selon config), **rejouer** toutes les migrations depuis la #1, puis (optionnel) reseed.
* **Quand** : **dev/local** seulement, quand tu acceptes de perdre les données.
* **Options utiles** :

  * `--skip-seed` : ne pas exécuter de script de seed.
  * `-f` / `--force` : ne pas demander de confirmation.

<br/>
<br/>


# 4) Scénarios types

## Dev (local)

1. Tu modifies `schema.prisma`.
2. `npx prisma migrate dev --name some_change`
3. `npx prisma generate`
4. (option) `npx prisma studio` pour vérifier.

> Si `migrate dev` propose un **reset**, accepte **seulement** si ta DB locale est jetable.

## Prod/Staging (Supabase)

1. En local/CI : `npx prisma migrate dev --name <...> --create-only` (génère la migration, **n’applique pas**).
2. Commit/Push des dossiers `prisma/migrations`.
3. Sur l’environnement cible : `npx prisma migrate deploy` (applique **sans** reset).

## Baselining (table déjà existante)

* `migrate diff` pour vérifier qu’il n’y a pas de vrai écart dangereux.
* `npx prisma migrate resolve --applied <id_init>`
* Puis `npx prisma migrate deploy`.

---

# 5) Pièges fréquents & comment les éviter

* **`ERROR: relation "users" already exists`** lors de `deploy`
  → La table existe déjà : fais un **baseline** avec `migrate resolve --applied <init>` (après avoir vérifié avec `migrate diff`).

* **Reset proposé par `migrate dev` sur Supabase**
  → **N’accepte pas** si tu tiens aux données. En prod/staging, utilise **toujours** `migrate deploy`.

* **Conflits d’uniques** (`email`, `username`, `clerkId`)
  → Vérifie et nettoie les doublons avant d’appliquer la migration :

  ```sql
  SELECT email, COUNT(*) FROM public.users GROUP BY 1 HAVING COUNT(*) > 1;
  SELECT username, COUNT(*) FROM public.users GROUP BY 1 HAVING COUNT(*) > 1;
  SELECT clerkid, COUNT(*) FROM public.users GROUP BY 1 HAVING COUNT(*) > 1;
  ```

* **Pooler vs Direct**
  → Migrations et opérations Prisma “sensibles” : **URL directe**.
  → App (runtime) : **pooler** (`pgbouncer=true`).

<br/>
<br/>


# 6) Résumé « cheat-sheet »

```bash
# Dev: créer + appliquer une migration
npx prisma migrate dev --name <nom>
npx prisma generate

# Dev (créer sans appliquer, pour déployer plus tard)
npx prisma migrate dev --name <nom> --create-only

# Prod/Staging: appliquer les migrations versionnées
npx prisma migrate deploy

# Voir l’état des migrations
npx prisma migrate status

# Comparer DB ↔ schema (et générer un SQL si besoin)
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script > fix.sql

# Baseline/resolve (ne touche pas à la DB, maj de l’historique)
npx prisma migrate resolve --applied <id_ou_nom>
npx prisma migrate resolve --rolled-back <id_ou_nom>

# Reset (destructif, dev uniquement)
npx prisma migrate reset --skip-seed
```


