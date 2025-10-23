# Guide des 3 Projets : Clerk vs NextAuth

Ce repository contient 3 projets complets pour apprendre l'authentification avec Next.js.

---

## Vue d'ensemble

```
02-next-match-clerck-3/
│
├── Projet Principal (racine)     ← Clerk + ID séparé
│   └── Port 3000
│
├── demo-2/                        ← Clerk + Relations
│   └── Port 3001
│
└── demo-3/                        ← NextAuth + Supabase
    └── Port 3002
```

---

## Projet Principal : Clerk (Production)

### 🎯 Objectif
Approche production-ready avec Clerk et architecture découplée.

### ✨ Caractéristiques
- **Auth** : Clerk (Service SaaS)
- **ID** : Généré (cuid) + clerkId séparé
- **Tables** : User uniquement
- **Setup** : 10 minutes
- **Coût** : Gratuit jusqu'à 10k users

### 📊 Schéma Prisma
```prisma
model User {
  id        String @id @default(cuid())  // ckv123xyz
  clerkId   String @unique               // user_2abc...
  email     String @unique
  // ...
}
```

### 🚀 Installation
```bash
npm install
cp env.sample .env.local
npx prisma db push
npm run dev  # Port 3000
```

### 📚 Documentation
- [documentation/05-GUIDE_COMPLET_DEBUTANT.md](documentation/05-GUIDE_COMPLET_DEBUTANT.md)
- [documentation/03-QUICK_START.md](documentation/03-QUICK_START.md)

### ✅ Recommandé pour
- MVP / Prototypes rapides
- Projets avec budget
- Débutants
- Besoin d'UI prête

---

## Demo-2 : Clerk avec Relations

### 🎯 Objectif
Apprendre les relations Prisma avec approche ID = ClerkId.

### ✨ Caractéristiques
- **Auth** : Clerk
- **ID** : ID = ClerkId directement
- **Tables** : User + Course (relation 1-N)
- **Setup** : 10 minutes
- **Attributs** : Enrichis (role, bio, phone, website)

### 📊 Schéma Prisma
```prisma
model User {
  id      String @id  // user_2abc... (ID Clerk)
  email   String @unique
  role    String @default("user")
  courses Course[]  // Relation
}

model Course {
  id           String @id @default(cuid())
  instructorId String
  instructor   User @relation(...)
}
```

### 🚀 Installation
```bash
cd demo-2
npm install
cp ../.env.local .env.local
npx prisma db push
npm run dev  # Port 3001
```

### 📚 Documentation
- [demo-2/README.md](demo-2/README.md)

### ✅ Recommandé pour
- Apprendre les relations Prisma
- Comprendre l'approche ID = ClerkId
- Comparer avec le projet principal

---

## Demo-3 : NextAuth (100% Gratuit) 🆕

### 🎯 Objectif
Alternative open-source et gratuite à Clerk avec NextAuth.js.

### ✨ Caractéristiques
- **Auth** : NextAuth.js (Open-source)
- **ID** : Généré (cuid)
- **Tables** : 4 tables NextAuth + User personnalisé
- **Setup** : 20 minutes
- **Coût** : **100% gratuit** à vie
- **Providers** : Google, GitHub, Email/Password

### 📊 Schéma Prisma
```prisma
// Tables NextAuth obligatoires
model Account { ... }
model Session { ... }
model VerificationToken { ... }

model User {
  id       String @id @default(cuid())
  email    String @unique
  role     String @default("user")
  accounts Account[]
  sessions Session[]
}
```

### 🚀 Installation
```bash
cd demo-3
npm install
cp .env.sample .env.local
openssl rand -base64 32  # Pour NEXTAUTH_SECRET
npx prisma db push
npm run dev  # Port 3002
```

### 📚 Documentation
- [demo-3/README.md](demo-3/README.md)
- [demo-3/00-INSTALLATION.md](demo-3/00-INSTALLATION.md)
- [demo-3/MEILLEURES_PRATIQUES.md](demo-3/MEILLEURES_PRATIQUES.md)
- [documentation/07-NEXTAUTH_ALTERNATIVE.md](documentation/07-NEXTAUTH_ALTERNATIVE.md)

### ✅ Recommandé pour
- Projets à long terme
- Contrôle total souhaité
- Budget limité (100% gratuit)
- Projets open-source
- Apprendre NextAuth

---

## Comparaison détaillée

### Authentification

