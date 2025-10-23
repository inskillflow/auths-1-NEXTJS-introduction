# Installation Demo-3 : NextAuth + Supabase

Guide d'installation étape par étape.

---

## Installation rapide (10 minutes)

```bash
# 1. Aller dans demo-3
cd demo-3

# 2. Installer
npm install

# 3. Configurer .env.local
cp .env.sample .env.local
# Éditer .env.local

# 4. Générer NEXTAUTH_SECRET
openssl rand -base64 32
# Copier dans .env.local

# 5. Créer les tables
npx prisma db push
npx prisma generate

# 6. Lancer
npm run dev
```

Ouvrir : **http://localhost:3002**

---

## Configuration détaillée

### 1. Variables d'environnement

Créer `.env.local` avec :

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=<généré-avec-openssl>

# Database
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# GitHub OAuth (optionnel)
GITHUB_ID=xxx
GITHUB_SECRET=xxx
```

### 2. Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copier le résultat dans `.env.local`

### 3. Configuration Google OAuth (optionnel)

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Application type : Web application
6. Authorized redirect URIs :
   - `http://localhost:3002/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copier Client ID et Client Secret

### 4. Configuration GitHub OAuth (optionnel)

1. Aller sur [GitHub Settings](https://github.com/settings/developers)
2. New OAuth App
3. Homepage URL : `http://localhost:3002`
4. Authorization callback URL : `http://localhost:3002/api/auth/callback/github`
5. Copier Client ID et Client Secret

### 5. Base de données Supabase

**Option A : Réutiliser la DB du projet principal**

```bash
cp ../.env.local .env.local
# Puis éditer pour changer NEXTAUTH_URL et ajouter NEXTAUTH_SECRET
```

**Option B : Nouvelle base de données**

1. Créer un nouveau projet Supabase
2. Récupérer l'URL de connexion
3. La mettre dans `.env.local`

### 6. Créer les tables

```bash
npx prisma db push
```

Cela crée les 4 tables Next Auth :
- `accounts`
- `sessions`
- `users`
- `verification_tokens`

### 7. Générer le client Prisma

```bash
npx prisma generate
```

---

## Test

### 1. Lancer l'application

```bash
npm run dev
```

### 2. Créer un compte

1. Aller sur http://localhost:3002
2. Vous serez redirigé vers `/signin`
3. Cliquer sur "S'inscrire"
4. Remplir le formulaire
5. Compte créé !

### 3. Se connecter

Trois options :
- Google OAuth
- GitHub OAuth
- Email + Password

### 4. Vérifier dans Supabase

```bash
npx prisma studio
```

Ouvre http://localhost:5555

Vous verrez vos tables et données !

---

## Problèmes courants

### "Invalid NEXTAUTH_SECRET"

Solution :
```bash
openssl rand -base64 32
# Copier dans .env.local
```

### "Callback URL mismatch"

Vérifiez que les URLs dans Google/GitHub OAuth correspondent :
- Dev : `http://localhost:3002/api/auth/callback/google`
- Prod : `https://yourdomain.com/api/auth/callback/google`

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

## Prochaines étapes

1. **Tester les trois providers** (Google, GitHub, Email)
2. **Explorer Prisma Studio** pour voir les données
3. **Lire** [MEILLEURES_PRATIQUES.md](MEILLEURES_PRATIQUES.md)
4. **Comparer** avec Clerk (projet principal)

---

**Installation terminée ! Vous pouvez maintenant utiliser NextAuth !**

