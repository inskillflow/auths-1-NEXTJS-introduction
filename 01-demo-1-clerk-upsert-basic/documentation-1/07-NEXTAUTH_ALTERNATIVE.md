# NextAuth vs Clerk : Guide Complet et Meilleures Pratiques

Ce guide explique comment implémenter la même synchronisation avec NextAuth.js au lieu de Clerk.

---

## Table des matières

1. [Comparaison Clerk vs NextAuth](#comparaison-clerk-vs-nextauth)
2. [Architecture avec NextAuth](#architecture-avec-nextauth)
3. [Meilleures pratiques NextAuth](#meilleures-pratiques-nextauth)
4. [Implémentation complète](#implémentation-complète)
5. [Synchronisation avec Prisma](#synchronisation-avec-prisma)
6. [Sécurité et sessions](#sécurité-et-sessions)
7. [Avantages et inconvénients](#avantages-et-inconvénients)

---

## Comparaison Clerk vs NextAuth

### Tableau comparatif

| Aspect | Clerk | NextAuth.js |
|--------|-------|-------------|
| **Type** | Service SaaS | Bibliothèque open-source |
| **Coût** | Gratuit jusqu'à 10k users, puis payant | **100% gratuit** |
| **Configuration** | Simple, clés API | Plus de configuration |
| **UI** | **Fournie et personnalisable** | À créer soi-même |
| **Providers** | Email, Google, GitHub, etc. | **40+ providers** |
| **Contrôle** | Limité (service externe) | **Total** |
| **Base de données** | Optionnelle | **Requise** |
| **Webhooks** | Intégrés | À implémenter |
| **Profil utilisateur** | Géré par Clerk | **Géré par vous** |
| **Maintenance** | Clerk s'en charge | **Vous** |
| **Personnalisation** | Limitée | **Illimitée** |
| **Dépendance** | Vendor lock-in | Aucune |

### Quand utiliser Clerk ?

✅ Vous voulez démarrer rapidement
✅ Vous voulez une UI prête
✅ Vous acceptez un service payant à terme
✅ Vous voulez peu de maintenance

### Quand utiliser NextAuth ?

✅ Vous voulez un contrôle total
✅ Vous voulez que ce soit 100% gratuit
✅ Vous avez déjà une base de données
✅ Vous voulez personnaliser l'UI
✅ Pas de dépendance externe

---

## Architecture avec NextAuth

### Flux d'authentification

```
1. Utilisateur → Page de connexion
   ↓
2. Sélectionne un provider (Google, GitHub, Email...)
   ↓
3. NextAuth gère l'OAuth / Credentials
   ↓
4. Callback → Créer/Mettre à jour l'utilisateur dans Prisma
   ↓
5. Session créée → JWT ou Database session
   ↓
6. Utilisateur connecté
```

### Schéma Prisma pour NextAuth

NextAuth nécessite des tables spécifiques :

```prisma
// schema.prisma avec NextAuth
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Tables NextAuth (OBLIGATOIRES)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  
  // Vos champs personnalisés
  role          String    @default("user")
  bio           String?
  phoneNumber   String?
  website       String?
  
  accounts      Account[]
  sessions      Session[]
  courses       Course[]  // Vos relations personnalisées
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// Vos tables personnalisées
model Course {
  id           String   @id @default(cuid())
  title        String
  description  String?  @db.Text
  category     String
  level        String   @default("beginner")
  price        Decimal  @default(0) @db.Decimal(10, 2)
  published    Boolean  @default(false)
  
  instructorId String
  instructor   User     @relation(fields: [instructorId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([instructorId])
  @@map("courses")
}
```

---

## Meilleures pratiques NextAuth

### 1. Structure du projet

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts          # Configuration NextAuth
│
├── (auth)/                        # Group route pour l'auth
│   ├── signin/
│   │   └── page.tsx              # Page de connexion personnalisée
│   ├── signup/
│   │   └── page.tsx              # Page d'inscription
│   └── error/
│       └── page.tsx              # Page d'erreur
│
├── layout.tsx                     # SessionProvider
└── page.tsx                       # Page protégée

lib/
├── auth.ts                        # Configuration NextAuth
├── prisma.ts                      # Client Prisma
└── session.ts                     # Helpers de session
```

### 2. Variables d'environnement

```env
# .env.local

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-genere-avec-openssl

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# GitHub OAuth (optionnel)
GITHUB_ID=xxxxx
GITHUB_SECRET=xxxxx

# Email (optionnel - pour magic links)
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=xxxxx
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_FROM=noreply@example.com
```

**Générer NEXTAUTH_SECRET :**
```bash
openssl rand -base64 32
```

### 3. Configuration NextAuth

**Fichier : `lib/auth.ts`**

```typescript
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  // Configuration de session
  session: {
    strategy: "jwt", // ou "database"
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Pages personnalisées
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/error',
    verifyRequest: '/verify-request',
  },

  // Providers d'authentification
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // Email (Magic Links)
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),

    // Credentials (Email + Password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.hashedPassword) {
          throw new Error("Utilisateur non trouvé")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),
  ],

  // Callbacks pour personnaliser le comportement
  callbacks: {
    // Callback JWT : Ajouter des données personnalisées au token
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    // Callback Session : Ajouter des données à la session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },

    // Callback SignIn : Personnaliser la création d'utilisateur
    async signIn({ user, account, profile, email, credentials }) {
      // Vous pouvez ajouter de la logique ici
      // Par exemple : vérifier si l'email est autorisé
      return true
    },
  },

  // Events pour logger ou synchroniser
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email}`)
      
      // Synchronisation avec d'autres services
      if (isNewUser) {
        // Envoyer un email de bienvenue
        // Créer des données par défaut
        await prisma.course.createMany({
          data: [
            {
              title: "Cours de bienvenue",
              instructorId: user.id,
              category: "tutorial",
              published: false,
            }
          ]
        })
      }
    },
    
    async signOut({ session, token }) {
      console.log(`User signed out`)
    },
  },

  // Debug en développement
  debug: process.env.NODE_ENV === "development",
}
```

### 4. Route API NextAuth

**Fichier : `app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### 5. Provider de session

**Fichier : `app/layout.tsx`**

```typescript
import { SessionProvider } from "@/components/SessionProvider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

**Fichier : `components/SessionProvider.tsx`**

```typescript
"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

---

## Implémentation complète

### 1. Page de connexion personnalisée

**Fichier : `app/(auth)/signin/page.tsx`**

```typescript
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email ou mot de passe incorrect")
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold">Connexion</h2>
        </div>

        {/* OAuth Providers */}
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-2 text-gray-700 shadow-md hover:bg-gray-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              {/* Google Icon */}
            </svg>
            Continuer avec Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-3 rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              {/* GitHub Icon */}
            </svg>
            Continuer avec GitHub
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Ou</span>
          </div>
        </div>

        {/* Email + Password */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  )
}
```

### 2. Page d'inscription

**Fichier : `app/(auth)/signup/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import bcrypt from "bcryptjs"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      // Rediriger vers la page de connexion
      router.push("/signin?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-center text-3xl font-bold">Créer un compte</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-sm text-gray-500">
              Au moins 8 caractères
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <a href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}
```

### 3. API d'inscription

**Fichier : `app/api/auth/signup/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "user",
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
}
```

### 4. Utilisation dans les pages

**Fichier : `app/page.tsx`**

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  // Récupérer l'utilisateur avec ses cours
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      courses: {
        orderBy: { createdAt: "desc" },
        take: 10,
      }
    }
  })

  return (
    <div>
      <h1>Bienvenue {user?.name}</h1>
      <p>Email: {user?.email}</p>
      
      <h2>Vos cours ({user?.courses.length})</h2>
      {user?.courses.map((course) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  )
}
```

### 5. Composants d'authentification

**Fichier : `components/UserButton.tsx`**

```typescript
"use client"

import { signOut, useSession } from "next-auth/react"

export function UserButton() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="flex items-center gap-4">
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name || "User"}
          className="h-10 w-10 rounded-full"
        />
      )}
      <div>
        <p className="font-medium">{session.user.name}</p>
        <p className="text-sm text-gray-500">{session.user.email}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/signin" })}
        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Déconnexion
      </button>
    </div>
  )
}
```

---

## Synchronisation avec Prisma

### Synchronisation automatique

La synchronisation se fait automatiquement via l'adapter Prisma :

```typescript
// Dans lib/auth.ts
adapter: PrismaAdapter(prisma),
```

**Avantages :**
- Utilisateur créé automatiquement à la connexion
- Sessions gérées dans la DB
- Comptes liés automatiquement

### Synchronisation manuelle (si nécessaire)

Si vous voulez ajouter de la logique personnalisée :

```typescript
// Dans callbacks.signIn
async signIn({ user, account, profile, isNewUser }) {
  if (isNewUser) {
    // Créer des données par défaut
    await prisma.course.createMany({
      data: [
        {
          title: "Cours de bienvenue",
          instructorId: user.id,
          category: "tutorial",
        }
      ]
    })
  }
  return true
}
```

---

## Sécurité et sessions

### 1. Stratégie de session

**JWT (recommandé pour la plupart des cas) :**
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 jours
}
```

**Avantages JWT :**
- Pas de requête DB à chaque vérification
- Scalable (serverless-friendly)
- Plus rapide

**Database (pour plus de contrôle) :**
```typescript
session: {
  strategy: "database",
  maxAge: 30 * 24 * 60 * 60,
}
```

**Avantages Database :**
- Révocation immédiate possible
- Plus sécurisé pour des données sensibles
- Meilleur tracking

### 2. Protection des routes

**Server Component :**
```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/signin")
  }
  
  return <div>Contenu protégé</div>
}
```

**Client Component :**
```typescript
"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function ProtectedPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin")
    },
  })
  
  if (status === "loading") {
    return <div>Chargement...</div>
  }
  
  return <div>Contenu protégé</div>
}
```

### 3. Middleware pour protection globale

**Fichier : `middleware.ts`**

```typescript
export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/courses/create",
  ]
}
```

### 4. Vérification des rôles

```typescript
// Helper
export async function requireRole(role: string) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== role) {
    redirect("/unauthorized")
  }
}

