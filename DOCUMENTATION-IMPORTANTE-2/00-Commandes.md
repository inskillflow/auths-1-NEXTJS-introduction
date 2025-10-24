# Migrations (principales)

```env
npx prisma migrate dev
npx prisma migrate dev --name <nom>
npx prisma migrate dev --create-only --name <nom>
npx prisma migrate deploy
npx prisma migrate deploy --force
npx prisma migrate reset
npx prisma migrate reset --force
npx prisma migrate reset --skip-seed
npx prisma migrate reset --skip-generate
```

# Migrations (résolution / état / diff)

```env
npx prisma migrate resolve --applied <migration-name>
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate status
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.old.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

# Base de données

```env
npx prisma db pull
npx prisma db pull --force
npx prisma db pull --print
npx prisma db pull --schema=./autre/schema.prisma

npx prisma db push
npx prisma db push --accept-data-loss
npx prisma db push --skip-generate
npx prisma db push --force-reset

npx prisma db execute --stdin < script.sql
npx prisma db execute --file ./scripts/cleanup.sql
npx prisma db execute --url "<database-url>" --stdin

npx prisma db seed
```

# Génération / outils

```env
npx prisma generate
npx prisma generate --schema=./custom/schema.prisma
npx prisma generate --watch
npx prisma generate --data-proxy

npx prisma studio
npx prisma studio --port 5556
npx prisma studio --browser firefox
npx prisma studio --schema=./autre/schema.prisma

npx prisma validate
npx prisma validate --schema=./custom/schema.prisma

npx prisma format
npx prisma version
```

# Avancées / rarement utilisées

```env
npx prisma migrate baseline --name baseline
npx prisma migrate dev --skip-seed --skip-generate
```
