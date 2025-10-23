# Demo 2 : Clerk + Prisma avec Relations (ID = ClerkId)

Ce projet démontre :
- **ID = ClerkId directement** (pas de @default(cuid()))
- **Deux tables avec relation** : Users et Courses
- **Attributs enrichis** : role, bio, phoneNumber, etc.
- **Synchronisation Clerk → Supabase**

## Différences avec le projet principal

### 1. Schéma ID simplifié

**Projet principal :**
```prisma
model User {
  id      String @id @default(cuid())  // ID généré
  clerkId String @unique                // ID Clerk séparé
}
```

**Demo-2 (ce projet) :**
```prisma
model User {
  id  String @id  // ID = clerkUser.id directement, pas de @default
}
```

### 2. Tables avec relations

- **User** : utilisateur avec profil enrichi
- **Course** : cours créés par les utilisateurs
- Relation : Un utilisateur peut avoir plusieurs cours

## Installation

### 1. Installer les dépendances

```bash
cd demo-2
npm install
```

### 2. Configurer .env.local

Créer `.env.local` à la racine de `demo-2/` :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### 3. Créer les tables

```bash
npx prisma db push
npx prisma generate
```

### 4. Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3001](http://localhost:3001)

**Note :** Ce projet tourne sur le port 3001 pour ne pas entrer en conflit avec le projet principal.

## Schéma de la base de données

### Table : users

| Colonne | Type | Description |
|---------|------|-------------|
| id | String (PK) | ID Clerk directement (ex: user_2abc...) |
| email | String (UNIQUE) | Email de l'utilisateur |
| firstName | String? | Prénom |
| lastName | String? | Nom |
| imageUrl | String? | URL de l'avatar |
| role | String | Rôle (user/admin/instructor) |
| bio | String? | Biographie |
| phoneNumber | String? | Numéro de téléphone |
| website | String? | Site web personnel |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Table : courses

| Colonne | Type | Description |
|---------|------|-------------|
| id | String (PK) | ID unique du cours |
| title | String | Titre du cours |
| description | String? | Description |
| category | String | Catégorie |
| level | String | Niveau (beginner/intermediate/advanced) |
| price | Decimal | Prix (peut être 0 pour gratuit) |
| published | Boolean | Publié ou brouillon |
| instructorId | String (FK) | ID de l'instructeur (User) |
| createdAt | DateTime | Date de création |
| updatedAt | DateTime | Date de mise à jour |

### Relation

```
User (1) ----< (N) Course
Un utilisateur peut créer plusieurs cours
```

## Exemples d'utilisation

### Créer un cours après connexion

L'application affiche automatiquement vos cours après connexion. Vous pouvez en créer via Prisma Studio :

```bash
npx prisma studio
```

Puis :
1. Aller sur "courses"
2. Ajouter un enregistrement
3. Remplir les champs (instructorId = votre user.id)

### Données d'exemple

Après connexion, l'app crée automatiquement 2 cours d'exemple pour vous montrer la relation.

## Différences techniques

### Synchronisation (lib/sync-user.ts)

```typescript
// Utilise directement l'ID Clerk comme clé primaire
const user = await prisma.user.upsert({
  where: { id: clerkUser.id },  // Pas de "clerkId"
  create: { 
    id: clerkUser.id,  // ID fourni manuellement
    email: clerkUser.email,
    // ...
  }
})
```

### Avantages

- Plus simple (un champ en moins)
- Cohérence directe avec Clerk
- Parfait pour des prototypes

### Inconvénients

- IDs longs partout (user_2abc...)
- Couplage fort avec Clerk
- Plus difficile de migrer vers un autre provider

## Commandes utiles

```bash
# Voir la base de données
npx prisma studio

# Réinitialiser la DB
npx prisma db push --force-reset

# Créer une migration
npx prisma migrate dev --name add_courses
```

## Différences avec le projet principal

| Aspect | Projet principal | Demo-2 |
|--------|------------------|--------|
| ID User | Généré (cuid) | = ClerkId |
| Tables | 1 (User) | 2 (User + Course) |
| Attributs User | 7 champs | 11 champs |
| Port | 3000 | 3001 |
| Relations | Aucune | User ↔ Courses |

## Structure des fichiers

```
demo-2/
├── app/
│   ├── layout.tsx          # Layout avec Clerk
│   ├── page.tsx            # Page avec Users + Courses
│   └── globals.css         # Styles
├── lib/
│   ├── prisma.ts           # Client Prisma
│   └── sync-user.ts        # Sync avec ID = ClerkId
├── prisma/
│   └── schema.prisma       # Schéma User + Course
├── middleware.ts           # Middleware Clerk
├── package.json
├── .env.sample
└── README.md
```

## Pour aller plus loin

- Ajouter une page de création de cours
- Ajouter des enrollments (inscriptions)
- Ajouter des reviews (avis)
- Créer une vraie plateforme de cours en ligne

---

**Bon développement !**

