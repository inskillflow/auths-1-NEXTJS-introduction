# Guide Complet des Commandes Prisma Migrate

Document de référence exhaustif listant toutes les commandes Prisma pour les migrations, leur utilisation, options et cas d'usage.

---

# Table des matieres

1. [Commandes principales](#commandes-principales)
2. [Commandes de diagnostic](#commandes-de-diagnostic)
3. [Commandes de résolution](#commandes-de-résolution)
4. [Commandes avancées](#commandes-avancées)
5. [Options et flags](#options-et-flags)
6. [Workflows complets](#workflows-complets)
7. [Cas d'usage par situation](#cas-dusage-par-situation)

---

## Commandes principales

### 1. `npx prisma migrate dev`

**Description** : Crée et applique une migration en environnement de développement.

**Syntaxe** :
```bash
npx prisma migrate dev [options]
```

**Options courantes** :
```bash
# Avec nom de migration
npx prisma migrate dev --name add_username

# Créer sans appliquer
npx prisma migrate dev --create-only --name test_migration

# Skip la génération du client
npx prisma migrate dev --skip-generate

# Skip le seed
npx prisma migrate dev --skip-seed
```

**Comportement** :
1. Détecte les changements dans `schema.prisma`
2. Crée un fichier SQL dans `prisma/migrations/`
3. Applique la migration à la DB
4. Met à jour `_prisma_migrations`
5. Génère le client Prisma
6. Exécute le seed (si présent)

**Cas d'usage** :
- Développement local
- Ajout de nouvelles tables/colonnes
- Modification de schéma
- Prototypage rapide

**Diagramme** :
```mermaid
graph TD
    START[npx prisma migrate dev] --> DETECT[Détecte changements<br/>schema.prisma]
    DETECT --> CREATE[Crée migration SQL]
    CREATE --> APPLY[Applique à la DB]
    APPLY --> UPDATE[Met à jour _prisma_migrations]
    UPDATE --> GEN[Génère client]
    GEN --> SEED[Exécute seed]
    SEED --> DONE[Terminé]
    
    style START fill:#66bb6a,color:#000
    style DETECT fill:#b3e5fc,color:#000
    style CREATE fill:#a5d6a7,color:#000
    style APPLY fill:#81c784,color:#000
    style UPDATE fill:#81d4fa,color:#000
    style GEN fill:#90caf9,color:#000
    style SEED fill:#c8e6c9,color:#000
    style DONE fill:#4caf50,color:#fff
```



[↑ Retour à la table des matières](#table-des-matieres)

<br/>
<br/>


### 2. `npx prisma migrate deploy`

**Description** : Applique les migrations en production (n'en crée pas de nouvelles).

**Syntaxe** :
```bash
npx prisma migrate deploy
```

**Comportement** :
1. Lit les migrations dans `prisma/migrations/`
2. Compare avec `_prisma_migrations` en DB
3. Applique les migrations manquantes
4. Ne génère PAS le client automatiquement

**Cas d'usage** :
- Déploiement en production
- CI/CD pipelines
- Environnements staging
- Serveurs multiples

**Workflow production** :
```bash
# 1. Build
npm run build

# 2. Appliquer migrations
npx prisma migrate deploy

# 3. Générer client
npx prisma generate

# 4. Démarrer application
npm start
```

**Diagramme** :
```mermaid
graph TD
    START[npx prisma migrate deploy] --> READ[Lit prisma/migrations/]
    READ --> COMPARE[Compare avec DB]
    COMPARE --> PENDING{Migrations<br/>manquantes?}
    
    PENDING -->|Oui| APPLY[Applique dans l'ordre]
    PENDING -->|Non| SKIP[Aucune action]
    
    APPLY --> VERIFY[Vérifie succès]
    VERIFY --> SUCCESS[Terminé]
    SKIP --> SUCCESS
    
    style START fill:#66bb6a,color:#000
    style READ fill:#b3e5fc,color:#000
    style COMPARE fill:#81d4fa,color:#000
    style PENDING fill:#fff9c4,color:#000
    style APPLY fill:#81c784,color:#000
    style VERIFY fill:#90caf9,color:#000
    style SUCCESS fill:#4caf50,color:#fff
    style SKIP fill:#ffd54f,color:#000
```

---

### 3. `npx prisma migrate reset`

**Description** : Reset complet de la base de données et réapplication de toutes les migrations.

**Syntaxe** :
```bash
npx prisma migrate reset [options]
```

**Options** :
```bash
# Skip le seed
npx prisma migrate reset --skip-seed

# Forcer sans confirmation
npx prisma migrate reset --force

# Skip génération
npx prisma migrate reset --skip-generate
```

**Comportement** :
1. **DROP** toutes les tables
2. Recrée le schéma depuis zéro
3. Rejoue toutes les migrations dans l'ordre
4. Génère le client
5. Exécute le seed

**⚠️ ATTENTION** :
- **DESTRUCTIF** : Supprime toutes les données
- **Développement uniquement**
- **Ne jamais** utiliser en production

**Cas d'usage** :
- Reset DB de développement
- Nettoyer après tests
- Recommencer à zéro
- Résoudre conflits complexes

**Diagramme** :
```mermaid
graph TD
    START[npx prisma migrate reset] --> WARNING[⚠️ DESTRUCTIF]
    WARNING --> CONFIRM{Confirmer?}
    
    CONFIRM -->|Non| CANCEL[Annulé]
    CONFIRM -->|Oui| DROP[DROP toutes les tables]
    
    DROP --> RECREATE[Recrée schéma vide]
    RECREATE --> REPLAY[Rejoue toutes migrations]
    REPLAY --> GEN[Génère client]
    GEN --> SEED[Exécute seed]
    SEED --> DONE[DB réinitialisée]
    
    style START fill:#ef9a9a,color:#000
    style WARNING fill:#ff6b6b,color:#fff
    style CONFIRM fill:#fff9c4,color:#000
    style CANCEL fill:#ffd54f,color:#000
    style DROP fill:#ef9a9a,color:#000
    style RECREATE fill:#ffab91,color:#000
    style REPLAY fill:#ffa726,color:#000
    style GEN fill:#81d4fa,color:#000
    style SEED fill:#90caf9,color:#000
    style DONE fill:#66bb6a,color:#000
```

---

### 4. `npx prisma migrate resolve`

**Description** : Marquer une migration comme appliquée ou annulée sans exécuter de SQL.

**Syntaxe** :
```bash
npx prisma migrate resolve --applied <migration-name>
npx prisma migrate resolve --rolled-back <migration-name>
```

**Options** :

**`--applied`** : Marquer comme appliquée
```bash
npx prisma migrate resolve --applied 20251023170100_add_username
```

**`--rolled-back`** : Marquer comme annulée
```bash
npx prisma migrate resolve --rolled-back 20251023170100_add_username
```

**Comportement** :
- Met à jour la table `_prisma_migrations`
- **N'exécute AUCUN SQL**
- Synchronise l'état seulement

**Cas d'usage** :
- Migration appliquée manuellement via SQL
- Migration échouée à nettoyer
- Synchronisation après restauration backup
- Résolution de conflits d'état

**⚠️ ATTENTION** :
Utiliser seulement si vous avez déjà effectué l'opération manuellement en DB.

---

### 5. `npx prisma migrate status`

**Description** : Affiche l'état de toutes les migrations.

**Syntaxe** :
```bash
npx prisma migrate status
```

**Sortie typique** :
```
Database schema is up to date!

Migrations:
  ✓ 20251023164944_init
  ✓ 20251023170100_add_username_to_user
  ✓ 20251023171200_add_role_enum_and_field
  ⚠ 20251023172300_add_profile_complete (pending)
  ✗ 20251023173400_add_index (failed)
```

**États possibles** :
- ✓ **Applied** : Migration appliquée avec succès
- ⚠ **Pending** : Migration pas encore appliquée
- ✗ **Failed** : Migration échouée
- 🔄 **Rolled back** : Migration annulée

**Cas d'usage** :
- Vérifier l'état avant déploiement
- Diagnostiquer des problèmes
- Valider après migration
- Audit de l'historique

---

### 6. `npx prisma migrate diff`

**Description** : Compare deux états de schéma et génère le SQL de différence.

**Syntaxe** :
```bash
npx prisma migrate diff \
  --from-<source> <value> \
  --to-<target> <value> \
  [--script]
```

**Sources/Targets possibles** :
- `--from-empty` / `--to-empty`
- `--from-schema-datamodel <path>`
- `--to-schema-datamodel <path>`
- `--from-schema-datasource <path>`
- `--to-schema-datasource <path>`
- `--from-migrations <path>`
- `--to-migrations <path>`
- `--from-url <url>`
- `--to-url <url>`

**Exemples pratiques** :

**Comparer schéma local vs DB actuelle** :
```bash
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

**Voir ce que ferait une migration** :
```bash
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

**Comparer DB vide vs schéma actuel** :
```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

**Comparer deux schémas** :
```bash
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.old.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

**Cas d'usage** :
- Prévisualiser une migration
- Générer SQL manuel
- Comparer environnements
- Audit des changements

---

## Commandes de diagnostic

### 7. `npx prisma db pull`

**Description** : Introspection de la DB pour générer/mettre à jour le schéma Prisma.

**Syntaxe** :
```bash
npx prisma db pull [options]
```

**Options** :
```bash
# Forcer l'écrasement
npx prisma db pull --force

# Afficher seulement, ne pas écrire
npx prisma db pull --print

# Spécifier le schéma
npx prisma db pull --schema=./autre/schema.prisma
```

**Comportement** :
1. Se connecte à la DB
2. Lit la structure (tables, colonnes, relations)
3. Génère le schéma Prisma correspondant
4. Écrase `schema.prisma`

**Cas d'usage** :
- Tester la connexion DB
- Reverse engineering d'une DB existante
- Synchroniser après modifications manuelles SQL
- Découvrir une DB inconnue

**⚠️ ATTENTION** :
Écrase votre `schema.prisma` ! Faire un backup avant.

---

### 8. `npx prisma db push`

**Description** : Pousse le schéma directement vers la DB sans créer de migration.

**Syntaxe** :
```bash
npx prisma db push [options]
```

**Options** :
```bash
# Accepter data loss
npx prisma db push --accept-data-loss

# Skip génération
npx prisma db push --skip-generate

# Forcer
npx prisma db push --force-reset
```

**Comportement** :
1. Compare schéma local vs DB
2. Applique les changements directement
3. **Ne crée PAS de migration**
4. Génère le client

**Cas d'usage** :
- Prototypage rapide
- Développement initial
- Projets simples sans besoin de migrations
- Tests rapides

**⚠️ Différence avec migrate dev** :
| Aspect | migrate dev | db push |
|--------|-------------|---------|
| Crée migration | ✅ Oui | ❌ Non |
| Historique | ✅ Oui | ❌ Non |
| Production | ✅ Oui | ❌ Non recommandé |
| Rapidité | Moyen | Rapide |

**Diagramme de choix** :
```mermaid
graph TD
    START{Besoin historique<br/>des migrations?}
    
    START -->|Oui| USE_MIG[Utiliser migrate dev]
    START -->|Non| USE_PUSH[Utiliser db push]
    
    USE_MIG --> MIG_WHEN[Quand?]
    MIG_WHEN --> M1[Production]
    MIG_WHEN --> M2[Équipe multiple]
    MIG_WHEN --> M3[Traçabilité requise]
    
    USE_PUSH --> PUSH_WHEN[Quand?]
    PUSH_WHEN --> P1[Prototype]
    PUSH_WHEN --> P2[Dev solo]
    PUSH_WHEN --> P3[Tests rapides]
    
    style START fill:#fff9c4,color:#000
    style USE_MIG fill:#66bb6a,color:#000
    style USE_PUSH fill:#ffd54f,color:#000
    style MIG_WHEN fill:#b3e5fc,color:#000
    style M1 fill:#81c784,color:#000
    style M2 fill:#81c784,color:#000
    style M3 fill:#81c784,color:#000
    style PUSH_WHEN fill:#fff176,color:#000
    style P1 fill:#ffcc80,color:#000
    style P2 fill:#ffcc80,color:#000
    style P3 fill:#ffcc80,color:#000
```

---

### 9. `npx prisma db execute`

**Description** : Exécute du SQL directement sur la DB.

**Syntaxe** :
```bash
npx prisma db execute --stdin < script.sql
npx prisma db execute --file script.sql
npx prisma db execute --url <database-url>
```

**Exemples** :

**Exécuter depuis stdin** :
```bash
npx prisma db execute --stdin <<EOF
SELECT * FROM "_prisma_migrations";
EOF
```

**Exécuter depuis fichier** :
```bash
npx prisma db execute --file ./scripts/cleanup.sql
```

**Avec URL custom** :
```bash
npx prisma db execute \
  --url "postgresql://user:pass@localhost:5432/db" \
  --stdin <<EOF
DELETE FROM users WHERE email LIKE '%test%';
EOF
```

**Cas d'usage** :
- Corrections manuelles en DB
- Scripts de nettoyage
- Migrations de données
- Debug avancé

**⚠️ ATTENTION** :
Contourne Prisma, utilisez avec précaution.

---

### 10. `npx prisma generate`

**Description** : Génère le client Prisma basé sur le schéma.

**Syntaxe** :
```bash
npx prisma generate [options]
```

**Options** :
```bash
# Spécifier schéma
npx prisma generate --schema=./custom/schema.prisma

# Watch mode (regénère auto)
npx prisma generate --watch

# Avec data proxy
npx prisma generate --data-proxy
```

**Comportement** :
1. Lit `schema.prisma`
2. Génère le code TypeScript dans `node_modules/@prisma/client`
3. Met à jour les types

**Cas d'usage** :
- Après chaque modification de schéma
- Après `npm install`
- Dans le build process
- Après checkout Git

**Quand l'exécuter** :
- ✅ Après `migrate dev` (automatique)
- ✅ Après `migrate deploy` (manuel)
- ✅ Après `db push` (automatique)
- ✅ Après `git pull` avec schéma modifié
- ✅ Après modification manuelle du schéma

---

### 11. `npx prisma studio`

**Description** : Interface graphique pour explorer et modifier les données.

**Syntaxe** :
```bash
npx prisma studio [options]
```

**Options** :
```bash
# Port custom
npx prisma studio --port 5556

# Browser custom
npx prisma studio --browser firefox

# Schéma custom
npx prisma studio --schema=./autre/schema.prisma
```

**Comportement** :
1. Démarre serveur local sur port 5555
2. Ouvre navigateur automatiquement
3. Affiche interface graphique de gestion

**Fonctionnalités** :
- Visualiser toutes les tables
- Créer/modifier/supprimer enregistrements
- Voir les relations
- Filtrer et rechercher
- Exporter données

**Cas d'usage** :
- Vérification après migration
- Nettoyage de doublons
- Ajout de données de test
- Debug
- Exploration de la DB

---

### 12. `npx prisma validate`

**Description** : Valide la syntaxe du schéma Prisma.

**Syntaxe** :
```bash
npx prisma validate [options]
```

**Options** :
```bash
# Schéma custom
npx prisma validate --schema=./custom/schema.prisma
```

**Comportement** :
- Vérifie la syntaxe
- Valide les types
- Vérifie les relations
- Valide les attributs

**Sortie** :

**✅ Succès** :
```
The schema is valid
```

**❌ Erreur** :
```
Error validating: 
  - Invalid field type on model User: "Stringg"
  - Relation "Course" is missing opposite relation field
```

**Cas d'usage** :
- Avant de commiter
- Dans CI/CD
- Après modifications
- Debug de syntaxe

---

## Commandes de diagnostic

### 13. `npx prisma db seed`

**Description** : Exécute le script de seed pour peupler la DB.

**Syntaxe** :
```bash
npx prisma db seed
```

**Configuration dans `package.json`** :
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Exemple de seed (`prisma/seed.ts`)** :
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { clerkId: 'user_test1', email: 'user1@test.com', username: 'user1' },
      { clerkId: 'user_test2', email: 'user2@test.com', username: 'user2' },
    ]
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Cas d'usage** :
- Peupler DB de développement
- Créer données de test
- Initialiser données par défaut
- Automatiser après reset

---

### 14. `npx prisma format`

**Description** : Formate le fichier `schema.prisma`.

**Syntaxe** :
```bash
npx prisma format
```

**Comportement** :
- Indente correctement
- Aligne les attributs
- Trie les champs (optionnel)
- Corrige l'espacement

**Avant** :
```prisma
model User{
id String @id @default(cuid())
email String @unique
  username String
}
```

**Après** :
```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  username String
}
```

**Cas d'usage** :
- Avant commit
- Standardiser le format
- Améliorer lisibilité
- Pre-commit hook

---

### 15. `npx prisma version`

**Description** : Affiche les versions de Prisma.

**Syntaxe** :
```bash
npx prisma version
```

**Sortie** :
```
Environment variables loaded from .env
prisma                  : 5.7.0
@prisma/client          : 5.7.0
Current platform        : windows
Query Engine (Node-API) : libquery-engine xxx
Migration Engine        : migration-engine-cli xxx
Format Binary          : prisma-fmt xxx

Default Engines Hash   : xxx
Studio                 : 0.496.0
```

**Cas d'usage** :
- Vérifier versions installées
- Debug de compatibilité
- Rapports de bug
- Documentation

---

## Commandes avancées

### 16. `npx prisma migrate dev --create-only`

**Description** : Crée la migration sans l'appliquer (dry run).

**Syntaxe** :
```bash
npx prisma migrate dev --create-only --name test_migration
```

**Comportement** :
1. Détecte changements
2. Crée le fichier SQL
3. **N'applique PAS** à la DB
4. Permet inspection manuelle

**Workflow** :
```bash
# 1. Créer sans appliquer
npx prisma migrate dev --create-only --name add_column

# 2. Inspecter le SQL généré
cat prisma/migrations/xxx_add_column/migration.sql

# 3. Modifier si nécessaire
nano prisma/migrations/xxx_add_column/migration.sql

# 4. Appliquer manuellement
npx prisma migrate deploy
```

**Cas d'usage** :
- Vérifier SQL avant application
- Modifier migration manuellement
- Migrations complexes
- Review avant prod

---

### 17. `npx prisma migrate resolve --rolled-back`

**Description** : Marque une migration échouée comme annulée.

**Syntaxe** :
```bash
npx prisma migrate resolve --rolled-back <migration-name>
```

**Quand l'utiliser** :
- Migration en état "failed"
- Vous avez déjà annulé manuellement les changements
- Besoin de nettoyer l'état

**Workflow complet** :
```bash
# 1. Voir l'état
npx prisma migrate status
# → Migration xxx en failed

# 2. Annuler manuellement en DB (si pas déjà fait)
npx prisma db execute --stdin <<EOF
-- Annuler les changements de la migration
DROP TABLE IF EXISTS new_table;
EOF

# 3. Marquer comme rolled back
npx prisma migrate resolve --rolled-back xxx

# 4. Recréer proprement
npx prisma migrate dev --name xxx_fixed
```

---

### 18. `npx prisma migrate deploy --force`

**Description** : Force le déploiement même en cas d'avertissements.

**Syntaxe** :
```bash
npx prisma migrate deploy --force
```

**⚠️ DANGER** :
- Ignore les warnings de data loss
- Peut causer perte de données
- À utiliser en connaissance de cause

**Cas d'usage** :
- Migration avec data loss assumé
- Environnement non-critique
- Après backup

---

## Options et flags

### Tableau récapitulatif des options

| Option | Commandes | Description |
|--------|-----------|-------------|
| `--name <name>` | migrate dev | Nom de la migration |
| `--create-only` | migrate dev | Créer sans appliquer |
| `--skip-generate` | migrate dev, reset | Ne pas générer client |
| `--skip-seed` | migrate dev, reset | Ne pas exécuter seed |
| `--force` | migrate deploy, reset | Forcer sans confirmation |
| `--schema <path>` | Toutes | Chemin custom du schéma |
| `--applied` | migrate resolve | Marquer comme appliquée |
| `--rolled-back` | migrate resolve | Marquer comme annulée |
| `--script` | migrate diff | Générer SQL |
| `--print` | db pull | Afficher sans écrire |
| `--accept-data-loss` | db push | Accepter perte de données |
| `--port <port>` | studio | Port custom |
| `--browser <name>` | studio | Navigateur custom |

### Options combinées (exemples)

```bash
# Créer migration + skip seed + skip generate
npx prisma migrate dev --name test --skip-seed --skip-generate

# Reset sans confirmation + skip seed
npx prisma migrate reset --force --skip-seed

# Deploy sur schéma custom
npx prisma migrate deploy --schema=./custom/schema.prisma

# db push avec acceptation data loss
npx prisma db push --accept-data-loss --force-reset
```

---

## Workflows complets

### Workflow 1 : Nouveau projet (première migration)

```mermaid
graph TD
    START[Nouveau projet] --> INSTALL[npm install]
    INSTALL --> ENV[Configurer .env]
    ENV --> SCHEMA[Créer schema.prisma]
    SCHEMA --> VALIDATE[npx prisma validate]
    VALIDATE --> MIGRATE[npx prisma migrate dev --name init]
    MIGRATE --> STUDIO[npx prisma studio]
    STUDIO --> TEST[Tester avec app]
    TEST --> COMMIT[Git commit]
    
    style START fill:#90caf9,color:#000
    style INSTALL fill:#b3e5fc,color:#000
    style ENV fill:#81d4fa,color:#000
    style SCHEMA fill:#a5d6a7,color:#000
    style VALIDATE fill:#fff9c4,color:#000
    style MIGRATE fill:#66bb6a,color:#000
    style STUDIO fill:#90caf9,color:#000
    style TEST fill:#81c784,color:#000
    style COMMIT fill:#4caf50,color:#fff
```

**Commandes** :
```bash
# 1. Installation
npm install

# 2. Configuration
cp env.sample .env
# Éditer .env

# 3. Validation
npx prisma validate

# 4. Première migration
npx prisma migrate dev --name init

# 5. Vérification
npx prisma studio

# 6. Commit
git add .
git commit -m "feat: initial migration"
```

---

### Workflow 2 : Ajouter une feature (nouvelle table/colonne)

```mermaid
graph TD
    START[Feature request] --> BRANCH[Git branch feature/xxx]
    BRANCH --> MODIFY[Modifier schema.prisma]
    MODIFY --> VALIDATE[npx prisma validate]
    VALIDATE --> CREATE[migrate dev --create-only]
    CREATE --> REVIEW[Inspecter SQL]
    REVIEW --> OK{SQL correct?}
    
    OK -->|Non| FIX[Modifier migration SQL]
    OK -->|Oui| APPLY[migrate deploy]
    
    FIX --> APPLY
    APPLY --> TEST[Tester app]
    TEST --> STUDIO[Vérifier dans Studio]
    STUDIO --> SUCCESS{Tests OK?}
    
    SUCCESS -->|Non| ROLLBACK[migrate reset<br/>Recommencer]
    SUCCESS -->|Oui| COMMIT[Git commit + push]
    
    ROLLBACK --> MODIFY
    COMMIT --> PR[Pull Request]
    
    style START fill:#90caf9,color:#000
    style BRANCH fill:#b3e5fc,color:#000
    style MODIFY fill:#a5d6a7,color:#000
    style VALIDATE fill:#fff9c4,color:#000
    style CREATE fill:#81c784,color:#000
    style REVIEW fill:#ffd54f,color:#000
    style OK fill:#fff9c4,color:#000
    style FIX fill:#ffcc80,color:#000
    style APPLY fill:#66bb6a,color:#000
    style TEST fill:#81d4fa,color:#000
    style STUDIO fill:#90caf9,color:#000
    style SUCCESS fill:#fff9c4,color:#000
    style ROLLBACK fill:#ef9a9a,color:#000
    style COMMIT fill:#66bb6a,color:#000
    style PR fill:#4caf50,color:#fff
```

**Commandes** :
```bash
# 1. Nouvelle branche
git checkout -b feature/add-username

# 2. Modifier schéma
# Ajouter le champ dans schema.prisma

# 3. Valider
npx prisma validate

# 4. Créer migration (sans appliquer)
npx prisma migrate dev --create-only --name add_username

# 5. Inspecter
cat prisma/migrations/xxx_add_username/migration.sql

# 6. Appliquer
npx prisma migrate deploy

# 7. Générer client
npx prisma generate

# 8. Tester
npm run dev
npx prisma studio

# 9. Commit si OK
git add .
git commit -m "feat: add username field"
git push origin feature/add-username
```

---

### Workflow 3 : Déploiement en production

```mermaid
graph TD
    START[Code ready] --> STAGING[Deploy to staging]
    STAGING --> TEST_STAGE[Test migrations staging]
    TEST_STAGE --> OK_STAGE{Tests OK?}
    
    OK_STAGE -->|Non| FIX[Fix issues]
    OK_STAGE -->|Oui| BACKUP[Backup production DB]
    
    FIX --> STAGING
    
    BACKUP --> PLAN[Plan maintenance window]
    PLAN --> NOTIFY[Notifier utilisateurs]
    NOTIFY --> DEPLOY[Deploy to production]
    
    DEPLOY --> MIG[npx prisma migrate deploy]
    MIG --> GEN[npx prisma generate]
    GEN --> START_APP[Restart application]
    START_APP --> MONITOR[Monitor 1-2h]
    
    MONITOR --> OK_PROD{Tout fonctionne?}
    OK_PROD -->|Oui| SUCCESS[Succès]
    OK_PROD -->|Non| ROLLBACK_PLAN[Execute rollback plan]
    
    style START fill:#90caf9,color:#000
    style STAGING fill:#b3e5fc,color:#000
    style TEST_STAGE fill:#81d4fa,color:#000
    style OK_STAGE fill:#fff9c4,color:#000
    style FIX fill:#ffab91,color:#000
    style BACKUP fill:#fff176,color:#000
    style PLAN fill:#ffd54f,color:#000
    style NOTIFY fill:#ffcc80,color:#000
    style DEPLOY fill:#a5d6a7,color:#000
    style MIG fill:#81c784,color:#000
    style GEN fill:#66bb6a,color:#000
    style START_APP fill:#4caf50,color:#fff
    style MONITOR fill:#81d4fa,color:#000
    style OK_PROD fill:#fff9c4,color:#000
    style SUCCESS fill:#2e7d32,color:#fff
    style ROLLBACK_PLAN fill:#ef9a9a,color:#000
```

**Commandes production** :
```bash
# 1. En staging
git pull origin main
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
npm start

# 2. Backup production
# Via Supabase Dashboard ou :
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 3. En production
git pull origin main
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart app

# 4. Monitoring
pm2 logs
# Vérifier logs d'erreur
```

---

### Workflow 4 : Rollback en production

```mermaid
graph TD
    BUG[Bug détecté] --> ASSESS[Évaluation urgence]
    ASSESS --> CRITICAL{Critique?}
    
    CRITICAL -->|Oui| IMMEDIATE[Action immédiate]
    CRITICAL -->|Non| PLANNED[Rollback planifié]
    
    IMMEDIATE --> BACKUP_CHECK{Backup récent?}
    BACKUP_CHECK -->|Oui| RESTORE_OPTION[Option: Restore backup]
    BACKUP_CHECK -->|Non| CODE_REVERT[Revert code Git]
    
    RESTORE_OPTION --> RESTORE_DB[Restore database]
    CODE_REVERT --> REVERT_SCHEMA[Modifier schema]
    
    PLANNED --> REVERT_SCHEMA
    
    REVERT_SCHEMA --> NEW_MIG[migrate dev revert]
    NEW_MIG --> TEST_REVERT[Test staging]
    TEST_REVERT --> DEPLOY_REVERT[migrate deploy prod]
    
    RESTORE_DB --> SYNC[Sync app state]
    DEPLOY_REVERT --> SYNC
    
    SYNC --> VERIFY[Vérifier fonctionnement]
    VERIFY --> POSTMORTEM[Post-mortem analysis]
    
    style BUG fill:#ef9a9a,color:#000
    style ASSESS fill:#ffd54f,color:#000
    style CRITICAL fill:#fff9c4,color:#000
    style IMMEDIATE fill:#ff6b6b,color:#fff
    style PLANNED fill:#ffd54f,color:#000
    style BACKUP_CHECK fill:#fff9c4,color:#000
    style RESTORE_OPTION fill:#ffcc80,color:#000
    style CODE_REVERT fill:#ffab91,color:#000
    style RESTORE_DB fill:#ffa726,color:#000
    style REVERT_SCHEMA fill:#ffab91,color:#000
    style NEW_MIG fill:#ffa726,color:#000
    style TEST_REVERT fill:#81d4fa,color:#000
    style DEPLOY_REVERT fill:#66bb6a,color:#000
    style SYNC fill:#81c784,color:#000
    style VERIFY fill:#90caf9,color:#000
    style POSTMORTEM fill:#b3e5fc,color:#000
```

**Commandes rollback** :
```bash
# Méthode 1 : Restore backup (le plus sûr)
# 1. Stop app
pm2 stop app

# 2. Restore DB
psql $DATABASE_URL < backup_20251023.sql

# 3. Revert code Git
git revert <commit-hash>

# 4. Restart
pm2 start app

# Méthode 2 : Migration inverse
# 1. Modifier schema.prisma (retirer champs)

# 2. Créer migration inverse
npx prisma migrate dev --name revert_add_username

# 3. Test staging
# ...staging tests...

# 4. Deploy prod
npx prisma migrate deploy
npx prisma generate
pm2 restart app
```

---

## Cas d'usage par situation

### Situation 1 : Je commence un nouveau projet

**Commandes** :
```bash
# Setup
npm install
cp env.sample .env

# Première migration
npx prisma migrate dev --name init
npx prisma generate

# Vérifier
npx prisma studio
```

**Ordre** : install → configure → migrate → generate → verify

---

### Situation 2 : Je joins le projet (Git clone)

**Commandes** :
```bash
# Clone
git clone <repo>
cd project

# Setup
npm install
cp .env.example .env
# Éditer .env

# Appliquer migrations existantes
npx prisma migrate deploy
npx prisma generate

# Vérifier
npx prisma migrate status
npx prisma studio
```

**Ordre** : clone → install → configure → deploy → generate → verify

---

### Situation 3 : J'ajoute une colonne

**Commandes** :
```bash
# Modifier schema
# Ajouter le champ

# Valider
npx prisma validate

# Migrer
npx prisma migrate dev --name add_new_column

# Vérifier
npx prisma studio
```

**Ordre** : modify → validate → migrate → verify

---

### Situation 4 : Je supprime une colonne

**Commandes** :
```bash
# 1. Vérifier utilisation dans le code
grep -r "columnName" .

# 2. Modifier schema
# Retirer le champ

# 3. Créer migration
npx prisma migrate dev --create-only --name remove_column

# 4. Vérifier SQL (data loss?)
cat prisma/migrations/xxx/migration.sql

# 5. Appliquer
npx prisma migrate deploy
npx prisma generate
```

**Ordre** : check-code → modify → create-only → review → deploy → generate

---

### Situation 5 : Migration échouée

**Diagnostic et fix** :
```bash
# 1. Voir l'état
npx prisma migrate status

# 2. Identifier le problème
# Lire le message d'erreur

# 3. Marquer comme rolled-back
npx prisma migrate resolve --rolled-back <migration-name>

# 4. Corriger schema.prisma

# 5. Recréer
npx prisma migrate dev --name <nom>_fixed

# 6. Vérifier
npx prisma migrate status
```

---

### Situation 6 : Je veux revenir en arrière

**Développement** :
```bash
# Reset complet
npx prisma migrate reset --skip-seed

# Ou revenir à un commit
git checkout <old-commit>
npx prisma migrate reset
```

**Production** :
```bash
# 1. Modifier schema (retirer changements)
# 2. Créer migration inverse
npx prisma migrate dev --name revert_to_previous_state

# 3. Test staging
# ...

# 4. Deploy
npx prisma migrate deploy
```

---

### Situation 7 : Synchroniser deux environnements

**Local → Staging** :
```bash
# Local
git add prisma/
git commit -m "Migration: add username"
git push origin main

# Staging
git pull origin main
npx prisma migrate deploy
npx prisma generate
```

**Production → Local (après hotfix)** :
```bash
# Production a une migration d'urgence

# Local
git pull origin main
npx prisma migrate deploy
npx prisma generate

# Vérifier sync
npx prisma migrate status
```

---

## Commandes par phase de projet

### Phase : Développement initial

```bash
# Cycle rapide
npx prisma db push              # Prototypage
npx prisma studio               # Vérification
# Répéter jusqu'à schéma stable

# Puis migration propre
npx prisma migrate dev --name init
```

### Phase : Feature development

```bash
# Workflow complet
git checkout -b feature/new-field
# Modifier schema
npx prisma validate
npx prisma migrate dev --name add_new_field
npx prisma studio
# Tests
git commit -m "feat: add new field"
```

### Phase : Pre-production

```bash
# Sur staging
npx prisma migrate deploy
npx prisma generate
npm run build
# Tests E2E
```

### Phase : Production

```bash
# Backup d'abord
pg_dump > backup.sql

# Migration
npx prisma migrate deploy
npx prisma generate

# Restart
pm2 restart app

# Monitor
pm2 logs
```

### Phase : Maintenance

```bash
# Audit régulier
npx prisma migrate status

# Vérification
npx prisma validate

# Nettoyage (si nécessaire)
npx prisma studio
```

---

## Comparaison des commandes principales

### migrate dev vs migrate deploy vs db push

```mermaid
graph LR
    subgraph DEV["migrate dev (Développement)"]
        D1[Détecte<br/>changements] --> D2[Crée<br/>migration SQL]
        D2 --> D3[Applique<br/>migration]
        D3 --> D4[Génère<br/>client]
        D4 --> D5[Exécute<br/>seed]
    end
    
    subgraph DEPLOY["migrate deploy (Production)"]
        P1[Lit migrations<br/>existantes] --> P2[Compare<br/>avec DB]
        P2 --> P3[Applique<br/>manquantes]
        P3 --> P4[Ne génère PAS<br/>client]
    end
    
    subgraph PUSH["db push (Prototypage)"]
        B1[Détecte<br/>changements] --> B2[Applique<br/>directement]
        B2 --> B3[Génère<br/>client]
        B3 --> B4[Pas de fichier<br/>migration]
    end
    
    style D1 fill:#a5d6a7,color:#000
    style D2 fill:#81c784,color:#000
    style D3 fill:#66bb6a,color:#000
    style D4 fill:#4caf50,color:#fff
    style D5 fill:#2e7d32,color:#fff
    style P1 fill:#b3e5fc,color:#000
    style P2 fill:#81d4fa,color:#000
    style P3 fill:#66bb6a,color:#000
    style P4 fill:#90caf9,color:#000
    style B1 fill:#fff9c4,color:#000
    style B2 fill:#ffd54f,color:#000
    style B3 fill:#ffcc80,color:#000
    style B4 fill:#ffa726,color:#000
```

### Tableau de comparaison

| Caractéristique | migrate dev | migrate deploy | db push |
|-----------------|-------------|----------------|---------|
| **Environnement** | Dev | Prod/Staging | Dev/Proto |
| **Crée migrations** | ✅ Oui | ❌ Non | ❌ Non |
| **Applique migrations** | ✅ Oui | ✅ Oui | ➖ N/A |
| **Génère client** | ✅ Auto | ❌ Manuel | ✅ Auto |
| **Exécute seed** | ✅ Oui | ❌ Non | ❌ Non |
| **Historique** | ✅ Oui | ✅ Oui | ❌ Non |
| **Rapidité** | Moyen | Rapide | Très rapide |
| **Sécurité** | Haute | Très haute | Basse |
| **Rollback** | Possible | Difficile | Impossible |

---

## Commandes de debug et inspection

### Inspecter les migrations

```bash
# Liste des fichiers de migration
ls -la prisma/migrations/

# Contenu d'une migration
cat prisma/migrations/20251023170100_add_username/migration.sql

# Toutes les migrations appliquées
npx prisma db execute --stdin <<EOF
SELECT migration_name, finished_at, applied_steps_count 
FROM "_prisma_migrations" 
ORDER BY finished_at;
EOF
```

### Comparer états

```bash
# DB actuelle vs schéma local
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# Migrations vs schéma
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# Deux schémas différents
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.old.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

### Vérifier la structure DB

```bash
# Voir toutes les tables
npx prisma db execute --stdin <<EOF
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
EOF

# Voir les colonnes d'une table
npx prisma db execute --stdin <<EOF
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users';
EOF

# Voir les contraintes
npx prisma db execute --stdin <<EOF
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users';
EOF
```

---

## Arbre de décision : Quelle commande utiliser ?

```mermaid
graph TD
    START[Quelle commande?] --> Q1{Quel besoin?}
    
    Q1 -->|Créer migration| Q2{Environnement?}
    Q1 -->|Appliquer migration| Q3{Dev ou Prod?}
    Q1 -->|Problème| Q4{Type de problème?}
    Q1 -->|Vérifier état| STATUS[migrate status]
    Q1 -->|Explorer données| STUDIO[studio]
    
    Q2 -->|Dev| MIGRATE_DEV[migrate dev]
    Q2 -->|Review| CREATE_ONLY[migrate dev --create-only]
    
    Q3 -->|Dev| MIGRATE_DEV2[migrate dev]
    Q3 -->|Prod| DEPLOY[migrate deploy]
    
    Q4 -->|Migration échouée| RESOLVE[migrate resolve]
    Q4 -->|Tout cassé| RESET[migrate reset]
    Q4 -->|Connexion| DB_PULL[db pull]
    Q4 -->|Syntaxe| VALIDATE[validate]
    
    style START fill:#90caf9,color:#000
    style Q1 fill:#fff9c4,color:#000
    style Q2 fill:#fff9c4,color:#000
    style Q3 fill:#fff9c4,color:#000
    style Q4 fill:#fff9c4,color:#000
    style MIGRATE_DEV fill:#66bb6a,color:#000
    style MIGRATE_DEV2 fill:#66bb6a,color:#000
    style CREATE_ONLY fill:#81c784,color:#000
    style DEPLOY fill:#4caf50,color:#fff
    style STATUS fill:#81d4fa,color:#000
    style STUDIO fill:#90caf9,color:#000
    style RESOLVE fill:#ffd54f,color:#000
    style RESET fill:#ef9a9a,color:#000
    style DB_PULL fill:#b3e5fc,color:#000
    style VALIDATE fill:#fff176,color:#000
```

---

## Commandes rarement utilisées mais utiles

### `npx prisma migrate baseline`

**Description** : Créé une migration baseline pour une DB existante.

**Syntaxe** :
```bash
npx prisma migrate baseline --name baseline
```

**Cas d'usage** :
- Migrer une DB existante vers Prisma
- Point de départ pour nouveau système de migrations

---

### `npx prisma db push --force-reset`

**Description** : Reset DB puis push le schéma.

**Syntaxe** :
```bash
npx prisma db push --force-reset
```

**⚠️ DESTRUCTIF** : Supprime toutes les données.

---

### `npx prisma migrate dev --skip-seed --skip-generate`

**Description** : Migration pure sans side effects.

**Cas d'usage** :
- Debug uniquement de la migration
- CI/CD optimisé

---

## Combinaisons de commandes utiles

### Setup complet nouveau projet

```bash
npm install && \
npx prisma migrate dev --name init && \
npx prisma generate && \
npx prisma studio
```

### Sync après git pull

```bash
git pull && \
npm install && \
npx prisma migrate deploy && \
npx prisma generate
```

### Reset et recommencer

```bash
npx prisma migrate reset --force --skip-seed && \
npx prisma migrate dev --name init && \
npx prisma studio
```

### Diagnostic complet

```bash
npx prisma validate && \
npx prisma migrate status && \
npx prisma db pull --print
```

---

## Variables d'environnement pour migrations

### Configuration requise

```env
# Obligatoire
DATABASE_URL="postgresql://..."

# Recommandé pour migrations
DIRECT_URL="postgresql://..."

# Optionnel pour certaines DB
SHADOW_DATABASE_URL="postgresql://..."
```

### Exemples par provider

**Supabase (Postgres)** :
```env
# Runtime (avec pooler)
DATABASE_URL="postgresql://postgres.xxx@aws-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

# Migrations (direct)
DIRECT_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require"
```

**PostgreSQL local** :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

**MySQL** :
```env
DATABASE_URL="mysql://user:password@localhost:3306/mydb"
```

**SQLite** :
```env
DATABASE_URL="file:./dev.db"
```

---

## Référence rapide : Toutes les commandes

### Commandes de migration

| Commande | Description | Environnement |
|----------|-------------|---------------|
| `prisma migrate dev` | Créer et appliquer migration | Dev |
| `prisma migrate deploy` | Appliquer migrations existantes | Prod |
| `prisma migrate reset` | Reset DB et rejouer migrations | Dev |
| `prisma migrate resolve` | Marquer migration (applied/rolled-back) | Tous |
| `prisma migrate status` | Voir état des migrations | Tous |
| `prisma migrate diff` | Comparer schémas | Tous |

### Commandes de base de données

| Commande | Description | Usage |
|----------|-------------|-------|
| `prisma db pull` | Introspection DB → schéma | Import/Sync |
| `prisma db push` | Push schéma sans migration | Prototype |
| `prisma db execute` | Exécuter SQL custom | Debug |
| `prisma db seed` | Exécuter seed script | Data init |

### Commandes de génération

| Commande | Description | Quand |
|----------|-------------|-------|
| `prisma generate` | Générer client Prisma | Après migrations |
| `prisma validate` | Valider syntaxe schéma | Avant commit |
| `prisma format` | Formater schema.prisma | Nettoyage |

### Commandes d'exploration

| Commande | Description | Usage |
|----------|-------------|-------|
| `prisma studio` | Interface graphique | Exploration |
| `prisma version` | Afficher versions | Debug |

---

## Flags globaux (toutes commandes)

| Flag | Description | Exemple |
|------|-------------|---------|
| `--schema <path>` | Chemin custom du schéma | `--schema=./db/schema.prisma` |
| `--help` | Aide de la commande | `prisma migrate dev --help` |
| `--version` | Version de Prisma | `prisma --version` |

---

## Scénario: Toutes les commandes en action

### Projet complet de A à Z

```mermaid
graph TD
    START[Nouveau projet] --> INSTALL[npm install]
    INSTALL --> CONFIG[Configurer .env]
    CONFIG --> SCHEMA[Créer schema.prisma]
    
    SCHEMA --> VALIDATE1[prisma validate]
    VALIDATE1 --> INIT[migrate dev --name init]
    INIT --> STUDIO1[prisma studio<br/>Vérifier]
    
    STUDIO1 --> FEATURE[Développer features]
    FEATURE --> MODIFY[Modifier schema]
    MODIFY --> VALIDATE2[prisma validate]
    VALIDATE2 --> CREATE[migrate dev --create-only]
    CREATE --> REVIEW[Review SQL]
    REVIEW --> DEPLOY_LOCAL[migrate deploy]
    DEPLOY_LOCAL --> GEN[prisma generate]
    GEN --> TEST[Tests]
    
    TEST --> OK{Tests OK?}
    OK -->|Non| DEBUG[prisma studio<br/>Debug]
    OK -->|Oui| COMMIT[Git commit]
    
    DEBUG --> RESET[migrate reset]
    RESET --> MODIFY
    
    COMMIT --> STAGING[Deploy staging]
    STAGING --> DEPLOY_STAGE[migrate deploy]
    DEPLOY_STAGE --> TEST_STAGE[Tests staging]
    
    TEST_STAGE --> OK_STAGE{OK?}
    OK_STAGE -->|Non| FIX[Fix]
    OK_STAGE -->|Oui| PROD[Deploy production]
    
    FIX --> FEATURE
    
    PROD --> BACKUP[Backup DB]
    BACKUP --> DEPLOY_PROD[migrate deploy]
    DEPLOY_PROD --> GEN_PROD[prisma generate]
    GEN_PROD --> STATUS[migrate status<br/>Vérifier]
    STATUS --> MONITOR[Monitor app]
    
    MONITOR --> ISSUE{Problème?}
    ISSUE -->|Oui| ROLLBACK[Migration inverse]
    ISSUE -->|Non| SUCCESS[Succès]
    
    ROLLBACK --> DEPLOY_PROD
    
    style START fill:#90caf9,color:#000
    style INSTALL fill:#b3e5fc,color:#000
    style CONFIG fill:#81d4fa,color:#000
    style SCHEMA fill:#a5d6a7,color:#000
    style VALIDATE1 fill:#fff9c4,color:#000
    style VALIDATE2 fill:#fff9c4,color:#000
    style INIT fill:#66bb6a,color:#000
    style STUDIO1 fill:#90caf9,color:#000
    style FEATURE fill:#c8e6c9,color:#000
    style MODIFY fill:#a5d6a7,color:#000
    style CREATE fill:#81c784,color:#000
    style REVIEW fill:#ffd54f,color:#000
    style DEPLOY_LOCAL fill:#66bb6a,color:#000
    style GEN fill:#81d4fa,color:#000
    style TEST fill:#b3e5fc,color:#000
    style OK fill:#fff9c4,color:#000
    style DEBUG fill:#90caf9,color:#000
    style RESET fill:#ef9a9a,color:#000
    style COMMIT fill:#66bb6a,color:#000
    style STAGING fill:#b3e5fc,color:#000
    style DEPLOY_STAGE fill:#81c784,color:#000
    style TEST_STAGE fill:#81d4fa,color:#000
    style OK_STAGE fill:#fff9c4,color:#000
    style FIX fill:#ffab91,color:#000
    style PROD fill:#90caf9,color:#000
    style BACKUP fill:#fff176,color:#000
    style DEPLOY_PROD fill:#4caf50,color:#fff
    style GEN_PROD fill:#66bb6a,color:#000
    style STATUS fill:#81d4fa,color:#000
    style MONITOR fill:#90caf9,color:#000
    style ISSUE fill:#fff9c4,color:#000
    style ROLLBACK fill:#ffa726,color:#000
    style SUCCESS fill:#2e7d32,color:#fff
```

---

## Exemples de commandes complexes

### 1. Migration avec review manuelle complète

```bash
# Étape 1: Créer sans appliquer
npx prisma migrate dev --create-only --name add_username

# Étape 2: Voir le SQL généré
cat prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql

# Étape 3: Optionnel - modifier le SQL
nano prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql

# Étape 4: Appliquer
npx prisma migrate deploy

# Étape 5: Générer client
npx prisma generate

# Étape 6: Vérifier
npx prisma migrate status
npx prisma studio
```

### 2. Migration avec data migration complexe

```bash
# Étape 1: Ajouter colonne nullable
# schema.prisma: username String?
npx prisma migrate dev --name add_username_nullable

# Étape 2: Peupler les données
npx prisma db execute --stdin <<EOF
UPDATE users SET username = CONCAT('user_', SUBSTRING(id, 1, 8));
EOF

# Étape 3: Rendre obligatoire
# schema.prisma: username String
npx prisma migrate dev --name make_username_required

# Étape 4: Vérifier
npx prisma studio
```

### 3. Sync complète entre environnements

```bash
# Sur machine de référence (dev)
git add prisma/
git commit -m "migrations: add username and role"
git push origin main

# Sur autre machine (staging)
git pull origin main
npm install
npx prisma migrate deploy
npx prisma generate
npm run build

# Vérifier synchronisation
npx prisma migrate status
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script
# Devrait retourner vide si sync parfaite
```

---

## Commandes CI/CD

### GitHub Actions (exemple)

```yaml
# .github/workflows/deploy.yml
- name: Apply migrations
  run: npx prisma migrate deploy
  
- name: Generate Prisma Client
  run: npx prisma generate
  
- name: Verify migrations
  run: npx prisma migrate status
```

### Commandes CI

```bash
# Validation
npx prisma validate || exit 1

# Apply migrations
npx prisma migrate deploy || exit 1

# Generate
npx prisma generate || exit 1

# Verify
npx prisma migrate status || exit 1
```

---

## Aide-mémoire : Commandes par fréquence d'utilisation

### Quotidien (développement)

```bash
npx prisma migrate dev --name <nom>
npx prisma studio
npx prisma generate
npx prisma migrate status
```

### Hebdomadaire

```bash
npx prisma validate
npx prisma migrate reset  # nettoyage
npx prisma format
```

### Mensuel

```bash
npx prisma version  # vérifier updates
npx prisma migrate diff  # audit
```

### Occasionnel (problèmes)

```bash
npx prisma migrate resolve
npx prisma db pull
npx prisma db execute
```

### Rare (urgences)

```bash
npx prisma migrate reset --force
npx prisma db push --force-reset
npx prisma migrate deploy --force
```

---

## Comparaison : Avant vs Après migration

### État des fichiers

**Avant `migrate dev --name add_username`** :
```
prisma/
  ├── schema.prisma
  └── migrations/
      └── 20251023164944_init/
          └── migration.sql
```

**Après** :
```
prisma/
  ├── schema.prisma
  └── migrations/
      ├── 20251023164944_init/
      │   └── migration.sql
      └── 20251023170100_add_username_to_user/
          └── migration.sql
```

### État de la DB

**Table `_prisma_migrations` avant** :
```
| id | checksum | finished_at | migration_name | logs | rolled_back_at |
|----|----------|-------------|----------------|------|----------------|
| 1  | xxx      | 2025...     | init           | NULL | NULL           |
```

**Après** :
```
| id | checksum | finished_at | migration_name        | logs | rolled_back_at |
|----|----------|-------------|-----------------------|------|----------------|
| 1  | xxx      | 2025...     | init                  | NULL | NULL           |
| 2  | yyy      | 2025...     | add_username_to_user  | NULL | NULL           |
```

---

## Résumé visuel : Écosystème Prisma Migrate

```mermaid
graph TB
    subgraph "Fichiers locaux"
        SCHEMA[schema.prisma]
        MIG_DIR[prisma/migrations/]
        ENV[.env]
    end
    
    subgraph "Commandes principales"
        DEV[migrate dev]
        DEPLOY[migrate deploy]
        RESET[migrate reset]
    end
    
    subgraph "Commandes support"
        STATUS[migrate status]
        RESOLVE[migrate resolve]
        DIFF[migrate diff]
        VALIDATE[validate]
        STUDIO[studio]
    end
    
    subgraph "Base de données"
        TABLES[Tables métier]
        PRISMA_MIG["_prisma_migrations"]
    end
    
    SCHEMA --> DEV
    SCHEMA --> VALIDATE
    ENV --> DEV
    ENV --> DEPLOY
    
    DEV --> MIG_DIR
    MIG_DIR --> DEPLOY
    
    DEV --> TABLES
    DEPLOY --> TABLES
    RESET --> TABLES
    
    DEV --> PRISMA_MIG
    DEPLOY --> PRISMA_MIG
    RESOLVE --> PRISMA_MIG
    
    STATUS --> PRISMA_MIG
    STUDIO --> TABLES
    
    DIFF --> SCHEMA
    DIFF --> MIG_DIR
    
    style SCHEMA fill:#a5d6a7,color:#000
    style MIG_DIR fill:#81c784,color:#000
    style ENV fill:#ffd54f,color:#000
    style DEV fill:#66bb6a,color:#000
    style DEPLOY fill:#4caf50,color:#fff
    style RESET fill:#ef9a9a,color:#000
    style STATUS fill:#81d4fa,color:#000
    style RESOLVE fill:#ffd54f,color:#000
    style DIFF fill:#90caf9,color:#000
    style VALIDATE fill:#fff176,color:#000
    style STUDIO fill:#b3e5fc,color:#000
    style TABLES fill:#ce93d8,color:#000
    style PRISMA_MIG fill:#f48fb1,color:#000
```

---

## Annexe : Messages de sortie et leur signification

### migrate status - Sorties possibles

**✅ Tout est à jour** :
```
Database schema is up to date!
```

**⚠️ Migrations en attente** :
```
Following migrations have not been applied:
  20251023172300_add_profile_complete_and_last_login
```

**❌ Migration échouée** :
```
Migration 20251023172300 failed to apply cleanly
State: FailedState
```

**🔄 Migrations dans DB pas en local** :
```
Following migrations are applied to the database but missing from the local migrations directory:
  20251023180000_unknown_migration
```

### migrate dev - Confirmation prompts

```
? We need to reset the database to apply this migration.
  Do you want to continue? All data will be lost. › (y/N)
```

```
? Migration will cause data loss. Do you want to continue? › (y/N)
```

---

## Cheat Sheet finale

### Développement quotidien

```bash
# Modifier schéma → Migrer
npx prisma migrate dev --name <nom>

# Vérifier
npx prisma studio

# Si problème
npx prisma migrate reset
```

### Avant commit

```bash
npx prisma validate
npx prisma format
npx prisma migrate status
git add prisma/
```

### Déploiement production

```bash
# Backup
pg_dump > backup.sql

# Migration
npx prisma migrate deploy
npx prisma generate

# Vérifier
npx prisma migrate status
```

### Debug urgent

```bash
npx prisma migrate status
npx prisma db pull --print
npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script
```

---

**Document créé le** : 2025-10-23

**Version** : 1.0

**Couverture** : 18 commandes Prisma complètes avec exemples et diagrammes

