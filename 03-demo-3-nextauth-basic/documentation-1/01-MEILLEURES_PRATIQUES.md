# Meilleures Pratiques NextAuth - Demo 3

Ce document regroupe toutes les meilleures pratiques implémentées dans Demo-3.

---

## 1. Configuration NextAuth

### ✅ Utiliser l'Adapter Prisma

```typescript
import { PrismaAdapter } from "@next-auth/prisma-adapter"

adapter: PrismaAdapter(prisma),
```

**Pourquoi ?**
- Synchronisation automatique avec la base de données
- Gestion des sessions et comptes OAuth
- Support multi-providers natif
- Pas besoin de code custom pour la sync

### ✅ Stratégie JWT pour les sessions

```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 jours
}
```

**Pourquoi JWT ?**
- **Performance** : Pas de requête DB à chaque vérification
- **Scalabilité** : Serverless-friendly
- **Rapidité** : Validation locale du token

**Quand utiliser Database ?**
- Besoin de révocation immédiate
- Données sensibles dans la session
- Tracking précis des sessions actives

### ✅ Pages personnalisées

```typescript
pages: {
  signIn: '/signin',
  signOut: '/signout',
  error: '/error',
}
```

**Pourquoi ?**
- UI cohérente avec votre design
- Contrôle total de l'expérience utilisateur
- Personnalisation illimitée

---

## 2. Sécurité

### ✅ Mot de passe hashe (bcrypt)

```typescript
import bcrypt from "bcryptjs"

// À l'inscription
const hashedPassword = await bcrypt.hash(password, 12)

// À la connexion
const isValid = await bcrypt.compare(password, hashedPassword)
```

**Meilleures pratiques :**
- **12 rounds** : Bon équilibre sécurité/performance
- **Jamais** stocker en clair
- **Toujours** utiliser bcrypt (pas SHA256 ou MD5)

### ✅ NEXTAUTH_SECRET fort

```bash
# Générer un secret fort
openssl rand -base64 32
```

**Critères :**
- Au moins 32 bytes
- Aléatoire (ne pas inventer)
- Différent entre dev et prod
- Gardé secret

### ✅ Validation des entrées

```typescript
// Côté client
if (password.length < 8) {
  setError("Mot de passe trop court")
  return
}

// Côté serveur (TOUJOURS)
if (!email || !password) {
  return NextResponse.json({ error: "..." }, { status: 400 })
}
```

**Règles :**
- Valider côté client ET serveur
- Messages d'erreur clairs
- Ne pas révéler trop d'informations (sécurité)

### ✅ HTTPS en production

```typescript
// next.config.js (production)
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
        ],
      },
    ]
  },
}
```

---

## 3. Callbacks personnalisés

### ✅ Enrichir le JWT

```typescript
callbacks: {
  async jwt({ token, user }) {
    // Ajouter des données personnalisées au token
    if (user) {
      token.id = user.id
      token.role = user.role
      // Ajouter d'autres champs si besoin
    }
    return token
  },
}
```

**Pourquoi ?**
- Accès rapide aux données
- Pas de requête DB supplémentaire
- Disponible côté client

**Attention :**
- Pas de données sensibles
- Taille limitée du token
- Données publiques uniquement

### ✅ Enrichir la session

```typescript
callbacks: {
  async session({ session, token }) {
    // Ajouter les données du token à la session
    if (session.user) {
      session.user.id = token.id
      session.user.role = token.role
    }
    return session
  },
}
```

---

## 4. Gestion des erreurs

### ✅ Try-Catch partout

```typescript
try {
  const result = await signIn(...)
  if (result?.error) {
    setError("Message utilisateur")
  }
} catch (err) {
  setError("Erreur générique")
  console.error(err) // Log pour debug
}
```

### ✅ Messages d'erreur clairs

**Mauvais :**
```typescript
throw new Error("Invalid credentials")
```

**Bon :**
```typescript
throw new Error("Email ou mot de passe incorrect")
```

### ✅ Logging côté serveur

```typescript
events: {
  async signIn({ user }) {
    console.log(`✅ User signed in: ${user.email}`)
  },
  async signOut() {
    console.log(`👋 User signed out`)
  },
}
```

---

## 5. Performance

### ✅ Optimiser les requêtes Prisma

```typescript
// Mauvais : Charger tout
const user = await prisma.user.findUnique({
  where: { id },
  include: { accounts: true, sessions: true },
})

// Bon : Sélectionner seulement ce dont vous avez besoin
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
  }
})
```

### ✅ Utiliser la stratégie JWT

JWT = Pas de requête DB à chaque page

### ✅ Caching (si nécessaire)

```typescript
import { unstable_cache } from 'next/cache'

const getUserData = unstable_cache(
  async (userId: string) => {
    return await prisma.user.findUnique({ where: { id: userId } })
  },
  ['user-data'],
  { revalidate: 3600 } // 1 heure
)
```

---

## 6. Structure du code

### ✅ Séparer la configuration

```
lib/
├── auth.ts          # Configuration NextAuth
├── prisma.ts        # Client Prisma
└── utils.ts         # Helpers
```

