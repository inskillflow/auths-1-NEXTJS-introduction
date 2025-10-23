# Guide d'Installation - Demo 2

## Démarrage rapide (5 minutes)

### 1. Naviguer dans le dossier

```bash
cd demo-2
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

**Option A : Copier le template**
```bash
# Windows PowerShell
Copy-Item .env.sample .env.local

# Windows CMD
copy .env.sample .env.local

# Mac/Linux
cp .env.sample .env.local
```

**Option B : Créer manuellement**

Créer `.env.local` avec :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

**Utiliser les MÊMES clés que le projet principal si vous voulez partager la base de données.**

### 4. Créer les tables

```bash
npx prisma db push
npx prisma generate
```

Vous devriez voir :
```
✔ Your database is now in sync with your Prisma schema
✔ Generated Prisma Client
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application démarre sur **http://localhost:3001** (port différent du projet principal)

### 6. Se connecter

1. Ouvrez http://localhost:3001
2. Cliquez sur "Se connecter"
3. Connectez-vous (même compte que le projet principal)
4. 2 cours d'exemple seront créés automatiquement

## Différences avec le projet principal

| Aspect | Projet principal | Demo-2 |
|--------|------------------|--------|
| Port | 3000 | **3001** |
| ID User | `id` généré + `clerkId` séparé | `id` = ClerkId directement |
| Tables | 1 (User) | 2 (User + Course) |
| Relation | Aucune | User ↔ Courses |
| Attributs User | 7 champs | **11 champs** |

## Schéma de la base de données

### Table users (enrichie)

```prisma
model User {
  id          String   @id               // = clerkUser.id
  email       String   @unique
  firstName   String?
  lastName    String?
  imageUrl    String?
  role        String   @default("user")  // NOUVEAU
  bio         String?                    // NOUVEAU
  phoneNumber String?                    // NOUVEAU
  website     String?                    // NOUVEAU
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  courses     Course[]                   // Relation
}
```

### Table courses (nouvelle)

```prisma
model Course {
  id           String   @id @default(cuid())
  title        String
  description  String?
  category     String
  level        String   @default("beginner")
  price        Decimal  @default(0)
  published    Boolean  @default(false)
  instructorId String                    // FK vers User.id
  instructor   User     @relation(...)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Utilisation

### Voir vos données

```bash
npx prisma studio
```

Ouvre une interface graphique sur http://localhost:5555

### Créer un cours manuellement

1. Lancer Prisma Studio : `npx prisma studio`
2. Aller dans la table "courses"
3. Cliquer "Add record"
4. Remplir les champs :
   - `title`: "Mon nouveau cours"
   - `category`: "programming"
   - `level`: "beginner"
   - `price`: 0
   - `published`: true
   - `instructorId`: *copier votre User.id depuis la table users*
5. Sauvegarder
6. Recharger la page web

### Modifier votre profil

1. Lancer Prisma Studio
2. Aller dans la table "users"
3. Cliquer sur votre utilisateur
4. Modifier les champs :
   - `role`: "instructor" ou "admin"
   - `bio`: "Développeur passionné"
   - `phoneNumber`: "+33 6 12 34 56 78"
   - `website`: "https://monsite.com"
5. Sauvegarder
6. Recharger la page web

## Réinitialiser la base de données

**ATTENTION : Cela supprime TOUTES les données !**

```bash
npx prisma db push --force-reset
```

## Résolution de problèmes

### Erreur "table users does not exist"

```bash
npx prisma db push
npx prisma generate
```

### Port 3001 déjà utilisé

Modifier le port dans `package.json` :
```json
"dev": "next dev -p 3002"
```

### Les cours d'exemple ne se créent pas

1. Vérifier que la connexion à Supabase fonctionne
2. Relancer l'application
3. Se déconnecter puis se reconnecter

### Conflit avec le projet principal

Les deux projets peuvent tourner en même temps car ils utilisent des ports différents :
- Projet principal : http://localhost:3000
- Demo-2 : http://localhost:3001

Ils peuvent partager la même base de données Supabase car les noms de tables sont différents ou utiliser des bases différentes.

## Architecture du code

```
demo-2/
├── app/
│   ├── layout.tsx          # ClerkProvider
│   ├── page.tsx            # Page principale avec Users + Courses
│   └── globals.css         # Styles
├── lib/
│   ├── prisma.ts           # Client Prisma
│   └── sync-user.ts        # Sync avec ID = ClerkId + création cours
├── prisma/
│   └── schema.prisma       # User + Course avec relation
├── middleware.ts           # Middleware Clerk
└── package.json            # Port 3001
```

## Points clés à comprendre

### 1. ID = ClerkId

```typescript
// Dans lib/sync-user.ts
const user = await prisma.user.upsert({
  where: { id: clerkUser.id },  // Pas de "clerkId"
  create: { id: clerkUser.id }  // ID fourni manuellement
})
```

### 2. Relation User ↔ Courses

```typescript
// Un utilisateur avec ses cours
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { courses: true }  // Charge les cours
})

// Les cours d'un utilisateur
user.courses.forEach(course => {
  console.log(course.title)
})
```

### 3. Cours d'exemple automatiques

```typescript
// Dans lib/sync-user.ts
export async function createSampleCourses(userId: string) {
  // Crée 2 cours si l'utilisateur n'en a pas
  if (existingCourses === 0) {
    await prisma.course.createMany({ data: [...] })
  }
}
```

## Prochaines étapes

Une fois que tout fonctionne, vous pouvez :

1. **Ajouter d'autres tables** : Enrollments, Reviews, Lessons
2. **Créer une page de cours** : `/courses/[id]`
3. **Ajouter un formulaire** : Créer des cours depuis l'interface
4. **Ajouter des filtres** : Par catégorie, niveau, prix
5. **Implémenter la recherche** : Rechercher des cours

## Commandes utiles

```bash
# Développement
npm run dev

# Interface graphique DB
npx prisma studio

# Synchroniser le schéma
npx prisma db push

# Générer le client
npx prisma generate

# Voir les logs Prisma
DEBUG=prisma:* npm run dev
```

---

**Bon développement !**

