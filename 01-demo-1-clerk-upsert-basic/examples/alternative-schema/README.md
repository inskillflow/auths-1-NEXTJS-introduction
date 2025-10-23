# 🔄 Schéma Alternatif : ID = ClerkId

Cette version utilise l'ID de Clerk directement comme clé primaire.

## Différences avec la version principale

### Schéma Prisma

**Principal (actuel) :**
```prisma
model User {
  id        String   @id @default(cuid())  // ID généré
  clerkId   String   @unique                // ID Clerk séparé
  ...
}
```

**Alternatif (ce dossier) :**
```prisma
model User {
  id        String  @id                     // ID = ClerkId, pas de @default
  ...
}
```

### Code de synchronisation

**Principal (actuel) :**
```typescript
await prisma.user.upsert({
  where: { clerkId: clerkUser.id },
  create: { clerkId: clerkUser.id, ... }
})
```

**Alternatif (ce dossier) :**
```typescript
await prisma.user.upsert({
  where: { id: clerkUser.id },
  create: { id: clerkUser.id, ... }
})
```

## Comment migrer vers ce schéma

### 1. Remplacer le schéma

```bash
# Sauvegarder l'ancien
cp prisma/schema.prisma prisma/schema.prisma.backup

# Copier le nouveau
cp examples/alternative-schema/schema.prisma prisma/schema.prisma
```

### 2. Remplacer la fonction de sync

```bash
cp examples/alternative-schema/sync-user.ts lib/sync-user.ts
```

### 3. Appliquer les changements

```bash
# Supprimer l'ancienne base (ATTENTION : perte de données!)
npx prisma db push --force-reset

# Ou créer une migration
npx prisma migrate dev --name use-clerk-id-as-primary
```

## Quand utiliser ce schéma ?

✅ **Utilisez-le si :**
- Vous débutez et voulez la solution la plus simple
- Vous êtes certain de rester avec Clerk à long terme
- Vous n'avez pas de relations complexes entre tables

❌ **Ne l'utilisez PAS si :**
- Vous avez beaucoup de foreign keys (IDs longs partout)
- Vous pourriez changer de provider d'auth
- Vous voulez une architecture découplée

## Résultat

Les IDs dans votre base de données ressembleront à :
```
user_2abcdefghijklmnopqrstuvw
user_2xyzabcdefghijklmnopqrst
```

Au lieu de :
```
ckv123xyz
ckv456abc
```

## Retour en arrière

Pour revenir au schéma principal :

```bash
# Restaurer le schéma
cp prisma/schema.prisma.backup prisma/schema.prisma

# Ou récupérer depuis le projet
git checkout prisma/schema.prisma lib/sync-user.ts

# Réappliquer
npx prisma db push --force-reset
```