// Utilisation
export default async function AdminPage() {
  await requireRole("admin")
  
  return <div>Page admin</div>
}
```

---

## Avantages et inconvénients

### Clerk

**Avantages :**
✅ Démarrage ultra-rapide (10 minutes)
✅ UI prête et belle
✅ Webhooks intégrés
✅ Gestion complète du profil
✅ Peu de maintenance

**Inconvénients :**
❌ Payant au-delà de 10k users
❌ Dépendance à un service externe
❌ Personnalisation limitée
❌ Vendor lock-in

### NextAuth

**Avantages :**
✅ 100% gratuit
✅ Contrôle total
✅ 40+ providers
✅ Personnalisation illimitée
✅ Pas de dépendance externe
✅ Open-source

**Inconvénients :**
❌ Plus de configuration (1-2 heures)
❌ UI à créer soi-même
❌ Plus de maintenance
❌ Plus de responsabilités (sécurité)

---

## Migration Clerk → NextAuth

Si vous voulez migrer :

### 1. Installer NextAuth

```bash
npm install next-auth @next-auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

### 2. Adapter le schéma Prisma

Ajouter les tables NextAuth + garder vos tables existantes

### 3. Créer les pages d'authentification

Remplacer les composants Clerk par vos pages NextAuth

### 4. Migrer les utilisateurs