| Aspect | Projet Principal | Demo-2 | **Demo-3** |
|--------|------------------|---------|------------|
| **Provider** | Clerk SaaS | Clerk SaaS | **NextAuth Open-source** |
| **Setup temps** | 10 min | 10 min | **20 min** |
| **UI Auth** | Fournie | Fournie | **À créer** |
| **Providers** | Email, Google, GitHub | Email, Google, GitHub | **40+ providers** |
| **Coût** | Gratuit → $25/mois | Gratuit → $25/mois | **$0 toujours** |
| **Vendor lock-in** | Oui | Oui | **Non** |

### Architecture

| Aspect | Projet Principal | Demo-2 | **Demo-3** |
|--------|------------------|---------|------------|
| **ID User** | cuid + clerkId | ClerkId direct | **cuid** |
| **Tables** | 1 (User) | 2 (User + Course) | **5 (NextAuth)** |
| **Relations** | Aucune | User ↔ Courses | **NextAuth** |
| **Attributs User** | 7 champs | 11 champs | **9 champs** |

### Développement

| Aspect | Projet Principal | Demo-2 | **Demo-3** |
|--------|------------------|---------|------------|
| **Port** | 3000 | 3001 | **3002** |
| **Complexité** | Simple | Simple | **Moyenne** |
| **Maintenance** | Clerk | Clerk | **Vous** |
| **Contrôle** | Limité | Limité | **Total** |
| **Personnalisation** | Limitée | Limitée | **Illimitée** |

---

## Quel projet choisir ?

### Pour apprendre

**Débutant** : Projet Principal
- Plus simple
- UI fournie
- Setup rapide

**Intermédiaire** : Demo-2
- Relations Prisma
- Schéma alternatif

**Avancé** : Demo-3
- NextAuth configuration
- Contrôle total

### Pour la production

**Budget disponible** : Projet Principal
- Service géré
- Moins de maintenance
- UI professionnelle

**Budget limité** : Demo-3
- 100% gratuit
- Contrôle total
- Personnalisation

### Pour un projet spécifique

**MVP rapide** → Projet Principal
**Apprentissage relations** → Demo-2
**Projet long terme** → Demo-3
**Open-source** → Demo-3
**SaaS avec budget** → Projet Principal

---

## Installation des 3 projets

### Option 1 : Tout installer

```bash
# Projet Principal
npm install
cp env.sample .env.local
npx prisma db push

# Demo-2
cd demo-2
npm install
cp ../.env.local .env.local
npx prisma db push
cd ..

# Demo-3
cd demo-3
npm install
cp .env.sample .env.local
openssl rand -base64 32  # Ajouter dans .env.local
npx prisma db push
cd ..

# Lancer (terminaux séparés)
npm run dev          # Port 3000
cd demo-2 && npm run dev  # Port 3001
cd demo-3 && npm run dev  # Port 3002
```

### Option 2 : Un seul projet

Choisissez celui qui vous intéresse et suivez son guide d'installation.

---

## Documentation complète

### Par projet

**Projet Principal :**
- [documentation/00-INDEX.md](documentation/00-INDEX.md)
- [documentation/05-GUIDE_COMPLET_DEBUTANT.md](documentation/05-GUIDE_COMPLET_DEBUTANT.md)

**Demo-2 :**
- [demo-2/README.md](demo-2/README.md)

**Demo-3 :**
- [demo-3/README.md](demo-3/README.md)
- [demo-3/MEILLEURES_PRATIQUES.md](demo-3/MEILLEURES_PRATIQUES.md)

### Guides comparatifs

- [documentation/07-NEXTAUTH_ALTERNATIVE.md](documentation/07-NEXTAUTH_ALTERNATIVE.md) - Clerk vs NextAuth détaillé
- [SCHEMA_COMPARISON.md](SCHEMA_COMPARISON.md) - Comparaison des schémas
- [NAVIGATION_PROJET.md](NAVIGATION_PROJET.md) - Navigation générale

---

## Résumé

### Projet Principal : Clerk Production-Ready
- ✅ Simple et rapide
- ✅ UI prête
- ❌ Payant à terme

### Demo-2 : Clerk + Relations
- ✅ Apprendre les relations
- ✅ Schéma alternatif
- ❌ Payant à terme

### Demo-3 : NextAuth Open-Source
- ✅ **100% gratuit**
- ✅ **Contrôle total**
- ❌ Plus de configuration

**Tous les trois sont des implémentations complètes et fonctionnelles !**

Choisissez selon vos besoins et votre niveau. 🚀

