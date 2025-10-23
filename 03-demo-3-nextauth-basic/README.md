# Demo 3 : NextAuth + Prisma/Supabase - Minimaliste

Projet minimaliste démontrant l'authentification avec **NextAuth.js** et synchronisation avec **Supabase**.

---

## Caractéristiques

- **Authentification** : NextAuth.js (alternative à Clerk)
- **Base de données** : Supabase (PostgreSQL)
- **ORM** : Prisma
- **Providers** : Google, GitHub, Email/Password
- **Session** : JWT Strategy
- **Port** : 3002

---

## Différences avec les autres projets

| Aspect | Projet Principal | Demo-2 | **Demo-3** |
|--------|------------------|---------|------------|
| **Auth** | Clerk | Clerk | **NextAuth** |
| **Tables** | 1 (User) | 2 (User + Course) | **5 (NextAuth + User)** |
| **Provider** | Service SaaS | Service SaaS | **Open-source** |
| **Coût** | Gratuit → Payant | Gratuit → Payant | **100% gratuit** |
| **UI Auth** | Fournie | Fournie | **À créer** |
| **Contrôle** | Limité | Limité | **Total** |
| **Port** | 3000 | 3001 | **3002** |

---

## Schéma de la base de données

### Tables NextAuth (obligatoires)

```prisma
Account           // Comptes OAuth (Google, GitHub, etc.)
Session           // Sessions utilisateur
User              // Utilisateurs
VerificationToken // Tokens de vérification email
```

### Votre table User enrichie

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  
  // Champs personnalisés
  role          String    @default("user")
  
  // Relations NextAuth
  accounts      Account[]
  sessions      Session[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

## Installation rapide

```bash
# 1. Aller dans demo-3
cd demo-3

# 2. Installer
npm install

# 3. Configurer .env.local
cp .env.sample .env.local
# Éditer avec vos clés

# 4. Créer les tables
npx prisma db push
npx prisma generate

# 5. Lancer
npm run dev
```

Ouvrir : **http://localhost:3002**

---

## Configuration requise

### 1. Variables d'environnement

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=généré-avec-openssl-rand-base64-32

# Database
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# GitHub OAuth (optionnel)
GITHUB_ID=xxxxx
GITHUB_SECRET=xxxxx
```

### 2. Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Providers d'authentification

### Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Authorized redirect URI : `http://localhost:3002/api/auth/callback/google`
6. Copier Client ID et Client Secret

### GitHub OAuth

1. Aller sur [GitHub Settings](https://github.com/settings/developers)
2. New OAuth App
3. Homepage URL : `http://localhost:3002`
4. Authorization callback URL : `http://localhost:3002/api/auth/callback/github`
5. Copier Client ID et Client Secret

### Email + Password

Pas de configuration externe nécessaire. Géré directement dans la base de données.

---

## Structure du projet

```
demo-3/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts    # Config NextAuth
│   │       └── signup/route.ts           # API inscription
│   ├── (auth)/
│   │   ├── signin/page.tsx               # Page connexion
│   │   └── signup/page.tsx               # Page inscription
│   ├── layout.tsx                         # SessionProvider
│   └── page.tsx                           # Page protégée
├── lib/
│   ├── auth.ts                            # Configuration NextAuth
│   └── prisma.ts                          # Client Prisma
├── components/
│   ├── SessionProvider.tsx                # Provider client
│   └── UserButton.tsx                     # Bouton utilisateur
├── prisma/
│   └── schema.prisma                      # Schéma NextAuth + User
├── middleware.ts                          # Protection routes
└── .env.sample                            # Template config
```

---

## Meilleures pratiques implémentées

### 1. JWT Strategy

```typescript
session: {
  strategy: "jwt",  // Plus rapide, serverless-friendly
  maxAge: 30 * 24 * 60 * 60,  // 30 jours
}
```

**Pourquoi ?**
- Pas de requête DB à chaque vérification
- Meilleure performance
- Adapté au serverless

### 2. Prisma Adapter

```typescript
adapter: PrismaAdapter(prisma),
```

**Pourquoi ?**
- Synchronisation automatique
- Gestion des sessions
- Support multi-providers

### 3. Pages personnalisées

```typescript
pages: {
  signIn: '/signin',
  error: '/error',
}
```

**Pourquoi ?**
- UI cohérente avec votre design
- Contrôle total de l'UX

### 4. Callbacks personnalisés

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
      token.role = user.role
    }
    return token
  },
  async session({ session, token }) {
    session.user.id = token.id
    session.user.role = token.role
    return session
  },
}
```

**Pourquoi ?**
- Ajouter des données personnalisées
- Gérer les rôles
- Enrichir la session

### 5. Protection des routes

```typescript
// middleware.ts
export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*"]
}
```

**Pourquoi ?**
- Protection automatique
- Pas de code répétitif
- Redirection automatique

### 6. Hashage des mots de passe

```typescript
import bcrypt from "bcryptjs"

