# 🏗️ Architecture du Projet

Ce document explique comment fonctionne la synchronisation Clerk ↔ Prisma/Supabase.

---

## 📊 Vue d'ensemble

```
┌─────────────┐
│ Utilisateur │
└──────┬──────┘
       │
       │ 1. Visite http://localhost:3000
       ▼
┌─────────────────────────────────┐
│   Application Next.js (React)   │
│                                 │
│  ┌──────────────────────────┐  │
│  │  app/page.tsx            │  │
│  │  • Bouton "Se connecter" │  │
│  │  • Affichage des données │  │
│  └───────────┬──────────────┘  │
│              │                  │
│              │ 2. Appelle       │
│              ▼                  │
│  ┌──────────────────────────┐  │
│  │  lib/sync-user.ts        │  │
│  │  • syncUser()            │  │
│  │  • Logique upsert        │  │
│  └──┬───────────────────┬───┘  │
│     │                   │      │
└─────┼───────────────────┼──────┘
      │                   │
      │ 3. Récupère       │ 4. Sauvegarde
      │ l'utilisateur     │ dans la DB
      ▼                   ▼
┌──────────┐         ┌─────────────┐
│  Clerk   │         │  Supabase   │
│  Auth    │         │  PostgreSQL │
└──────────┘         └─────────────┘
```

---

## 🔄 Flux de synchronisation détaillé

### Étape 1 : Utilisateur arrive sur la page

```
Utilisateur → http://localhost:3000
```

### Étape 2 : Page Next.js se charge

**Fichier : `app/page.tsx`**

```typescript
export default async function Home() {
  // Cette fonction s'exécute côté serveur
  const syncedUser = await syncUser()  // ← Appel de la synchronisation
  
  return (
    <div>
      {syncedUser ? (
        // Afficher les données
      ) : (
        // Afficher le bouton de connexion
      )}
    </div>
  )
}
```

### Étape 3 : Fonction syncUser() s'exécute

**Fichier : `lib/sync-user.ts`**

```typescript
export async function syncUser() {
  // 1️⃣ Récupérer l'utilisateur depuis Clerk
  const clerkUser = await currentUser()  // API Clerk
  
  if (!clerkUser) return null  // Pas connecté
  
  // 2️⃣ Upsert dans Supabase via Prisma
  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { /* mettre à jour */ },
    create: { /* créer */ }
  })
  
  return user
}
```

### Étape 4 : Prisma interroge Supabase

```sql
-- Prisma génère automatiquement cette requête SQL :

-- D'abord, chercher si l'utilisateur existe
SELECT * FROM users WHERE clerkId = 'user_2abc...'

-- Si existe :
UPDATE users SET
  email = 'nouveau@email.com',
  firstName = 'Jean',
  updatedAt = NOW()
WHERE clerkId = 'user_2abc...'

-- Si n'existe pas :
INSERT INTO users (id, clerkId, email, firstName, ...)
VALUES ('ckv123', 'user_2abc...', 'jean@email.com', 'Jean', ...)
```

### Étape 5 : Résultat retourné et affiché

```typescript
// Dans app/page.tsx
{syncedUser && (
  <div>
    <p>Email: {syncedUser.email}</p>
    <p>Nom: {syncedUser.firstName}</p>
    {/* etc. */}
  </div>
)}
```

---

## 🗂️ Architecture des fichiers

### Structure du code

```
app/
├── layout.tsx                    # 🎨 Layout global
│   └── <ClerkProvider>           # Wrapping Clerk
│       └── {children}
│
└── page.tsx                      # 🏠 Page d'accueil
    ├── const user = await syncUser()  ← Appel
    │
    ├── <SignedOut>               # Si pas connecté
    │   └── <SignInButton />      # Bouton de connexion
    │
    └── <SignedIn>                # Si connecté
        └── Affichage des données

lib/
├── prisma.ts                     # 🔌 Client Prisma
│   └── export const prisma = new PrismaClient()
│
└── sync-user.ts                  # ⚡ Fonction magique
    └── export async function syncUser() { ... }

prisma/
└── schema.prisma                 # 📋 Définition du schéma
    └── model User { ... }

middleware.ts                     # 🛡️ Protection des routes
└── clerkMiddleware()
```

---

## 🔐 Flux d'authentification

### Connexion d'un utilisateur

```
┌──────────────────────────────────────────────────────┐
│ 1. Utilisateur clique sur "Se connecter"            │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ 2. Popup Clerk s'ouvre                               │
│    • Email + Password                                │
│    • Code de vérification                            │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ 3. Clerk valide et crée une session                  │
│    • JWT Token stocké dans les cookies               │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ 4. Page se recharge                                  │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ 5. syncUser() détecte l'utilisateur connecté         │
│    • Lit le token Clerk                              │
│    • Récupère les infos utilisateur                  │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ 6. Upsert dans Supabase                              │
│    • Crée l'utilisateur si nouveau                   │
│    • Met à jour si existe déjà                       │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ 7. Affichage des données synchronisées               │
│    ✅ "Utilisateur synchronisé avec succès !"        │
└──────────────────────────────────────────────────────┘
```

