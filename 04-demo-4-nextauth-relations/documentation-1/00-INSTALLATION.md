# Installation Demo-4 : NextAuth + Entités Enrichies

Guide d'installation complet pour Demo-4.

---

## Installation rapide

```bash
# 1. Aller dans demo-4
cd demo-4

# 2. Installer
npm install

# 3. Configurer .env.local
cp .env.sample .env.local

# 4. Générer NEXTAUTH_SECRET
openssl rand -base64 32
# Copier dans .env.local

# 5. Ajouter DATABASE_URL (même que les autres projets si vous voulez)

# 6. Créer les tables
npx prisma db push
npx prisma generate

# 7. Lancer
npm run dev  # Port 3003
```

Ouvrir : **http://localhost:3003**

---

## Configuration détaillée

### 1. Variables d'environnement

Créer `.env.local` :

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=<généré-avec-openssl>

# Database (même que projet principal ou nouveau)
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# GitHub OAuth (optionnel)
GITHUB_ID=xxx
GITHUB_SECRET=xxx
```

### 2. Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 3. Base de données

**Option A : Réutiliser la DB existante**

```bash
cp ../.env.local .env.local
# Éditer pour changer NEXTAUTH_URL et NEXTAUTH_SECRET
```

Les tables de Demo-4 (6 tables) seront créées dans la même base de données.

**Option B : Nouvelle base de données**

Créer un nouveau projet Supabase et copier l'URL.

### 4. Créer les tables

```bash
npx prisma db push
```

Cela crée 6 tables :
- `users` (User enrichi)
- `courses`
- `accounts`
- `sessions`
- `verification_tokens`

### 5. Générer le client

```bash
npx prisma generate
```

---

## Premier test

### 1. Lancer l'app

```bash
npm run dev
```

### 2. Créer un compte

1. Aller sur http://localhost:3003
2. Redirection vers `/signin`
3. Cliquer "S'inscrire"
4. Remplir le formulaire
5. Compte créé !

### 3. Se connecter

Trois options :
- Email/Password
- Google OAuth
- GitHub OAuth

### 4. Vérifier la sync

**À la première connexion :**
- ✅ User créé automatiquement
- ✅ 2 cours d'exemple créés
- ✅ Session enregistrée

**Dans Prisma Studio :**
```bash
npx prisma studio
```

Vous verrez toutes les 6 tables remplies !

---

## Différences avec les autres projets

### vs Demo-2 (Clerk + Relations)

| Aspect | Demo-2 | Demo-4 |
|--------|---------|---------|
| **Auth** | Clerk | NextAuth |
| **Sync** | Manuel (upsert) | **Automatique** |
| **Tables** | 2 | **6** |
| **Coût** | $0 → $225/mois | **$0 toujours** |
| **Sessions** | Clerk | **En DB** |

### vs Demo-3 (NextAuth simple)

| Aspect | Demo-3 | Demo-4 |
|--------|---------|---------|
| **Tables** | 5 | **6** |
| **Relations** | Aucune | **User → Courses** |
| **CRUD** | Basique | **Complet** |
| **Composants** | Simples | **Avancés** |

---

## Problèmes courants

### "Invalid NEXTAUTH_SECRET"

```bash
openssl rand -base64 32
```

### Cours d'exemple non créés

Vérifiez les logs :
```bash
npm run dev
```

Vous devriez voir :
```
✅ User signed in: user@example.com
🆕 New user registered: user@example.com
📚 Created sample courses for user@example.com
```

Si les cours ne sont pas créés, rafraîchissez la page.

### Port 3003 déjà utilisé

Changez dans `package.json` :
```json
"dev": "next dev -p 3004"
```

---

## Prochaines étapes

1. **Tester le CRUD** : Publier, dépublier, supprimer des cours
2. **Explorer Prisma Studio** : Voir les relations
3. **Personnaliser** : Ajouter vos propres champs
4. **Comparer** : Avec Demo-2 (Clerk)

---

**Installation terminée ! Vous avez le projet le plus avancé !** 🚀