### ✅ Grouper les routes auth

```
app/
└── (auth)/
    ├── signin/
    ├── signup/
    └── forgot-password/
```

### ✅ Composants réutilisables

```
components/
├── SessionProvider.tsx
├── UserButton.tsx
└── ProtectedRoute.tsx
```

---

## 7. Providers OAuth

### ✅ Configurer plusieurs providers

```typescript
providers: [
  GoogleProvider({ ... }),
  GitHubProvider({ ... }),
  CredentialsProvider({ ... }),
]
```

**Pourquoi plusieurs ?**
- Flexibilité pour l'utilisateur
- Meilleure UX
- Fallback si un provider down

### ✅ Callback URLs correctes

**Development :**
```
http://localhost:3002/api/auth/callback/google
```

**Production :**
```
https://yourdomain.com/api/auth/callback/google
```

**Important :**
- Configurer les deux dans Google/GitHub
- Tester avant de déployer

---

## 8. Base de données

### ✅ Schéma Prisma minimal

Tables obligatoires :
- `Account`
- `Session`
- `User`
- `VerificationToken`

Ne pas modifier ces tables sauf si nécessaire.

### ✅ Indexes appropriés

```prisma
model User {
  email String @unique  // Index automatique
  // ...
}

model Course {
  @@index([instructorId])  // Index manuel
}
```

**Où ajouter des index ?**
- Colonnes utilisées dans WHERE
- Foreign keys
- Colonnes triées fréquemment

---

## 9. Environnements

### ✅ Variables d'environnement séparées

```.env.development.local
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=dev-secret
```

```.env.production.local
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=production-secret-different
```

### ✅ Validation au démarrage

```typescript
// lib/env.ts
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set")
}
```

---

## 10. Testing

### ✅ Tester les flows

- Inscription → Connexion → Déconnexion
- OAuth (Google, GitHub)
- Erreurs (mauvais mot de passe, email déjà pris)
- Protection des routes
- Révocation de session

### ✅ Tester la sécurité

- Injection SQL (Prisma protège automatiquement)
- XSS (React protège automatiquement)
- CSRF (NextAuth protège automatiquement)
- Mots de passe faibles

---

## 11. Production

### Checklist avant déploiement

- [ ] NEXTAUTH_URL configuré en production
- [ ] NEXTAUTH_SECRET différent de dev
- [ ] HTTPS activé
- [ ] Callback URLs OAuth mis à jour
- [ ] DATABASE_URL en production
- [ ] Logs de sécurité activés
- [ ] Rate limiting sur /api/auth/signin
- [ ] Monitoring des erreurs
- [ ] Backup de la base de données
- [ ] Documentation à jour

### ✅ Monitoring

```typescript
events: {
  async signIn({ user, account }) {
    // Logger dans un service (Sentry, LogRocket, etc.)
    console.log("SignIn", { userId: user.id, provider: account.provider })
  },
  async signInError({ error }) {
    console.error("SignIn Error", error)
  },
}
```

---

## 12. Documentation

### ✅ Documenter la configuration

```typescript
// lib/auth.ts

/**
 * Configuration NextAuth
 * 
 * Providers:
 * - Google OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
 * - GitHub OAuth (GITHUB_ID, GITHUB_SECRET)
 * - Credentials (Email + Password)
 * 
 * Session: JWT strategy (30 jours)
 * Adapter: Prisma (sync automatique avec Supabase)
 */
export const authOptions: NextAuthOptions = {
  // ...
}
```

---

## 13. Erreurs courantes à éviter

### ❌ Ne PAS faire

```typescript
// Stocker le mot de passe en clair
user.password = password

// Utiliser MD5 ou SHA256
const hash = crypto.createHash('md5').update(password).digest('hex')

// Mettre des données sensibles dans JWT
token.creditCard = user.creditCard

// Oublier la validation côté serveur
// (toujours valider, même si validé côté client)

// Utiliser le même secret en dev et prod
NEXTAUTH_SECRET=mysecret123
```

### ✅ Faire

```typescript
// Hasher avec bcrypt
const hash = await bcrypt.hash(password, 12)

// Données publiques dans JWT
token.id = user.id
token.role = user.role

// Validation côté serveur
if (!email || !isValidEmail(email)) {
  throw new Error("Invalid email")
}

// Secrets différents
NEXTAUTH_SECRET=<généré-avec-openssl>
```

---

## Résumé des meilleures pratiques

1. ✅ Utiliser Prisma Adapter
2. ✅ Stratégie JWT pour performance
3. ✅ Hasher les mots de passe (bcrypt, 12 rounds)
4. ✅ NEXTAUTH_SECRET fort (32 bytes)
5. ✅ Validation côté client ET serveur
6. ✅ HTTPS en production
7. ✅ Callbacks pour enrichir session
8. ✅ Gestion des erreurs complète
9. ✅ Logging des événements
10. ✅ Plusieurs providers OAuth
11. ✅ Protection des routes (middleware)
12. ✅ Tests de sécurité
13. ✅ Monitoring en production
14. ✅ Documentation du code

---

**Ces pratiques sont toutes implémentées dans Demo-3 !**