---

## 🗄️ Schéma de la base de données

### Table : users

```
┌─────────────┬──────────┬─────────────────────────────┐
│   Colonne   │   Type   │       Description           │
├─────────────┼──────────┼─────────────────────────────┤
│ id          │ String   │ ID unique (généré)          │
│             │ PK       │ Ex: "ckv123xyz"             │
├─────────────┼──────────┼─────────────────────────────┤
│ clerkId     │ String   │ ID de l'utilisateur Clerk   │
│             │ UNIQUE   │ Ex: "user_2abc..."          │
├─────────────┼──────────┼─────────────────────────────┤
│ email       │ String   │ Email de l'utilisateur      │
│             │ UNIQUE   │ Ex: "jean@example.com"      │
├─────────────┼──────────┼─────────────────────────────┤
│ firstName   │ String?  │ Prénom (optionnel)          │
│             │          │ Ex: "Jean"                  │
├─────────────┼──────────┼─────────────────────────────┤
│ lastName    │ String?  │ Nom (optionnel)             │
│             │          │ Ex: "Dupont"                │
├─────────────┼──────────┼─────────────────────────────┤
│ imageUrl    │ String?  │ URL de l'avatar             │
│             │          │ Ex: "https://..."           │
├─────────────┼──────────┼─────────────────────────────┤
│ createdAt   │ DateTime │ Date de création            │
│             │ AUTO     │ Ex: "2025-10-23T10:00:00Z"  │
├─────────────┼──────────┼─────────────────────────────┤
│ updatedAt   │ DateTime │ Date de mise à jour         │
│             │ AUTO     │ Ex: "2025-10-23T10:30:00Z"  │
└─────────────┴──────────┴─────────────────────────────┘

Index :
  • PRIMARY KEY : id
  • UNIQUE INDEX : clerkId
  • UNIQUE INDEX : email
```

### Exemple de données

```
id          : ckv123xyz
clerkId     : user_2abcdefghijklmnop
email       : jean.dupont@gmail.com
firstName   : Jean
lastName    : Dupont
imageUrl    : https://img.clerk.com/eyJ0e...
createdAt   : 2025-10-23T10:15:30.000Z
updatedAt   : 2025-10-23T10:15:30.000Z
```

---

## 🔑 Variables d'environnement

### Fichier : .env.local

```env
# Clerk - Service d'authentification
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx...
  ↑ Clé publique, utilisée côté client (navigateur)

CLERK_SECRET_KEY=sk_test_xxxxx...
  ↑ Clé secrète, utilisée côté serveur uniquement

# Supabase - Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/db"
  ↑ URL de connexion à la base de données
```

### Comment elles sont utilisées

**NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
- Utilisée par : `app/layout.tsx` → `<ClerkProvider>`
- Permet : Affichage des composants Clerk (boutons, popups)
- Visible : Côté client (dans le navigateur)

**CLERK_SECRET_KEY**
- Utilisée par : `lib/sync-user.ts` → `currentUser()`
- Permet : Récupération sécurisée des données utilisateur
- Visible : Côté serveur uniquement (jamais dans le navigateur)

**DATABASE_URL**
- Utilisée par : `lib/prisma.ts` → `new PrismaClient()`
- Permet : Connexion à la base de données Supabase
- Visible : Côté serveur uniquement

---

## ⚙️ Configuration Prisma

### Fichier : prisma/schema.prisma

```prisma
// 1️⃣ Configuration du générateur
generator client {
  provider = "prisma-client-js"
  // Génère le client TypeScript dans node_modules/@prisma/client
}

// 2️⃣ Configuration de la source de données
datasource db {
  provider = "postgresql"
  // Utilise PostgreSQL (Supabase)
  
  url = env("DATABASE_URL")
  // Lit l'URL depuis .env.local
}

// 3️⃣ Définition du modèle User
model User {
  id        String   @id @default(cuid())
  // @id       : Clé primaire
  // @default  : Valeur par défaut
  // cuid()    : Génère un ID unique court
  
  clerkId   String   @unique
  // @unique   : Valeur unique dans toute la table
  
  email     String   @unique
  
  firstName String?
  // ?         : Optionnel (peut être NULL)
  
  createdAt DateTime @default(now())
  // now()     : Timestamp actuel à la création
  
  updatedAt DateTime @updatedAt
  // @updatedAt: Mis à jour automatiquement
  
  @@map("users")
  // Nom de la table dans la DB : "users"
}
```

---

## 🔧 Middleware Clerk

### Fichier : middleware.ts

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Définir les routes publiques (accessibles sans connexion)
const isPublicRoute = createRouteMatcher(['/'])

