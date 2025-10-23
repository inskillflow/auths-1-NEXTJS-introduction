# Guide Complet : Clerk + Prisma/Supabase de A à Z

## Table des matières

1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Installation du projet](#installation-du-projet)
4. [Configuration Clerk (authentification)](#configuration-clerk)
5. [Configuration Supabase (base de données)](#configuration-supabase)
6. [Variables d'environnement](#variables-denvironnement)
7. [Initialisation de la base de données](#initialisation-de-la-base-de-données)
8. [Lancement de l'application](#lancement-de-lapplication)
9. [Test de la synchronisation](#test-de-la-synchronisation)
10. [Vérification dans Supabase](#vérification-dans-supabase)
11. [Dépannage](#dépannage)
12. [Comprendre le code](#comprendre-le-code)

---

## Introduction

Ce guide va vous apprendre à créer une application Next.js qui :
- Permet aux utilisateurs de se connecter (avec Clerk)
- Stocke automatiquement leurs données dans une base de données (avec Supabase)
- Synchronise tout automatiquement

**Durée estimée : 30 minutes**

**Niveau : Débutant** (pas besoin de connaissances avancées)

---

## Prérequis

### Ce dont vous avez besoin :

#### 1. Node.js installé
Vérifiez si vous l'avez :
```bash
node --version
```

Si vous voyez quelque chose comme `v18.0.0` ou supérieur, c'est bon

Sinon, téléchargez-le : [https://nodejs.org](https://nodejs.org) (version LTS)

#### 2. Un éditeur de code
- **VS Code** (recommandé) : [https://code.visualstudio.com](https://code.visualstudio.com)
- Ou tout autre éditeur que vous préférez

#### 3. Un compte email
Pour créer vos comptes Clerk et Supabase (gratuit)

#### 4. Un terminal/invite de commande
- **Windows** : PowerShell, CMD, ou Git Bash
- **Mac** : Terminal
- **Linux** : Terminal

---

## Installation du projet

### Étape 1 : Ouvrir un terminal

**Windows :**
- Appuyez sur `Win + R`
- Tapez `cmd` ou `powershell`
- Appuyez sur Entrée

**Mac/Linux :**
- Appuyez sur `Cmd + Espace` (Mac) ou `Ctrl + Alt + T` (Linux)
- Tapez `terminal`

### Étape 2 : Naviguer vers le dossier du projet

```bash
cd c:\projetsnext\02-next-match-clerck-3
```

**IMPORTANT : Ajustez le chemin** selon l'emplacement réel de votre projet

### Étape 3 : Vérifier que vous êtes au bon endroit

```bash
# Windows
dir

# Mac/Linux
ls
```

Vous devriez voir des fichiers comme :
- `package.json`
- `prisma/`
- `app/`
- `lib/`

### Étape 4 : Installer les dépendances

```bash
npm install
```

**Cela prendra 1-3 minutes**

Vous verrez beaucoup de lignes défiler. C'est normal !

**Terminé quand vous voyez** : `added XXX packages`

---

## Configuration Clerk

Clerk gère l'authentification (connexion/inscription des utilisateurs).

### Étape 1 : Créer un compte Clerk

1. Allez sur : [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)

2. **Inscrivez-vous** avec :
   - Votre email
   - Ou connectez-vous avec GitHub/Google

3. **Vérifiez votre email** si demandé

### Étape 2 : Créer une application

1. Une fois connecté, cliquez sur **"Create Application"** (Créer une application)

2. Remplissez :
   - **Name** : `Mon App Clerk` (ou le nom que vous voulez)
   - **Sign-in methods** : Cochez **"Email"**
   
3. Cliquez sur **"Create Application"**

### Étape 3 : Récupérer vos clés API

Vous serez automatiquement redirigé vers une page montrant vos clés.

**Vous verrez 2 clés importantes :**

#### Clé 1 : NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```
pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
**Copiez cette clé** (cliquez sur l'icône de copie)

#### Clé 2 : CLERK_SECRET_KEY
```
sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
**Copiez cette clé aussi**

**IMPORTANT :** Gardez ces clés quelque part temporairement (Notepad, etc.)

> **Astuce :** Vous pouvez toujours retrouver ces clés en allant dans :
> Dashboard Clerk → Cliquez sur votre app → **"API Keys"** dans le menu de gauche

---

## Configuration Supabase

Supabase fournit une base de données PostgreSQL gratuite.

### Étape 1 : Créer un compte Supabase

1. Allez sur : [https://supabase.com](https://supabase.com)

2. Cliquez sur **"Start your project"** en haut à droite

3. Inscrivez-vous avec :
   - GitHub (recommandé, plus rapide)
   - Ou un email

### Étape 2 : Créer une organisation

1. Après connexion, Supabase demande de créer une **organization**

2. Entrez :
   - **Organization name** : `Mon Organisation` (ou votre nom)
   - **Type** : Personal (gratuit)

3. Cliquez sur **"Create organization"**

### Étape 3 : Créer un projet

1. Cliquez sur **"New project"**

2. Remplissez les informations :

   **Project name :**
   ```
   clerk-sync-db
   ```
   (ou le nom que vous voulez)

   **Database Password :** 
   ```
   Créez un mot de passe FORT
   ```
   
   **TRÈS IMPORTANT** : 
   - Notez ce mot de passe dans un fichier texte
   - Vous en aurez ABSOLUMENT besoin plus tard
   - **Ne le perdez pas !**
   
   Exemple de bon mot de passe :
   ```
   MySecurePass2024!
   ```

   **Region :**
   - Choisissez la région la plus proche de vous
   - Europe : `West EU (Frankfurt)`
   - USA : `East US`
   - Autre : choisissez le plus proche

   **Plan :**
   - Gardez **"Free"** sélectionné

3. Cliquez sur **"Create new project"**

**Le projet prend 1-2 minutes à se créer**

Vous verrez un message : "Setting up project..." 

**Prenez une pause, attendez que ça devienne vert**

### Étape 4 : Récupérer l'URL de connexion

Une fois le projet créé (statut vert) :

1. Dans le menu de gauche, cliquez sur l'icône **"Settings"**

2. Dans le sous-menu, cliquez sur **"Database"**

3. Faites défiler vers le bas jusqu'à la section **"Connection String"**

4. Vous verrez plusieurs onglets, cliquez sur **"URI"**

5. Vous verrez quelque chose comme :
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```

6. **Copiez cette URL entière**

7. **CRUCIAL** : Remplacez `[YOUR-PASSWORD]` par le mot de passe que vous avez créé à l'étape 3

   **Exemple :**
   
   Avant :
   ```
   postgresql://postgres.abc123:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
   
   Après (avec votre vrai mot de passe) :
   ```
   postgresql://postgres.abc123:MySecurePass2024!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```

8. Gardez cette URL complète dans votre fichier texte

---

## Variables d'environnement

Maintenant, nous allons mettre toutes ces clés dans un fichier de configuration.

### Étape 1 : Créer le fichier .env.local

**Option A : Copier le template (recommandé)**

Dans votre terminal (dans le dossier du projet) :

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

**Option B : Créer manuellement**

1. Dans votre éditeur de code (VS Code)
2. Créez un nouveau fichier à la racine du projet
3. Nommez-le exactement : `.env.local`
   - Le point au début est important !
   - Pas de `.txt` à la fin

### Étape 2 : Remplir le fichier .env.local

Ouvrez le fichier `.env.local` dans votre éditeur

Collez ce contenu et remplacez les valeurs :

```env
# ============================================
# CLERK AUTHENTICATION
# ============================================

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=COLLEZ_ICI_VOTRE_CLE_CLERK_pk_test_
CLERK_SECRET_KEY=COLLEZ_ICI_VOTRE_CLE_CLERK_sk_test_


# ============================================
# SUPABASE DATABASE
# ============================================

DATABASE_URL="COLLEZ_ICI_VOTRE_URL_SUPABASE_COMPLETE"
```

### Étape 3 : Remplacer les valeurs

Prenez les clés que vous avez copiées et remplacez :

**Exemple de fichier .env.local rempli :**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bG9jYWwtc2Vhcm1vcy04Mi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_4eFJOjI7bndoYXRldmVyLnRoaXMuaXNfdGVzdA

DATABASE_URL="postgresql://postgres.abc123:MySecurePass2024!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

### Étape 4 : Vérifications importantes

**Vérifiez que :**

1. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` commence par `pk_test_`
2. `CLERK_SECRET_KEY` commence par `sk_test_`
3. `DATABASE_URL` est entouré de guillemets `"..."`
4. Dans `DATABASE_URL`, vous avez bien remplacé `[YOUR-PASSWORD]` par votre vrai mot de passe
5. Il n'y a **pas d'espaces** avant ou après les `=`
6. Le fichier s'appelle exactement `.env.local` (pas `.env.local.txt`)

### Étape 5 : Sauvegarder

**Sauvegardez le fichier** (`Ctrl + S` ou `Cmd + S`)

---

## Initialisation de la base de données

Maintenant, nous allons créer la table `users` dans Supabase.

### Étape 1 : Vérifier la connexion

Dans votre terminal, exécutez :

```bash
npx prisma db push
```

**Ce qui devrait se passer :**

Vous verrez :
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postgres"...
```

Puis :
```
Your database is now in sync with your Prisma schema. Done in X.XXs
```

Enfin :
```
✔ Generated Prisma Client
```

**Parfait ! La table `users` a été créée dans Supabase !**

### Étape 2 : Générer le client Prisma

Si ce n'est pas déjà fait automatiquement, exécutez :

```bash
npx prisma generate
```

Vous devriez voir :
```
✔ Generated Prisma Client
```

---

## Lancement de l'application

### Étape 1 : Démarrer le serveur de développement

Dans votre terminal :

```bash
npm run dev
```

Vous devriez voir :
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

### Étape 2 : Ouvrir dans le navigateur

1. Ouvrez votre navigateur (Chrome, Firefox, Edge, Safari...)

2. Allez sur : **http://localhost:3000**

3. **Vous devriez voir votre application !**

---

## Test de la synchronisation

### Étape 1 : Page d'accueil

Vous devriez voir :
- Un titre : "Clerk + Prisma Sync"
- Un message : "Connectez-vous pour voir la synchronisation en action"
- Un bouton **"Se connecter"**

### Étape 2 : Se connecter

1. Cliquez sur le bouton **"Se connecter"**

2. Une popup Clerk s'ouvre

3. Choisissez **"Sign up"** (S'inscrire)

### Étape 3 : Créer un compte

Dans la popup :

1. **Email :** Entrez votre email (réel)
   ```
   exemple : votreemail@gmail.com
   ```

2. **Password :** Créez un mot de passe
   ```
   exemple : MonMotDePasse123!
   ```

3. Cliquez sur **"Continue"**

4. **Code de vérification :**
   - Clerk envoie un code à votre email
   - Vérifiez votre boîte mail
   - Entrez le code (6 chiffres)
   - Cliquez sur **"Continue"**

### Étape 4 : Remplir le profil (optionnel)

Clerk peut demander :
- **First name** (Prénom) : `Jean`
- **Last name** (Nom) : `Dupont`

Remplissez et cliquez sur **"Continue"**

### Étape 5 : Vérifier la synchronisation

**MAGIE !** Vous devriez voir :

1. La page se recharge

2. Un badge vert : **"Utilisateur synchronisé avec succès !"**

3. Une carte avec vos informations :
   ```
   Données dans Supabase
   
   ID Prisma:      ckv123xyz
   Clerk ID:       user_2abc...
   Email:          votreemail@gmail.com
   Prénom:         Jean
   Nom:            Dupont
   Créé le:        23/10/2025
   Mis à jour:     23/10/2025
   ```

4. Un bouton de profil en haut à droite

**FÉLICITATIONS ! Votre synchronisation fonctionne !**

---

## Vérification dans Supabase

Pour être sûr que tout est bien stocké dans la base de données :

### Étape 1 : Ouvrir le dashboard Supabase

1. Allez sur : [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. Connectez-vous si nécessaire

3. Cliquez sur votre projet (`clerk-sync-db`)

### Étape 2 : Voir la table users

1. Dans le menu de gauche, cliquez sur **"Table Editor"**

2. Vous devriez voir la table **"users"**

3. Cliquez dessus

### Étape 3 : Voir vos données

**Vous devriez voir votre utilisateur !**

| id | clerkId | email | firstName | lastName | createdAt | updatedAt |
|----|---------|-------|-----------|----------|-----------|-----------|
| ckv123xyz | user_2abc... | votreemail@gmail.com | Jean | Dupont | 2025-10-23... | 2025-10-23... |

**C'est la preuve que la synchronisation fonctionne !**

---

## Dépannage

### Problème 1 : "Invalid Publishable Key"

**Symptôme :** Erreur au chargement de la page

**Solution :**
1. Ouvrez `.env.local`
2. Vérifiez que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` commence bien par `pk_test_`
3. Vérifiez qu'il n'y a pas d'espaces avant/après
4. Sauvegardez
5. Redémarrez le serveur :
   ```bash
   # Ctrl + C pour arrêter
   npm run dev  # Relancer
   ```

### Problème 2 : "The table `public.users` does not exist"

**Symptôme :** Erreur en se connectant avec le badge rouge

**Solution :**
```bash
npx prisma db push
npx prisma generate
```

Puis rechargez la page

### Problème 3 : "Error: P1001: Can't reach database"

**Symptôme :** Erreur lors de `npx prisma db push`

**Solution :**
1. Ouvrez `.env.local`
2. Vérifiez que `DATABASE_URL` est correct
3. Vérifiez que vous avez bien remplacé `[YOUR-PASSWORD]` par votre vrai mot de passe
4. Dans Supabase, vérifiez que votre projet est bien actif (statut vert)
5. Attendez 2 minutes que Supabase se réveille (les projets gratuits s'endorment après inactivité)

### Problème 4 : Le serveur ne démarre pas (npm run dev)

**Solution :**
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install

# Puis relancer
npm run dev
```

### Problème 5 : "Module not found" ou erreurs TypeScript

**Solution :**
```bash
npx prisma generate
npm run dev
```

### Problème 6 : Le fichier .env.local n'est pas pris en compte

**Solution :**
1. Vérifiez que le fichier s'appelle exactement `.env.local` (pas `.env.local.txt`)
2. Le fichier doit être à la **racine du projet** (même niveau que `package.json`)
3. Redémarrez le serveur (`Ctrl + C` puis `npm run dev`)

---

## Comprendre le code

Maintenant que tout fonctionne, voyons comment ça marche.

### Structure du projet

```
02-next-match-clerck-3/
│
├── app/                    # Pages de l'application
│   ├── layout.tsx         # Configuration Clerk
│   ├── page.tsx           # Page d'accueil avec sync
│   └── globals.css        # Styles
│
├── lib/                    # Code réutilisable
│   ├── prisma.ts          # Connexion à la base de données
│   └── sync-user.ts       # LA MAGIE : fonction de synchronisation
│
├── prisma/
│   └── schema.prisma      # Définition de la table User
│
├── middleware.ts           # Protection des routes avec Clerk
├── package.json            # Dépendances du projet
└── .env.local             # Vos clés secrètes
```

### Le schéma Prisma (prisma/schema.prisma)

```prisma
model User {
  id            String   @id @default(cuid())  // ID unique généré automatiquement
  clerkId       String   @unique                // ID de l'utilisateur dans Clerk
  email         String   @unique                // Email unique
  firstName     String?                          // ? = optionnel
  lastName      String?
  imageUrl      String?
  createdAt     DateTime @default(now())        // Date de création automatique
  updatedAt     DateTime @updatedAt             // Mise à jour automatique
}
```

**Ce fichier définit la structure de votre table `users` dans Supabase.**

### La fonction de synchronisation (lib/sync-user.ts)

```typescript
export async function syncUser() {
  // 1. Récupérer l'utilisateur connecté dans Clerk
  const clerkUser = await currentUser()
  
  if (!clerkUser) return null
  
  // 2. Upsert : créer OU mettre à jour dans Supabase
  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },  // Chercher par clerkId
    
    // Si existe : mettre à jour
    update: {
      email: clerkUser.email,
      firstName: clerkUser.firstName,
      // ...
    },
    
    // Si n'existe pas : créer
    create: {
      clerkId: clerkUser.id,
      email: clerkUser.email,
      firstName: clerkUser.firstName,
      // ...
    }
  })
  
  return user
}
```

**Cette fonction fait toute la magie :**
- Vérifie si l'utilisateur existe dans Supabase
- Si non → le crée
- Si oui → le met à jour
- Retourne les données

### La page d'accueil (app/page.tsx)

```typescript
export default async function Home() {
  // Appeler la fonction de synchronisation
  const syncedUser = await syncUser()
  
  return (
    <div>
      <SignedOut>
        {/* Bouton de connexion si pas connecté */}
      </SignedOut>
      
      <SignedIn>
        {/* Afficher les données si connecté */}
        {syncedUser && (
          <div>
            Email: {syncedUser.email}
            Prénom: {syncedUser.firstName}
            {/* ... */}
          </div>
        )}
      </SignedIn>
    </div>
  )
}
```

**Cette page :**
1. Appelle `syncUser()` au chargement
2. Affiche le bouton de connexion si pas connecté
3. Affiche les données si connecté

---

## Prochaines étapes

Maintenant que vous maîtrisez la base, vous pouvez :

### 1. Ajouter des champs dans le schéma

Dans `prisma/schema.prisma` :
```prisma
model User {
  // ... champs existants
  phoneNumber   String?
  bio           String?
  age           Int?
}
```

Puis :
```bash
npx prisma db push
```

### 2. Créer d'autres tables

Exemple : une table de posts
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}

model User {
  // ... champs existants
  posts     Post[]   // Relation : un utilisateur a plusieurs posts
}
```

### 3. Protéger des pages

Dans `middleware.ts`, décommentez :
```typescript
if (!isPublicRoute(request)) {
  auth().protect()  // Protège toutes les routes sauf celles dans isPublicRoute
}
```

### 4. Migrer vers les Webhooks

Consultez :
- `examples/webhook-method/` pour le code
- `documentation/02-COMPARISON.md` pour comprendre la différence

---

## Ressources supplémentaires

### Documentation officielle

- **Clerk :** [https://clerk.com/docs](https://clerk.com/docs)
- **Prisma :** [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **Supabase :** [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js :** [https://nextjs.org/docs](https://nextjs.org/docs)

### Fichiers du projet

- `documentation/01-ENV_SETUP.md` - Configuration des variables
- `documentation/02-COMPARISON.md` - Upsert vs Webhooks
- `documentation/03-QUICK_START.md` - Démarrage rapide
- `SCHEMA_COMPARISON.md` - Comprendre les schémas Prisma
- `README.md` - Documentation générale

### Outils utiles

**Voir la base de données (GUI) :**
```bash
npx prisma studio
```
Ouvre une interface graphique sur http://localhost:5555

**Réinitialiser la base de données :**
```bash
npx prisma db push --force-reset
```
**ATTENTION : Supprime toutes les données !**

---

## Conclusion

**Félicitations !**

Vous avez réussi à :
- Installer et configurer un projet Next.js
- Configurer l'authentification avec Clerk
- Configurer une base de données PostgreSQL avec Supabase
- Synchroniser automatiquement les utilisateurs
- Comprendre le fonctionnement du code

**Vous êtes maintenant capable de créer des applications avec authentification et base de données !**

---

## Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Relisez la section [Dépannage](#dépannage)
2. Vérifiez vos clés dans `.env.local`
3. Consultez la console du navigateur (F12) pour les erreurs
4. Consultez le terminal pour les erreurs serveur
5. Assurez-vous que Supabase est actif (statut vert)

**Les erreurs les plus courantes :**
- Oublier de créer `.env.local`
- Ne pas remplacer `[YOUR-PASSWORD]` dans l'URL Supabase
- Oublier de lancer `npx prisma db push`
- Avoir des espaces dans les clés API

---

## Glossaire

**Clerk** : Service d'authentification (gère les connexions)

**Supabase** : Base de données PostgreSQL gratuite dans le cloud

**Prisma** : ORM (Object-Relational Mapping) - permet de parler à la base de données facilement

**Upsert** : UPDATE + INSERT = créer si n'existe pas, mettre à jour si existe

**Next.js** : Framework React pour créer des applications web

**API Key** : Clé secrète pour accéder aux services

**Environment Variables** : Variables secrètes (dans `.env.local`)

**PostgreSQL** : Type de base de données relationnelle

---

**Bon coding !**

