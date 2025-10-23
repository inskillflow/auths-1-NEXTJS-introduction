# Mémo Rapide - Demo-2

Guide ultra-condensé pour une installation rapide.

---

## Installation (5 minutes)

```bash
# 1. Naviguer vers demo-2
cd demo-2

# 2. Installer
npm install

# 3. Copier .env.local du projet principal
# Windows PowerShell
Copy-Item ..\.env.local .env.local

# Mac/Linux
cp ../.env.local .env.local

# 4. Créer les tables
npx prisma db push
npx prisma generate

# 5. Lancer
npm run dev
```

Ouvrir : **http://localhost:3001**

---

## Commandes essentielles

```bash
# Démarrer l'app
npm run dev

# Interface graphique DB
npx prisma studio

# Synchroniser le schéma
npx prisma db push

# Générer le client Prisma
npx prisma generate

# Réinitialiser la DB (PERTE DE DONNÉES)
npx prisma db push --force-reset
```

---

## Structure rapide

```
demo-2/
├── prisma/schema.prisma    # User + Course (relations)
├── lib/sync-user.ts         # Sync avec ID = ClerkId
├── app/page.tsx             # Page principale
└── .env.local               # Variables d'environnement
```

---

## Différences clé

| Projet Principal | Demo-2 |
|-----------------|---------|
| Port 3000 | Port **3001** |
| id généré + clerkId | id = ClerkId |
| 1 table (User) | 2 tables (User + Course) |
| 7 attributs User | 11 attributs User |

---

## Créer un cours (Prisma Studio)

```bash
npx prisma studio
```

1. Table "courses" → "Add record"
2. Remplir :
   - `title`: "Mon cours"
   - `category`: "programming"
   - `level`: "beginner"
   - `price`: 0
   - `published`: true
   - `instructorId`: *copier depuis table users*
3. Save
4. Recharger http://localhost:3001

---

## Schéma User (simplifié)

```prisma
model User {
  id          String   @id          // = clerkUser.id
  email       String   @unique
  role        String   @default("user")
  bio         String?
  phoneNumber String?
  website     String?
  courses     Course[]               // Relation
}
```

---

## Schéma Course

```prisma
model Course {
  id           String   @id @default(cuid())
  title        String
  category     String
  level        String
  price        Decimal
  published    Boolean
  instructorId String
  instructor   User     @relation(...)
}
```

---

## Dépannage express

**Table n'existe pas** :
```bash
npx prisma db push
```

**Port 3001 occupé** :
Changer dans `package.json` : `"dev": "next dev -p 3002"`

**Pas de cours d'exemple** :
Se déconnecter et se reconnecter

**Invalid Key** :
Vérifier `.env.local`, redémarrer le serveur

---

## Variables .env.local

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"
```

---

## Accès rapides

- **App** : http://localhost:3001
- **Prisma Studio** : http://localhost:5555
- **Supabase** : https://supabase.com/dashboard
- **Clerk** : https://dashboard.clerk.com

---

## Guide complet

Pour tout comprendre en détail :
- **[00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md)** (guide étape par étape)
- **[README.md](README.md)** (présentation du projet)
- **[GUIDE_INSTALLATION.md](GUIDE_INSTALLATION.md)** (installation détaillée)

---

**Bon développement rapide !**

