# Demo 4 : NextAuth + Entités Enrichies

Projet combinant **NextAuth.js** avec une architecture complète incluant plusieurs entités et relations.

---

## Caractéristiques

- **Auth** : NextAuth.js (Open-source)
- **Base de données** : Supabase (PostgreSQL)
- **ORM** : Prisma
- **Tables** : 6 (4 NextAuth + User enrichi + Course)
- **Relations** : User ↔ Courses (1-N)
- **Providers** : Google, GitHub, Email/Password
- **Port** : 3003

---

## Différences avec les autres projets

| Aspect | Demo-2 | Demo-3 | **Demo-4** |
|--------|---------|---------|------------|
| **Auth** | Clerk | NextAuth | **NextAuth** |
| **Tables** | 2 (User + Course) | 5 (NextAuth) | **6 (NextAuth + Course)** |
| **Attributs User** | 11 champs | 9 champs | **11 champs** |
| **Relations** | User → Courses | Aucune | **User → Courses** |
| **Coût** | Gratuit → Payant | **100% gratuit** | **100% gratuit** |
| **Complexité** | ⭐ Simple | ⭐⭐ Moyenne | **⭐⭐⭐ Avancée** |

---

## Architecture

### Tables de la base de données

**Tables NextAuth (4) :**
- `Account` - Comptes OAuth (Google, GitHub)
- `Session` - Sessions utilisateur
- `VerificationToken` - Tokens de vérification
- `User` - Utilisateurs (enrichi)

**Tables métier (1) :**
- `Course` - Cours en ligne

**Relation :**
```
User (1) ──── (N) Course
```

### Schéma User enrichi

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  hashedPassword String?
  
  // Champs personnalisés (comme Demo-2)
  role          String    @default("user")        // user | instructor | admin
  bio           String?   @db.Text                // Biographie
  phoneNumber   String?                           // Téléphone
  website       String?                           // Site web
  
  // Relations NextAuth
  accounts      Account[]
  sessions      Session[]
  
  // Relations métier
  courses       Course[]  @relation("InstructorCourses")
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Schéma Course

```prisma
model Course {
  id           String   @id @default(cuid())
  title        String
  description  String?  @db.Text
  category     String                           // programming, design, etc.
  level        String   @default("beginner")    // beginner | intermediate | advanced
  price        Decimal  @default(0) @db.Decimal(10, 2)
  published    Boolean  @default(false)
  
  instructorId String
  instructor   User     @relation("InstructorCourses", fields: [instructorId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## Installation

### 1. Installation des dépendances

```bash
cd demo-4
npm install
```

### 2. Configuration .env.local

```bash
cp .env.sample .env.local
```

Éditer `.env.local` :

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=<généré-avec-openssl>

# Database
DATABASE_URL="postgresql://..."

# Google (optionnel)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# GitHub (optionnel)
GITHUB_ID=xxx
GITHUB_SECRET=xxx
```

### 3. Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 4. Créer les tables

```bash
npx prisma db push
npx prisma generate
```

### 5. Lancer

```bash
npm run dev  # Port 3003
```

Ouvrir : **http://localhost:3003**

---

## Fonctionnalités

### À la première connexion

1. **User créé automatiquement** (via PrismaAdapter)
2. **2 cours d'exemple créés** automatiquement
3. **Session enregistrée** dans la DB

### Page d'accueil

- **Profil complet** : Avatar, nom, email, rôle, bio, téléphone, site web
- **Liste des cours** : Tous les cours de l'instructeur
- **Statistiques** : Nombre de cours, cours publiés, brouillons
- **Actions** : Créer, éditer, supprimer des cours

### Gestion des cours

- Affichage des cours avec titre, description, catégorie, niveau, prix
- Filtrage par statut (publié/brouillon)
- Badge de niveau (débutant, intermédiaire, avancé)
- Badge de prix (gratuit ou montant)

---

## Comparaison avec Demo-2 (Clerk)

### Similitudes

✅ User enrichi (role, bio, phone, website)
✅ Table Course identique
✅ Relation User → Courses
✅ Affichage profil + cours
✅ Création automatique de cours d'exemple

### Différences

| Aspect | Demo-2 (Clerk) | Demo-4 (NextAuth) |
|--------|----------------|-------------------|
| **Auth** | Clerk SaaS | NextAuth Open-source |
| **Sync** | Manuel (upsert) | **Automatique** |
| **Tables** | 2 | **6** |
| **ID User** | ClerkId direct | **cuid généré** |
| **Sessions** | Géré par Clerk | **En base de données** |
| **Coût** | $0 → $225/mois | **$0 toujours** |
| **UI Auth** | Fournie | **Personnalisée** |

---

## Structure du projet

