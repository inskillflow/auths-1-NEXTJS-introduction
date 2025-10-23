# ✅ Checklist d'Installation - Clerk + Prisma/Supabase

Utilisez cette checklist pour suivre votre progression étape par étape.

---

## 📋 Avant de commencer

- [ ] J'ai Node.js installé (`node --version` fonctionne)
- [ ] J'ai un éditeur de code (VS Code recommandé)
- [ ] J'ai un terminal ouvert
- [ ] Je suis dans le dossier du projet

**Vérifier que je suis au bon endroit :**
```bash
# Je devrais voir package.json, prisma/, app/, lib/
ls    # Mac/Linux
dir   # Windows
```

---

## 1️⃣ Installation des dépendances

### Commande à exécuter :
```bash
npm install
```

### Je sais que c'est réussi quand :
- [ ] Je vois : `added XXX packages`
- [ ] Pas de messages d'erreur en rouge
- [ ] Le dossier `node_modules/` est créé

⏱️ **Temps estimé :** 2-3 minutes

---

## 2️⃣ Configuration Clerk

### Étapes :
1. [ ] J'ai créé un compte sur [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)
2. [ ] J'ai créé une nouvelle application
3. [ ] J'ai coché "Email" comme méthode de connexion
4. [ ] J'ai copié `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (commence par `pk_test_`)
5. [ ] J'ai copié `CLERK_SECRET_KEY` (commence par `sk_test_`)

### Je garde ces clés dans un fichier temporaire :
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx...
CLERK_SECRET_KEY=sk_test_xxxxx...
```

---

## 3️⃣ Configuration Supabase

### Étapes :
1. [ ] J'ai créé un compte sur [https://supabase.com](https://supabase.com)
2. [ ] J'ai créé une organisation
3. [ ] J'ai créé un nouveau projet avec :
   - [ ] Un nom de projet
   - [ ] Un mot de passe FORT (je l'ai noté !)
   - [ ] Une région proche de moi
4. [ ] J'ai attendu que le projet soit créé (statut vert ✅)
5. [ ] Je suis allé dans Settings → Database
6. [ ] J'ai copié la "Connection String" (onglet URI)
7. [ ] J'ai remplacé `[YOUR-PASSWORD]` par mon vrai mot de passe

### Mon URL Supabase ressemble à :
```
postgresql://postgres.xxxxx:MON_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

⚠️ **Vérification importante :**
- [ ] L'URL contient bien mon mot de passe (pas `[YOUR-PASSWORD]`)
- [ ] Il n'y a pas d'espaces dans l'URL

---

## 4️⃣ Création du fichier .env.local

### Option A : Copier le template

**Windows (PowerShell) :**
```powershell
Copy-Item env.sample .env.local
```

**Windows (CMD) :**
```cmd
copy env.sample .env.local
```

**Mac/Linux :**
```bash
cp env.sample .env.local
```

- [ ] Commande exécutée sans erreur

### Option B : Créer manuellement
- [ ] J'ai créé un fichier nommé exactement `.env.local` à la racine
- [ ] Le point au début est bien présent
- [ ] Pas de `.txt` à la fin

---

## 5️⃣ Remplir le fichier .env.local

### J'ouvre .env.local et je colle :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=MA_CLE_CLERK_PK
CLERK_SECRET_KEY=MA_CLE_CLERK_SK
DATABASE_URL="MON_URL_SUPABASE_COMPLETE"
```

### Vérifications :
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` commence par `pk_test_`
- [ ] `CLERK_SECRET_KEY` commence par `sk_test_`
- [ ] `DATABASE_URL` est entouré de guillemets `"..."`
- [ ] `DATABASE_URL` contient mon vrai mot de passe
- [ ] Il n'y a **pas d'espaces** avant ou après les `=`
- [ ] J'ai sauvegardé le fichier (`Ctrl + S`)

---

## 6️⃣ Initialisation de la base de données

### Commande 1 : Créer la table
```bash
npx prisma db push
```

### Je sais que c'est réussi quand :
- [ ] Je vois : `Environment variables loaded from .env`
- [ ] Je vois : `Prisma schema loaded from prisma\schema.prisma`
- [ ] Je vois : `Your database is now in sync with your Prisma schema`
- [ ] Pas de message d'erreur rouge

### Commande 2 : Générer le client
```bash
npx prisma generate
```

### Je sais que c'est réussi quand :
- [ ] Je vois : `✔ Generated Prisma Client`

⏱️ **Temps estimé :** 30 secondes

---

## 7️⃣ Lancement de l'application

### Commande :
```bash
npm run dev
```

### Je sais que c'est réussi quand :
- [ ] Je vois : `▲ Next.js 14.1.0`
- [ ] Je vois : `- Local: http://localhost:3000`
- [ ] Je vois : `- Ready in X.Xs`
- [ ] Pas d'erreurs rouges