export default clerkMiddleware((auth, request) => {
  // Pour protéger certaines routes :
  // if (!isPublicRoute(request)) {
  //   auth().protect()  // Redirige vers la connexion si pas authentifié
  // }
})

// Configuration : quelles routes appliquer le middleware
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

**Ce qu'il fait :**
1. S'exécute avant chaque requête
2. Vérifie si l'utilisateur est connecté (via le token JWT)
3. Peut protéger certaines routes
4. Redirige vers la connexion si nécessaire

---

## 📦 Dépendances principales

### package.json

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.0.0",
    // Authentification Clerk pour Next.js
    // Fournit : SignIn, SignUp, UserButton, currentUser(), etc.
    
    "@prisma/client": "^5.7.0",
    // Client Prisma généré
    // Fournit : prisma.user.create(), prisma.user.findMany(), etc.
    
    "next": "14.1.0",
    // Framework Next.js
    // App Router, Server Components, etc.
    
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
    // React et ReactDOM
  },
  
  "devDependencies": {
    "prisma": "^5.7.0",
    // CLI Prisma
    // Commandes : prisma db push, prisma generate, etc.
    
    "typescript": "^5"
    // TypeScript pour le type-safety
  }
}
```

---

## 🎯 Cas d'usage et scénarios

### Scénario 1 : Première connexion

```
1. Utilisateur s'inscrit sur Clerk
   ↓
2. Clerk crée le compte
   ↓
3. Utilisateur visite l'app
   ↓
4. syncUser() détecte un nouvel utilisateur
   ↓
5. prisma.user.upsert() → CREATE
   ↓
6. Utilisateur créé dans Supabase
   ✅ Badge vert : "Utilisateur synchronisé !"
```

### Scénario 2 : Connexion existante

```
1. Utilisateur se connecte (compte existant)
   ↓
2. Utilisateur visite l'app
   ↓
3. syncUser() détecte l'utilisateur
   ↓
4. prisma.user.upsert() → UPDATE
   ↓
5. Données mises à jour dans Supabase
   ✅ Badge vert : "Utilisateur synchronisé !"
```

### Scénario 3 : Changement de profil

```
1. Utilisateur change son nom dans Clerk
   ↓
2. Utilisateur re-visite l'app
   ↓
3. syncUser() détecte le changement
   ↓
4. prisma.user.upsert() → UPDATE
   ↓
5. Nouveau nom sauvegardé dans Supabase
   ✅ Données à jour !
```

---

## 🚀 Optimisations possibles

### 1. Cache des données
```typescript
// Éviter de synchroniser à chaque page
// Utiliser React Query ou SWR
```

### 2. Webhooks pour sync temps réel
```typescript
// Voir : examples/webhook-method/
// Sync automatique sans attendre la visite
```

### 3. Champs supplémentaires
```prisma
model User {
  // ... champs existants
  role      String   @default("user")
  plan      String   @default("free")
  posts     Post[]   // Relation avec d'autres tables
}
```

---

## 📊 Comparaison : Upsert vs Webhooks

### Architecture avec Upsert (actuelle)

```
┌──────────┐
│   User   │
└────┬─────┘
     │ Visite l'app
     ▼
┌─────────────┐      ┌──────────┐
│  Next.js    │─────→│  Clerk   │ Lit les infos
│  syncUser() │      └──────────┘
└──────┬──────┘
       │ Upsert
       ▼
┌─────────────┐
│  Supabase   │
└─────────────┘

✅ Simple
❌ Sync seulement quand l'utilisateur visite
```

### Architecture avec Webhooks

```
┌──────────┐
│   User   │
└────┬─────┘
     │ Crée compte
     ▼
┌─────────────┐
│   Clerk     │
└──────┬──────┘
       │ Webhook POST
       ▼
┌─────────────┐
│  Next.js    │
│  /api/webhook
└──────┬──────┘
       │ Create/Update
       ▼
┌─────────────┐
│  Supabase   │
└─────────────┘

✅ Sync temps réel
✅ Utilisateur n'a pas besoin de visiter l'app
❌ Plus complexe à configurer
```

---

## 🎓 Points clés à retenir

1. **Clerk** gère l'authentification (qui est l'utilisateur ?)
2. **Prisma** facilite les requêtes à la base de données
3. **Supabase** stocke les données de manière persistante
4. **syncUser()** fait le pont entre Clerk et Supabase
5. **Upsert** crée OU met à jour (idempotent)
6. Tout se passe **côté serveur** (Server Components)
7. Les clés API sont **secrètes** (jamais dans le code client)

---

## 📚 Pour aller plus loin

Consultez les autres guides :
- [Guide complet débutant](./05-GUIDE_COMPLET_DEBUTANT.md)
- [Comparaison Upsert vs Webhooks](./02-COMPARISON.md)
- [Schémas Prisma alternatifs](../SCHEMA_COMPARISON.md)

**Bonne compréhension ! 🧠✨**