Script pour migrer les données :

```typescript
// scripts/migrate-from-clerk.ts
import { prisma } from "@/lib/prisma"

async function migrateUsers() {
  const clerkUsers = await prisma.user.findMany({
    where: { clerkId: { not: null } }
  })
  
  for (const user of clerkUsers) {
    // Créer l'utilisateur NextAuth
    await prisma.user.create({
      data: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        image: user.imageUrl,
        role: user.role,
        // Pas de mot de passe, l'utilisateur devra en créer un
      }
    })
  }
}
```

---

## Package.json pour NextAuth

```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-auth": "^4.24.0",
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "^5.7.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/bcryptjs": "^2.4.6",
    "prisma": "^5.7.0",
    "typescript": "^5"
  }
}
```

---

## Conclusion

### Recommandations

**Pour un MVP / Prototype rapide :**
→ **Clerk** (démarrage en 10 minutes)

**Pour un projet long terme / SaaS :**
→ **NextAuth** (contrôle total, gratuit)

**Pour un projet avec budget :**
→ **Clerk** (moins de maintenance)

**Pour un projet open-source :**
→ **NextAuth** (pas de dépendance payante)

### Meilleures pratiques NextAuth

1. ✅ Utilisez l'adapter Prisma
2. ✅ Strategy JWT pour la performance
3. ✅ Créez des pages d'auth personnalisées
4. ✅ Protégez les routes avec middleware
5. ✅ Gérez les rôles côté serveur
6. ✅ Hashez toujours les mots de passe (bcrypt)
7. ✅ Utilisez NEXTAUTH_SECRET fort
8. ✅ Configurez plusieurs providers (Google + GitHub + Email)
9. ✅ Testez la révocation de session
10. ✅ Loggez les événements d'authentification

---

## Ressources

- **NextAuth Documentation** : https://next-auth.js.org
- **Prisma Adapter** : https://next-auth.js.org/adapters/prisma
- **Providers** : https://next-auth.js.org/providers
- **Exemples** : https://github.com/nextauthjs/next-auth-example

---

**Bon développement avec NextAuth !**

