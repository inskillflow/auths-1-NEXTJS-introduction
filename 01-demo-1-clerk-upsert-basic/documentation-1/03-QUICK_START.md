# ⚡ Démarrage Rapide (5 minutes)

## 1️⃣ Installation (1 min)

```bash
npm install
```

## 2️⃣ Configuration Clerk (2 min)

### Créer un compte Clerk
1. 🔗 [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)
2. Créer une nouvelle application
3. Choisir "Email" comme méthode d'authentification

### Récupérer les clés
Dans le dashboard Clerk, aller sur **"API Keys"** :

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxx
```

## 3️⃣ Configuration Supabase (2 min)

### Créer un projet Supabase
1. 🔗 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquer "New Project"
3. Choisir un nom et un mot de passe (⚠️ **NOTER CE MOT DE PASSE**)

### Récupérer l'URL de connexion
Dans Supabase, aller sur **Settings → Database** :

1. Trouver "Connection String"
2. Choisir l'onglet "**URI**" (mode direct)
3. Copier l'URL
4. Remplacer `[YOUR-PASSWORD]` par votre mot de passe noté précédemment

```
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxx.supabase.co:5432/postgres"
```

## 4️⃣ Créer le fichier .env.local

**Option 1 : Copier le template**
```bash
cp env.sample .env.local
```
Puis éditer `.env.local` avec vos vraies valeurs.

**Option 2 : Créer manuellement**

Créer un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxx
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxx.supabase.co:5432/postgres"
```

## 5️⃣ Initialiser la base de données

```bash
npx prisma db push
npx prisma generate
```

Vous devriez voir :
```
✔ Your database is now in sync with your Prisma schema
✔ Generated Prisma Client
```

## 6️⃣ Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## ✅ Test

1. Cliquer sur "**Se connecter**"
2. Créer un compte avec votre email
3. Vous devriez voir :
   - ✅ Badge vert "Utilisateur synchronisé"
   - 📊 Vos données affichées

## 🔍 Vérifier dans Supabase

1. Aller sur votre dashboard Supabase
2. Cliquer sur "**Table Editor**" dans le menu de gauche
3. Sélectionner la table "**users**"
4. 🎉 Vous devriez voir votre utilisateur !

---

## ❌ Problèmes courants

### Erreur "Invalid Publishable Key"
- ✅ Vérifier que vous avez bien copié la clé qui commence par `pk_test_`
- ✅ Vérifier qu'il n'y a pas d'espace avant/après dans `.env.local`

### Erreur de connexion Prisma
- ✅ Vérifier que vous avez remplacé `[YOUR-PASSWORD]` par votre vrai mot de passe
- ✅ Vérifier qu'il n'y a pas de caractères spéciaux non encodés
- ✅ Dans Supabase, vérifier que votre projet est bien démarré (vert)

### La table n'existe pas
- ✅ Relancer `npx prisma db push`
- ✅ Attendre quelques secondes que Supabase se réveille

---

## 🎓 Prochaines étapes

1. ✅ Lire [COMPARISON.md](./COMPARISON.md) pour comprendre Upsert vs Webhooks
2. ✅ Lire [README.md](./README.md) pour la documentation complète
3. ✅ Explorer [examples/webhook-method](./examples/webhook-method/) si vous voulez les webhooks

---

## 🆘 Besoin d'aide ?

- 📖 [Documentation Clerk](https://clerk.com/docs)
- 📖 [Documentation Prisma](https://www.prisma.io/docs)
- 📖 [Documentation Supabase](https://supabase.com/docs)