### J'ouvre mon navigateur :
- [ ] J'ouvre [http://localhost:3000](http://localhost:3000)
- [ ] Je vois la page "Clerk + Prisma Sync"
- [ ] Je vois le bouton "Se connecter"

⏱️ **L'app démarre en 5-10 secondes**

---

## 8️⃣ Test de la synchronisation

### Étapes :
1. [ ] Je clique sur "Se connecter"
2. [ ] Une popup Clerk s'ouvre
3. [ ] Je clique sur "Sign up"
4. [ ] J'entre mon email
5. [ ] Je crée un mot de passe
6. [ ] Je clique sur "Continue"
7. [ ] Je reçois un code par email
8. [ ] J'entre le code de vérification
9. [ ] J'entre mon prénom et nom (optionnel)
10. [ ] La page se recharge

### Je sais que ça marche quand :
- [ ] Je vois le badge vert : ✅ "Utilisateur synchronisé avec succès !"
- [ ] Je vois mes informations affichées :
  - [ ] ID Prisma
  - [ ] Clerk ID
  - [ ] Email
  - [ ] Prénom / Nom
  - [ ] Dates de création/mise à jour

🎉 **SUCCÈS ! La synchronisation fonctionne !**

---

## 9️⃣ Vérification dans Supabase

### Étapes :
1. [ ] Je vais sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. [ ] Je clique sur mon projet
3. [ ] Je clique sur "Table Editor" (menu gauche)
4. [ ] Je vois la table "users"
5. [ ] Je clique sur "users"
6. [ ] Je vois mon utilisateur dans la table !

### Colonnes que je devrais voir :
- [ ] `id` : un ID court (ex: ckv123xyz)
- [ ] `clerkId` : un ID Clerk (ex: user_2abc...)
- [ ] `email` : mon email
- [ ] `firstName` : mon prénom
- [ ] `lastName` : mon nom
- [ ] `createdAt` : date de création
- [ ] `updatedAt` : date de mise à jour

✅ **C'est la preuve que tout est dans la base de données !**

---

## 🎯 Récapitulatif final

### Tous les éléments en place :

**Fichiers :**
- [ ] `.env.local` existe et contient mes vraies clés
- [ ] `node_modules/` existe (dépendances installées)

**Services externes :**
- [ ] Compte Clerk créé ✅
- [ ] Application Clerk créée ✅
- [ ] Compte Supabase créé ✅
- [ ] Projet Supabase créé et actif (vert) ✅
- [ ] Table "users" créée dans Supabase ✅

**Application :**
- [ ] `npm run dev` fonctionne ✅
- [ ] Application accessible sur http://localhost:3000 ✅
- [ ] Je peux me connecter ✅
- [ ] Mes données apparaissent ✅
- [ ] Mes données sont dans Supabase ✅

---

## 🆘 Dépannage rapide

### ❌ Problème : Erreur "Invalid Publishable Key"
**Solution :**
```bash
# Vérifier .env.local
# Redémarrer le serveur :
Ctrl + C
npm run dev
```

### ❌ Problème : "The table public.users does not exist"
**Solution :**
```bash
npx prisma db push
npx prisma generate
# Recharger la page du navigateur
```

### ❌ Problème : "Can't reach database"
**Solution :**
1. Vérifier que le mot de passe dans `DATABASE_URL` est correct
2. Vérifier que le projet Supabase est actif (vert)
3. Attendre 2 minutes et réessayer

### ❌ Problème : npm install échoue
**Solution :**
```bash
# Supprimer et réinstaller
rm -rf node_modules     # Mac/Linux
rmdir /s node_modules   # Windows
npm install
```

---

## 🎊 Félicitations !

Si toutes les cases sont cochées, vous avez :
- ✅ Installé un projet Next.js
- ✅ Configuré l'authentification avec Clerk
- ✅ Configuré une base de données avec Supabase
- ✅ Synchronisé automatiquement les utilisateurs
- ✅ Testé que tout fonctionne

**Vous êtes prêt à développer votre application ! 🚀**

---

## 📊 Temps total estimé

| Étape | Temps |
|-------|-------|
| Installation npm | 2-3 min |
| Configuration Clerk | 3-5 min |
| Configuration Supabase | 5-7 min |
| Création .env.local | 2 min |
| Initialisation DB | 1 min |
| Lancement et test | 5 min |
| **TOTAL** | **20-25 min** |

---

## 🔗 Prochaines étapes

Maintenant que tout fonctionne, consultez :

- [ ] `documentation/05-GUIDE_COMPLET_DEBUTANT.md` - Comprendre le code
- [ ] `documentation/02-COMPARISON.md` - Upsert vs Webhooks
- [ ] `SCHEMA_COMPARISON.md` - Schémas Prisma alternatifs
- [ ] `README.md` - Documentation générale

**Bon développement ! 💻✨**