const hashedPassword = await bcrypt.hash(password, 12)
```

**Pourquoi ?**
- Sécurité
- Standard de l'industrie
- 12 rounds = bon équilibre

### 7. Validation des données

```typescript
if (!email || !password) {
  throw new Error("Données manquantes")
}

if (password.length < 8) {
  throw new Error("Mot de passe trop court")
}
```

**Pourquoi ?**
- Éviter les erreurs
- Meilleure UX
- Sécurité

### 8. Gestion des erreurs

```typescript
try {
  // Code
} catch (error) {
  console.error("Error:", error)
  return NextResponse.json(
    { error: "Message utilisateur" },
    { status: 500 }
  )
}
```

**Pourquoi ?**
- Pas d'erreur non gérée
- Logs pour debug
- Messages clairs pour l'utilisateur

---

## Comparaison avec Clerk

### Avantages de NextAuth (Demo-3)

✅ **100% gratuit** à vie
✅ **Open-source** (pas de vendor lock-in)
✅ **Contrôle total** sur tout
✅ **40+ providers** disponibles
✅ **Personnalisation** illimitée
✅ **Données en local** (pas de service externe)

### Inconvénients vs Clerk

❌ Plus de configuration (1-2 heures vs 10 minutes)
❌ UI à créer soi-même
❌ Plus de maintenance
❌ Plus de responsabilités (sécurité)

### Quand utiliser NextAuth ?

- Vous voulez un contrôle total
- Vous voulez que ce soit gratuit
- Vous avez déjà une base de données
- Vous voulez personnaliser l'UI
- Projet à long terme

### Quand utiliser Clerk ?

- Vous voulez démarrer rapidement
- Vous voulez une UI prête
- Vous acceptez un coût futur
- Prototype / MVP rapide

---

## Utilisation

### Se connecter

```typescript
import { signIn } from "next-auth/react"

// Avec provider OAuth
signIn("google", { callbackUrl: "/" })
signIn("github", { callbackUrl: "/" })

// Avec email/password
signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  redirect: false,
})
```

### Récupérer la session

**Server Component :**
```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const session = await getServerSession(authOptions)
console.log(session.user.email)
```

**Client Component :**
```typescript
import { useSession } from "next-auth/react"

const { data: session } = useSession()
console.log(session?.user?.email)
```

### Se déconnecter

```typescript
import { signOut } from "next-auth/react"

signOut({ callbackUrl: "/signin" })
```

---

## Commandes utiles

```bash
# Développement
npm run dev                    # Port 3002

# Base de données
npx prisma studio             # Interface graphique
npx prisma db push            # Sync schéma
npx prisma generate           # Générer client
npx prisma migrate dev        # Créer migration

# Génération
openssl rand -base64 32       # Générer NEXTAUTH_SECRET
```

---

## Sécurité

### Checklist implémentée

- ✅ Mots de passe hashés (bcrypt, 12 rounds)
- ✅ NEXTAUTH_SECRET fort (32 bytes)
- ✅ JWT sécurisés
- ✅ HTTPS en production (obligatoire)
- ✅ Validation des entrées
- ✅ Protection CSRF (NextAuth)
- ✅ Sessions expirables
- ✅ Pas de données sensibles dans JWT

### À faire en production

- [ ] Configurer NEXTAUTH_URL en production
- [ ] Utiliser HTTPS uniquement
- [ ] Rate limiting sur les endpoints
- [ ] Monitoring des tentatives de connexion
- [ ] Logs de sécurité
- [ ] 2FA (optionnel)

---

## Dépannage

### "Invalid NEXTAUTH_SECRET"

Vérifiez que `NEXTAUTH_SECRET` est défini dans `.env.local`

```bash
openssl rand -base64 32
```

### "Callback URL mismatch"

Vérifiez les URLs dans Google/GitHub OAuth :
- Development : `http://localhost:3002/api/auth/callback/google`
- Production : `https://yourdomain.com/api/auth/callback/google`

### Port 3002 déjà utilisé

Changez dans `package.json` :
```json
"dev": "next dev -p 3003"
```

### Tables manquantes

```bash
npx prisma db push
npx prisma generate
```

---

## Ressources

- **NextAuth Docs** : https://next-auth.js.org
- **Prisma Adapter** : https://next-auth.js.org/adapters/prisma
- **Providers** : https://next-auth.js.org/providers
- **Examples** : https://github.com/nextauthjs/next-auth-example

---

## Documentation complète

- **[00-GUIDE_COMPLET_DEMO3.md](00-GUIDE_COMPLET_DEMO3.md)** - Guide étape par étape
- **[MEILLEURES_PRATIQUES.md](MEILLEURES_PRATIQUES.md)** - Bonnes pratiques NextAuth
- **[../documentation/07-NEXTAUTH_ALTERNATIVE.md](../documentation/07-NEXTAUTH_ALTERNATIVE.md)** - Comparaison détaillée

---

**Bon développement avec NextAuth !**