```
demo-4/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    # Config NextAuth
│   │   │   └── signup/route.ts           # Inscription
│   │   └── courses/
│   │       ├── route.ts                   # CRUD courses
│   │       └── [id]/route.ts              # Course par ID
│   ├── (auth)/
│   │   ├── signin/page.tsx               # Connexion
│   │   └── signup/page.tsx               # Inscription
│   ├── layout.tsx                         # SessionProvider
│   └── page.tsx                           # Profil + Cours
├── lib/
│   ├── auth.ts                            # Configuration NextAuth
│   ├── prisma.ts                          # Client Prisma
│   └── actions.ts                         # Server Actions (courses)
├── components/
│   ├── SessionProvider.tsx
│   ├── UserProfile.tsx                    # Carte profil
│   ├── CourseList.tsx                     # Liste cours
│   └── CourseCard.tsx                     # Carte cours
├── prisma/
│   └── schema.prisma                      # 6 tables
└── middleware.ts                          # Protection routes
```

---

## Meilleures pratiques implémentées

### 1. Architecture en couches

```
Présentation (UI)
    ↓
Actions (Server Actions)
    ↓
Business Logic
    ↓
Data Access (Prisma)
```

### 2. Relations Prisma optimisées

```typescript
// Récupérer user avec ses cours
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    courses: {
      orderBy: { createdAt: 'desc' },
      where: { published: true }
    },
    _count: {
      select: { courses: true }
    }
  }
})
```

### 3. Cascade Delete

```prisma
onDelete: Cascade  // Supprimer user = supprimer ses cours
```

### 4. Indexes pour performance

```prisma
@@index([instructorId])
@@index([category])
@@index([published])
```

### 5. Types TypeScript stricts

```typescript
type UserWithCourses = User & {
  courses: Course[]
  _count: { courses: number }
}
```

### 6. Seed automatique

Au premier login, création de 2 cours d'exemple pour démo.

---

## Utilisation avancée

### Créer un cours

```typescript
// Server Action
export async function createCourse(data: CourseData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié")
  }
  
  const course = await prisma.course.create({
    data: {
      ...data,
      instructorId: session.user.id
    }
  })
  
  return course
}
```

### Récupérer les cours d'un user

```typescript
const courses = await prisma.course.findMany({
  where: { instructorId: userId },
  orderBy: { createdAt: 'desc' },
  include: {
    instructor: {
      select: {
        id: true,
        name: true,
        image: true
      }
    }
  }
})
```

### Filtrer les cours

```typescript
// Seulement les cours publiés
where: { published: true }

// Par catégorie
where: { category: 'programming' }

// Par niveau
where: { level: 'beginner' }

// Gratuits
where: { price: 0 }
```

---

## Commandes utiles

```bash
# Développement
npm run dev                    # Port 3003

# Base de données
npx prisma studio             # Interface graphique
npx prisma db push            # Sync schéma
npx prisma generate           # Générer client

# Créer un cours manuellement
# Via Prisma Studio ou API
```

---

## Avantages de Demo-4

### vs Demo-2 (Clerk)

✅ **100% gratuit** (pas de limite d'utilisateurs)
✅ **Sync automatique** (pas besoin d'appeler syncUser)
✅ **Sessions en DB** (révocation immédiate)
✅ **Contrôle total** sur tout
✅ **Open-source** (pas de vendor lock-in)

### vs Demo-3 (NextAuth simple)

✅ **Entités métier** (Course)
✅ **Relations** (1-N)
✅ **Architecture complète** (plus réaliste)
✅ **CRUD complet** (API courses)
✅ **Composants réutilisables**

---

## Cas d'usage

**Utilisez Demo-4 si :**
- ✅ Vous voulez une architecture complète
- ✅ Vous avez besoin de relations
- ✅ Vous voulez que ce soit gratuit
- ✅ Vous apprenez NextAuth + Prisma ensemble
- ✅ Projet type LMS (Learning Management System)
- ✅ Projet type marketplace

**N'utilisez pas si :**
- ❌ Vous débutez (trop complexe)
- ❌ Vous voulez juste tester NextAuth (utilisez Demo-3)
- ❌ Vous n'avez pas besoin de relations

---

## Évolutions possibles

- [ ] Ajouter table `Enrollment` (inscriptions aux cours)
- [ ] Ajouter table `Review` (avis sur les cours)
- [ ] Ajouter table `Chapter` (chapitres des cours)
- [ ] Upload d'images pour les cours
- [ ] Système de paiement (Stripe)
- [ ] Dashboard instructeur
- [ ] Page publique des cours

---

## Documentation complète

- **[00-GUIDE_COMPLET.md](00-GUIDE_COMPLET.md)** - Guide étape par étape
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture détaillée
- **[API.md](API.md)** - Documentation API
- **[../COMPARAISON_COMPLETE_3_PROJETS.md](../COMPARAISON_COMPLETE_3_PROJETS.md)** - Comparaison avec les autres

---

**Demo-4 = NextAuth + Architecture complète !** 🚀

Le projet le plus avancé de la collection.

