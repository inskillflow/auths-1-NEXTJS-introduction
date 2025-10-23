# Guide Complet : Demo-2 - Relations Prisma avec Clerk

Ce guide vous accompagne pas à pas pour installer et comprendre le projet Demo-2.

---

## Table des matières

1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Différences avec le projet principal](#différences-avec-le-projet-principal)
4. [Installation étape par étape](#installation-étape-par-étape)
5. [Configuration des variables](#configuration-des-variables)
6. [Initialisation de la base de données](#initialisation-de-la-base-de-données)
7. [Lancement de l'application](#lancement-de-lapplication)
8. [Utilisation de l'application](#utilisation-de-lapplication)
9. [Créer des cours manuellement](#créer-des-cours-manuellement)
10. [Modifier votre profil](#modifier-votre-profil)
11. [Comprendre le schéma](#comprendre-le-schéma)
12. [Comprendre le code](#comprendre-le-code)
13. [Dépannage](#dépannage)
14. [Aller plus loin](#aller-plus-loin)

---

## Introduction

### Qu'est-ce que Demo-2 ?

Demo-2 est un projet de démonstration qui montre :

1. **Approche ID = ClerkId** : L'ID de l'utilisateur dans la base de données est directement l'ID Clerk (pas de champ `clerkId` séparé)

2. **Relations entre tables** : Deux tables liées (User et Course)

3. **Attributs enrichis** : Le modèle User contient plus de champs (role, bio, phoneNumber, website)

4. **Gestion de cours** : Un utilisateur peut créer plusieurs cours en ligne

### Pourquoi ce projet ?

Ce projet démontre :
- Comment gérer des relations entre tables avec Prisma
- Une approche alternative de synchronisation (ID = ClerkId)
- Un cas d'usage réel : plateforme de cours en ligne

**Durée estimée : 20 minutes**

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

### 1. Node.js installé

Vérifiez :
```bash
node --version
```

Si vous voyez `v18.0.0` ou supérieur, c'est bon.

Sinon, téléchargez : [https://nodejs.org](https://nodejs.org)

### 2. Le projet principal installé

Ce projet Demo-2 se base sur le projet principal. Vous devez avoir :
- Déjà installé le projet principal (dans le dossier parent)
- Un compte Clerk configuré
- Un projet Supabase créé

**Si vous n'avez pas encore fait le projet principal, suivez d'abord le guide principal.**

### 3. Un terminal ouvert

Vous devez être capable d'exécuter des commandes dans un terminal.

---

## Différences avec le projet principal

### Tableau comparatif

| Aspect | Projet Principal | Demo-2 |
|--------|------------------|---------|
| **Dossier** | Racine du projet | `demo-2/` |
| **Port** | 3000 | **3001** |
| **ID User** | `id` généré + `clerkId` séparé | `id` = ClerkId directement |
| **Tables** | 1 (User uniquement) | 2 (User + Course) |
| **Attributs User** | 7 champs | **11 champs** |
| **Relations** | Aucune | User ↔ Courses |
| **Cours d'exemple** | Non | **Oui** (2 créés automatiquement) |
| **Recommandé pour** | Production | Apprentissage des relations |

### Schéma User comparé

**Projet principal :**
```prisma
model User {
  id        String   @id @default(cuid())  // ID généré
  clerkId   String   @unique               // ID Clerk séparé
  email     String   @unique
  firstName String?
  lastName  String?
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Demo-2 :**
```prisma
model User {
  id          String   @id                 // = clerkUser.id (pas de @default)
  email       String   @unique
  firstName   String?
  lastName    String?
  imageUrl    String?
  role        String   @default("user")    // NOUVEAU
  bio         String?                      // NOUVEAU
  phoneNumber String?                      // NOUVEAU
  website     String?                      // NOUVEAU
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  courses     Course[]                     // NOUVEAU : Relation
}
```

**Différence clé :** 
- Projet principal : `id` est généré automatiquement (ex: `ckv123xyz`)
- Demo-2 : `id` = ID Clerk directement (ex: `user_2abcdefghijklmnop`)

---

## Installation étape par étape

### Étape 1 : Naviguer vers le dossier demo-2

Ouvrez votre terminal et allez dans le dossier du projet principal, puis dans `demo-2/` :

```bash
# Depuis la racine du projet
cd demo-2
```

**Vérifiez que vous êtes au bon endroit :**

```bash
# Windows
dir

# Mac/Linux
ls
```

Vous devriez voir :
- `package.json`
- `prisma/`
- `app/`
- `lib/`
- `README.md`

### Étape 2 : Installer les dépendances

```bash
npm install
```

**Ce qui se passe :**
- Télécharge tous les packages nécessaires
- Crée le dossier `node_modules/`
- Prend 1-3 minutes

**Vous savez que c'est terminé quand vous voyez :**
```
added XXX packages
```

---

## Configuration des variables

Vous avez **2 options** pour configurer Demo-2 :

### Option 1 : Partager la base de données avec le projet principal

**Avantages :**
- Plus simple
- Réutilise vos clés existantes

**Inconvénients :**
- Les deux projets partagent la même base Supabase
- Risque de confusion entre les tables

**Comment faire :**

1. Depuis le dossier `demo-2/`, copiez le `.env.local` du projet principal :

**Windows (PowerShell) :**
```powershell
Copy-Item ..\.env.local .env.local
```

**Windows (CMD) :**
```cmd
copy ..\.env.local .env.local
```

**Mac/Linux :**
```bash
cp ../.env.local .env.local
```

2. Vérifiez que le fichier a été copié :
```bash
# Windows
dir .env.local

# Mac/Linux
ls .env.local
```

**C'est tout ! Passez à l'étape suivante.**

---

### Option 2 : Créer une base de données Supabase séparée (recommandé)

**Avantages :**
- Bases de données isolées
- Pas de risque de confusion
- Plus propre

**Inconvénients :**
- Un peu plus long à configurer

**Comment faire :**

#### A. Créer un nouveau projet Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. Connectez-vous (vous avez déjà un compte du projet principal)

3. Cliquez sur **"New project"**

4. Remplissez :
   - **Project name :** `clerk-demo-2`
   - **Database Password :** Créez un nouveau mot de passe FORT
     ```
     MonMotDePasseDemo2024!
     ```
   - **IMPORTANT** : Notez ce mot de passe !
   - **Region :** Même région que le projet principal
   - **Plan :** Free

5. Cliquez sur **"Create new project"**

6. Attendez 1-2 minutes que le projet soit créé (statut vert)

#### B. Récupérer l'URL de connexion

1. Dans le menu gauche, cliquez sur **"Settings"**

2. Cliquez sur **"Database"**

3. Descendez jusqu'à **"Connection String"**

4. Cliquez sur l'onglet **"URI"**

5. Copiez l'URL :
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```

6. Remplacez `[YOUR-PASSWORD]` par votre mot de passe :
   ```
   postgresql://postgres.abc123:MonMotDePasseDemo2024!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```

#### C. Créer le fichier .env.local

Dans le dossier `demo-2/`, créez un fichier `.env.local` avec ce contenu :

```env
# Clerk (MÊMES clés que le projet principal)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Supabase (NOUVELLE base de données)
DATABASE_URL="postgresql://postgres.abc123:MonMotDePasseDemo2024!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

**Où trouver les clés Clerk ?**

Vous pouvez les copier depuis le `.env.local` du projet principal :

**Windows (PowerShell) :**
```powershell
Get-Content ..\.env.local
```

**Mac/Linux :**
```bash
cat ../.env.local
```

Copiez les deux lignes `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY`.

---

### Vérification

Quel que soit l'option choisie, vérifiez que `.env.local` existe dans `demo-2/` :

```bash
# Windows
type .env.local

# Mac/Linux
cat .env.local
```

Vous devriez voir vos 3 variables d'environnement.

---

## Initialisation de la base de données

Maintenant, nous allons créer les tables `users` et `courses` dans Supabase.

### Étape 1 : Créer les tables

Dans le terminal, **toujours dans le dossier demo-2/** :

```bash
npx prisma db push
```

**Ce qui se passe :**
1. Prisma lit le fichier `prisma/schema.prisma`
2. Se connecte à Supabase
3. Crée les tables `users` et `courses`
4. Crée les index et contraintes

**Vous devriez voir :**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postgres"

Your database is now in sync with your Prisma schema. Done in X.XXs
```

**Si vous voyez une erreur**, consultez la section [Dépannage](#dépannage).

### Étape 2 : Générer le client Prisma

```bash
npx prisma generate
```

**Vous devriez voir :**
```
✔ Generated Prisma Client (v5.x.x) to .\node_modules\@prisma\client
```

**Parfait ! Les tables sont créées.**

---

## Lancement de l'application

### Étape 1 : Démarrer le serveur

Dans le terminal (toujours dans `demo-2/`) :

```bash
npm run dev
```

**Vous devriez voir :**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3001
- Ready in X.Xs
```

**IMPORTANT** : Le port est **3001** (pas 3000 comme le projet principal).

### Étape 2 : Ouvrir dans le navigateur

1. Ouvrez votre navigateur

2. Allez sur : **http://localhost:3001**

3. Vous devriez voir la page "Demo 2 : Relations User ↔ Course"

**Si le port 3001 est déjà utilisé**, consultez [Dépannage](#dépannage).

---

## Utilisation de l'application

### Étape 1 : Se connecter

1. Sur la page d'accueil, cliquez sur **"Se connecter"**

2. Une popup Clerk s'ouvre

3. **Si vous avez déjà un compte** (du projet principal) :
   - Cliquez sur "Sign in"
   - Entrez votre email et mot de passe
   - Connectez-vous

4. **Si vous n'avez pas de compte** :
   - Créez-en un comme dans le projet principal
   - Suivez les étapes de vérification email

### Étape 2 : Découvrir l'interface

Une fois connecté, vous verrez **deux cartes** :

#### Carte 1 : Profil Utilisateur

Affiche toutes vos informations :
- Avatar
- ID (= votre ID Clerk, ex: `user_2abc...`)
- Email
- Nom complet
- **Rôle** (user par défaut)
- **Bio** (vide pour l'instant)
- **Téléphone** (vide)
- **Site web** (vide)
- Date d'inscription
- **Stats** : Nombre de cours créés et publiés

#### Carte 2 : Mes Cours

Affiche vos cours :
- **2 cours d'exemple sont créés automatiquement** :
  1. "Introduction à Next.js 14" (gratuit, publié)
  2. "TypeScript Avancé" (49.99€, brouillon)

Pour chaque cours, vous voyez :
- Titre
- Description
- Catégorie
- Niveau
- Prix
- Statut (publié ou brouillon)

### Étape 3 : Cours d'exemple automatiques

**Pourquoi 2 cours ?**

À votre première connexion, l'application crée automatiquement 2 cours d'exemple pour vous montrer :
- Comment les cours sont structurés
- Comment la relation User ↔ Course fonctionne
- La différence entre un cours gratuit/payant
- La différence entre publié/brouillon

**Code responsable** (dans `lib/sync-user.ts`) :
```typescript
if (user.courses.length === 0) {
  await createSampleCourses(user.id)
}
```

---

## Créer des cours manuellement

Vous pouvez créer autant de cours que vous voulez via Prisma Studio.

### Étape 1 : Ouvrir Prisma Studio

Dans un **nouveau terminal** (gardez le serveur qui tourne dans l'autre) :

```bash
# Assurez-vous d'être dans demo-2/
cd demo-2

# Lancer Prisma Studio
npx prisma studio
```

**Prisma Studio s'ouvre dans votre navigateur sur** : http://localhost:5555

### Étape 2 : Voir vos tables

Dans Prisma Studio, vous voyez deux tables :
- **users** (vos utilisateurs)
- **courses** (vos cours)

### Étape 3 : Copier votre User ID

1. Cliquez sur la table **"users"**

2. Vous voyez votre utilisateur avec toutes ses informations

3. **Copiez votre ID** (colonne `id`) :
   ```
   user_2abcdefghijklmnop
   ```
   
   Sélectionnez tout l'ID et copiez-le (`Ctrl+C` ou `Cmd+C`)

### Étape 4 : Créer un nouveau cours

1. Cliquez sur la table **"courses"** dans le menu de gauche

2. Vous voyez vos 2 cours d'exemple

3. Cliquez sur le bouton **"Add record"** en haut à droite

4. Remplissez les champs :

   **id** : Laissez vide (sera généré automatiquement)
   
   **title** :
   ```
   React Avancé : Hooks et Context
   ```
   
   **description** :
   ```
   Maîtrisez les hooks personnalisés, Context API, et les patterns avancés de React.
   ```
   
   **category** :
   ```
   programming
   ```
   
   **level** :
   ```
   advanced
   ```
   
   **price** :
   ```
   79.99
   ```
   
   **published** :
   ```
   true
   ```
   
   **instructorId** : **COLLEZ votre User ID ici**
   ```
   user_2abcdefghijklmnop
   ```
   
   **createdAt** : Laissez vide (généré automatiquement)
   
   **updatedAt** : Laissez vide (généré automatiquement)

5. Cliquez sur **"Save 1 change"** en bas à droite

### Étape 5 : Voir le nouveau cours dans l'application

1. Retournez sur http://localhost:3001

2. Rechargez la page (`F5` ou `Ctrl+R`)

3. Votre nouveau cours apparaît dans la carte "Mes Cours" !

### Exemples de cours à créer

**Cours de design :**
```
title: "Figma pour débutants"
description: "Apprenez les bases de Figma..."
category: "design"
level: "beginner"
price: 0
published: true
```

**Cours de business :**
```
title: "Marketing Digital 2024"
description: "Stratégies marketing modernes..."
category: "business"
level: "intermediate"
price: 129.99
published: false
```

---

## Modifier votre profil

Vous pouvez enrichir votre profil utilisateur avec plus d'informations.

### Étape 1 : Ouvrir Prisma Studio

Si ce n'est pas déjà fait :
```bash
npx prisma studio
```

### Étape 2 : Modifier votre utilisateur

1. Cliquez sur la table **"users"**

2. Cliquez sur votre utilisateur (la seule ligne)

3. Modifiez les champs :

   **role** : Changez de `user` à :
   ```
   instructor
   ```
   (ou `admin` si vous voulez)
   
   **bio** :
   ```
   Développeur full-stack passionné par Next.js et React. 
   Je crée des cours en ligne pour partager mes connaissances.
   ```
   
   **phoneNumber** :
   ```
   +33 6 12 34 56 78
   ```
   
   **website** :
   ```
   https://monsite.com
   ```

4. Cliquez sur **"Save 1 change"**

### Étape 3 : Voir les changements

1. Retournez sur http://localhost:3001

2. Rechargez la page

3. Vous voyez maintenant :
   - Votre rôle changé (badge coloré différent)
   - Votre bio
   - Votre téléphone
   - Votre site web

---

## Comprendre le schéma

Le fichier `prisma/schema.prisma` définit la structure de votre base de données.

### Table User (enrichie)

```prisma
model User {
  id          String   @id                 // = clerkUser.id
  email       String   @unique
  firstName   String?
  lastName    String?
  imageUrl    String?
  role        String   @default("user")    // user | instructor | admin
  bio         String?                      // Biographie
  phoneNumber String?                      // Téléphone
  website     String?                      // Site web
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relation
  courses     Course[] @relation("InstructorCourses")
  
  @@map("users")
}
```

**Explications :**

- `@id` : Clé primaire
- `@unique` : Valeur unique dans toute la table
- `String?` : Le `?` signifie optionnel (peut être NULL)
- `@default("user")` : Valeur par défaut
- `@default(now())` : Date actuelle à la création
- `@updatedAt` : Mis à jour automatiquement
- `Course[]` : Un utilisateur a plusieurs cours (relation 1-N)
- `@@map("users")` : Nom de la table en base

### Table Course

```prisma
model Course {
  id           String   @id @default(cuid())
  title        String
  description  String?  @db.Text
  category     String
  level        String   @default("beginner")
  price        Decimal  @default(0) @db.Decimal(10, 2)
  published    Boolean  @default(false)
  
  instructorId String
  instructor   User     @relation("InstructorCourses", fields: [instructorId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([instructorId])
  @@index([category])
  @@index([published])
  @@map("courses")
}
```

**Explications :**

- `@default(cuid())` : ID généré automatiquement (court)
- `@db.Text` : Type TEXT en PostgreSQL (texte long)
- `Decimal` : Pour stocker les prix avec précision
- `@db.Decimal(10, 2)` : 10 chiffres dont 2 après la virgule
- `Boolean` : true/false
- `@relation(...)` : Définit la relation avec User
- `fields: [instructorId]` : Colonne locale
- `references: [id]` : Pointe vers User.id
- `onDelete: Cascade` : Supprime les cours si l'utilisateur est supprimé
- `@@index([...])` : Crée un index pour optimiser les requêtes

### Relation User ↔ Course

```
User (1) ----< (N) Course

Un utilisateur peut créer plusieurs cours
Un cours appartient à un seul instructeur
```

**En SQL, ça donne :**
```sql
-- Table users
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,  -- = clerkUser.id
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  ...
);

-- Table courses
CREATE TABLE courses (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  instructor_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  ...
);
```

---

## Comprendre le code

### Synchronisation (lib/sync-user.ts)

```typescript
export async function syncUser() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) return null
  
  const email = clerkUser.emailAddresses[0]?.emailAddress
  
  // DIFFÉRENCE CLÉ : on utilise "id" au lieu de "clerkId"
  const user = await prisma.user.upsert({
    where: {
      id: clerkUser.id,  // Pas de "clerkId"
    },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      // On ne met pas à jour le role
    },
    create: {
      id: clerkUser.id,  // On fournit l'ID manuellement
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: 'user',
    },
    include: {
      courses: {  // Charger les cours de l'utilisateur
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
  
  return user
}
```

**Points clés :**
1. `where: { id: clerkUser.id }` au lieu de `where: { clerkId: ... }`
2. `create: { id: clerkUser.id }` : on fournit l'ID manuellement
3. `include: { courses: true }` : charge les cours liés

### Création des cours d'exemple

```typescript
export async function createSampleCourses(userId: string) {
  // Vérifier si l'utilisateur a déjà des cours
  const existingCourses = await prisma.course.count({
    where: { instructorId: userId }
  })

  if (existingCourses > 0) {
    return // Ne rien faire si des cours existent déjà
  }

  // Créer 2 cours d'exemple
  await prisma.course.createMany({
    data: [
      {
        title: "Introduction à Next.js 14",
        description: "Apprenez les bases...",
        category: "programming",
        level: "beginner",
        price: 0,
        published: true,
        instructorId: userId,
      },
      {
        title: "TypeScript Avancé",
        description: "Maîtrisez...",
        category: "programming",
        level: "advanced",
        price: 49.99,
        published: false,
        instructorId: userId,
      }
    ]
  })
}
```

### Page principale (app/page.tsx)

```typescript
export default async function Home() {
  let user = null
  
  // 1. Synchroniser l'utilisateur
  user = await syncUser()
  
  // 2. Créer des cours d'exemple si première connexion
  if (user && user.courses.length === 0) {
    await createSampleCourses(user.id)
    user = await syncUser()  // Recharger avec les nouveaux cours
  }
  
  return (
    <div>
      {/* Afficher le profil et les cours */}
      {user && (
        <>
          <div>Profil : {user.email}</div>
          <div>
            Cours : {user.courses.map(c => c.title)}
          </div>
        </>
      )}
    </div>
  )
}
```

---

## Dépannage

### Problème 1 : "table users does not exist"

**Symptôme :** Erreur en se connectant

**Cause :** Les tables n'ont pas été créées dans Supabase

**Solution :**
```bash
cd demo-2
npx prisma db push
npx prisma generate
```

Puis rechargez la page.

---

### Problème 2 : "Port 3001 already in use"

**Symptôme :** Le serveur ne démarre pas

**Cause :** Un autre processus utilise le port 3001

**Solution A :** Arrêter l'autre processus

**Solution B :** Changer le port

Éditez `demo-2/package.json` :
```json
{
  "scripts": {
    "dev": "next dev -p 3002"  // Changez 3001 → 3002
  }
}
```

Puis :
```bash
npm run dev
```

---

### Problème 3 : Les cours d'exemple ne se créent pas

**Symptôme :** Après connexion, aucun cours n'apparaît

**Causes possibles :**
1. Erreur de connexion à Supabase
2. Les cours existent déjà

**Solution :**

1. Vérifiez dans Prisma Studio :
```bash
npx prisma studio
```
Regardez la table "courses"

2. Si la table est vide, déconnectez-vous puis reconnectez-vous

3. Si ça ne fonctionne toujours pas, créez un cours manuellement (voir section précédente)

---

### Problème 4 : "Invalid Publishable Key"

**Symptôme :** Erreur au chargement de la page

**Cause :** Clés Clerk incorrectes dans `.env.local`

**Solution :**

1. Vérifiez `.env.local` :
```bash
cat .env.local
```

2. Assurez-vous que :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` commence par `pk_test_`
   - `CLERK_SECRET_KEY` commence par `sk_test_`
   - Pas d'espaces avant/après les `=`

3. Redémarrez le serveur :
```bash
# Ctrl+C pour arrêter
npm run dev
```

---

### Problème 5 : "Can't reach database"

**Symptôme :** Erreur lors de `npx prisma db push`

**Causes possibles :**
1. `DATABASE_URL` incorrect
2. Mot de passe mal remplacé
3. Projet Supabase inactif

**Solutions :**

1. Vérifiez `DATABASE_URL` dans `.env.local`

2. Assurez-vous d'avoir remplacé `[YOUR-PASSWORD]` par votre vrai mot de passe

3. Allez sur https://supabase.com/dashboard et vérifiez que votre projet est vert (actif)

4. Attendez 2 minutes (les projets gratuits s'endorment et se réveillent)

5. Réessayez :
```bash
npx prisma db push
```

---

### Problème 6 : Les deux projets interfèrent

**Symptôme :** Des données bizarres apparaissent

**Cause :** Les deux projets utilisent la même base Supabase

**Solution :** Utilisez des bases séparées (voir Option 2 dans [Configuration](#configuration-des-variables))

---

## Aller plus loin

Maintenant que Demo-2 fonctionne, vous pouvez :

### 1. Ajouter une table Enrollment

Permettre aux utilisateurs de s'inscrire aux cours :

```prisma
model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  createdAt DateTime @default(now())
  
  @@unique([userId, courseId])  // Un user ne peut s'inscrire qu'une fois à un cours
  @@map("enrollments")
}
```

### 2. Ajouter une table Review

Permettre aux utilisateurs de noter les cours :

```prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int                          // 1-5
  comment   String?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  createdAt DateTime @default(now())
  
  @@unique([userId, courseId])  // Un user ne peut noter qu'une fois
  @@map("reviews")
}
```

### 3. Créer une page de cours individuel

Créer `app/courses/[id]/page.tsx` :

```typescript
export default async function CoursePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { instructor: true }
  })
  
  if (!course) {
    return <div>Cours non trouvé</div>
  }
  
  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Instructeur : {course.instructor.firstName}</p>
    </div>
  )
}
```

### 4. Ajouter un formulaire de création de cours

Au lieu de passer par Prisma Studio, créer un formulaire dans l'interface.

### 5. Ajouter des filtres et la recherche

Filtrer les cours par catégorie, niveau, prix, etc.

### 6. Implémenter les rôles

Permettre seulement aux "instructor" et "admin" de créer des cours.

### 7. Ajouter des chapitres aux cours

Créer une table Lesson liée à Course :

```prisma
model Lesson {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  order       Int
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("lessons")
}
```

---

## Ressources

### Documentation officielle

- **Clerk** : https://clerk.com/docs
- **Prisma** : https://www.prisma.io/docs
- **Prisma Relations** : https://www.prisma.io/docs/concepts/components/prisma-schema/relations
- **Supabase** : https://supabase.com/docs
- **Next.js** : https://nextjs.org/docs

### Commandes utiles

```bash
# Développement
npm run dev

# Voir la base de données
npx prisma studio

# Synchroniser le schéma
npx prisma db push

# Générer le client
npx prisma generate

# Créer une migration
npx prisma migrate dev --name add_enrollments

# Réinitialiser la DB (ATTENTION : perte de données)
npx prisma db push --force-reset

# Voir les logs Prisma
DEBUG=prisma:* npm run dev
```

### Fichiers importants

- `prisma/schema.prisma` : Définition du schéma
- `lib/sync-user.ts` : Logique de synchronisation
- `lib/prisma.ts` : Client Prisma
- `app/page.tsx` : Page principale
- `.env.local` : Variables d'environnement

---

## Conclusion

**Félicitations !**

Vous avez réussi à :
- Installer Demo-2
- Comprendre l'approche ID = ClerkId
- Créer et gérer des relations entre tables
- Manipuler des données avec Prisma Studio
- Enrichir un modèle avec plus d'attributs

**Vous maîtrisez maintenant :**
- Les relations Prisma (1-N)
- L'approche alternative de synchronisation
- La gestion de données complexes
- Prisma Studio

**Différence clé avec le projet principal :**
- Projet principal : Mieux pour la production (ID découplé)
- Demo-2 : Parfait pour apprendre les relations et prototypes

**Vous pouvez maintenant créer des applications complexes avec authentification, base de données et relations !**

---

**Bon développement !**

