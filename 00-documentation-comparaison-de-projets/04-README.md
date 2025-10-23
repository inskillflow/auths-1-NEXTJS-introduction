# 🔄 Clerk + Prisma/Supabase - Synchronisation Minimale

Projet minimal Next.js démontrant la synchronisation entre Clerk (authentification) et Prisma/Supabase (base de données).

---

## 📚 Documentation Complète

### 🆕 Nouveau débutant ? Commencez ici !

👉 **[Guide Complet pour Débutants](documentation/05-GUIDE_COMPLET_DEBUTANT.md)** - 30 min, tout expliqué de A à Z

👉 **[Checklist d'Installation](documentation/06-CHECKLIST_INSTALLATION.md)** - Suivez étape par étape avec cases à cocher

### ⚡ Développeur expérimenté ?

👉 **[Démarrage Rapide](documentation/03-QUICK_START.md)** - 5 min, pour démarrer rapidement

### 📖 Navigation complète

👉 **[Index de la documentation](documentation/00-INDEX.md)** - Accédez à tous les guides

---

## 📋 Comparaison des méthodes

### 🎯 Méthode Upsert (ce projet)

**Avantages :**
- ✅ **Plus simple** à mettre en place
- ✅ Pas de configuration de webhooks
- ✅ Moins de code
- ✅ Parfait pour prototypes et projets simples
- ✅ Synchronisation automatique à chaque connexion

**Inconvénients :**
- ❌ Synchronisation uniquement quand l'utilisateur se connecte
- ❌ Pas de synchronisation en temps réel des changements de profil
- ❌ Léger délai à chaque chargement de page

**Quand l'utiliser :** Projets MVP, prototypes, applications simples

### 🎣 Méthode Webhooks

**Avantages :**
- ✅ Synchronisation en temps réel
- ✅ Synchronise tous les événements (création, modification, suppression)
- ✅ Plus robuste pour la production

**Inconvénients :**
- ❌ Configuration plus complexe
- ❌ Nécessite un endpoint public (ngrok en développement)
- ❌ Gestion des signatures de sécurité
- ❌ Plus de code à maintenir

**Quand l'utiliser :** Applications en production avec besoins de synchronisation temps réel

## Projets de démo

Ce repository contient **cinq projets de démonstration** :

### Demo-0 (dossier `demo-0/`) 🆕
- **Auth** : Clerk (SaaS)
- **Sync** : **Webhook (automatique)**
- **Tables** : 1 (User)
- **Recommandé** : Production / Sync temps réel
- **Port** : 2999
- **Code** : Aucun syncUser() !

**[Voir le README de Demo-0](demo-0/README.md)**

### Projet principal (racine)
- **Auth** : Clerk (SaaS)
- **Sync** : Upsert (manuel)
- **Tables** : 1 (User)
- **Recommandé** : MVP rapide / Débutants
- **Port** : 3000

### Demo-2 (dossier `demo-2/`)
- **Auth** : Clerk (SaaS)
- **Approche** : ID = ClerkId directement
- **Tables** : 2 (User + Course avec relation)
- **Recommandé** : Apprendre les relations Prisma avec Clerk
- **Port** : 3001

**[Voir le README de Demo-2](demo-2/README.md)**

### Demo-3 (dossier `demo-3/`)
- **Auth** : NextAuth.js (Open-source)
- **Approche** : Schéma NextAuth standard
- **Tables** : 5 (4 NextAuth + User personnalisé)
- **Recommandé** : Alternative gratuite à Clerk
- **Port** : 3002
- **100% gratuit** et contrôle total

**[Voir le README de Demo-3](demo-3/README.md)**

### Demo-4 (dossier `demo-4/`) 🆕🔥
- **Auth** : NextAuth.js (Open-source)
- **Approche** : Architecture complète avec entités enrichies
- **Tables** : 6 (4 NextAuth + User enrichi + Course)
- **Recommandé** : Projet complet / Architecture avancée
- **Port** : 3003
- **100% gratuit** + Relations + CRUD complet

**[Voir le README de Demo-4](demo-4/README.md)**

### Comparaison rapide

| Aspect | **Demo-0** | Principal | Demo-2 | Demo-3 | Demo-4 |
|--------|------------|-----------|---------|---------|---------|
| Auth | Clerk | Clerk | Clerk | NextAuth | NextAuth |
| Sync | **Webhook** | Upsert | Upsert | Auto | Auto |
| Tables | 1 | 1 | 2 | 5 | 6 |
| Relations | ❌ | ❌ | ✅ | ❌ | ✅ |
| Coût | $0→$225 | $0→$225 | $0→$225 | **$0** | **$0** |
| Temps réel | ✅ | ❌ | ❌ | ✅ | ✅ |
| Code sync | **Aucun** | syncUser() | syncUser() | Aucun | Aucun |
| Complexité | ⭐⭐ | ⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ |

**[Comparaison complète des 5 projets](COMPARAISON_COMPLETE_3_PROJETS.md)**

---

## Documentation comparative

### Guides complets

- **[COMPARAISON_ARCHITECTURES_AUTH.md](COMPARAISON_ARCHITECTURES_AUTH.md)** - Comparaison professionnelle des 5 architectures (SANS EMOJIS)
- **[NOMS_PROJETS_PROFESSIONNELS.md](NOMS_PROJETS_PROFESSIONNELS.md)** - Noms professionnels et configuration port 3000
- **[COMPARAISON_COMPLETE_3_PROJETS.md](COMPARAISON_COMPLETE_3_PROJETS.md)** - Comparaison détaillée : synchronisation, config, simplicité, coût, tout !
- **[GUIDE_PROJETS.md](GUIDE_PROJETS.md)** - Guide complet des projets
- **[documentation/07-NEXTAUTH_ALTERNATIVE.md](documentation/07-NEXTAUTH_ALTERNATIVE.md)** - Clerk vs NextAuth approfondi

---

## Documentation complète

Ce projet contient une documentation extensive pour vous guider :

### Pour le Projet Principal

- **[documentation/00-INDEX.md](documentation/00-INDEX.md)** - Index et navigation
- **[documentation/05-GUIDE_COMPLET_DEBUTANT.md](documentation/05-GUIDE_COMPLET_DEBUTANT.md)** - Guide complet A-Z (débutants)
- **[documentation/03-QUICK_START.md](documentation/03-QUICK_START.md)** - Démarrage rapide (5 min)
- **[documentation/06-CHECKLIST_INSTALLATION.md](documentation/06-CHECKLIST_INSTALLATION.md)** - Checklist étape par étape
- **[documentation/02-COMPARISON.md](documentation/02-COMPARISON.md)** - Upsert vs Webhooks
- **[documentation/04-ARCHITECTURE.md](documentation/04-ARCHITECTURE.md)** - Architecture technique

### Pour Demo-0

- **[demo-0/README.md](demo-0/README.md)** - Documentation complète Demo-0 (Webhooks)
- **[demo-0/00-GUIDE_WEBHOOK.md](demo-0/00-GUIDE_WEBHOOK.md)** - Guide complet webhooks

### Pour Demo-2

- **[demo-2/README.md](demo-2/README.md)** - Documentation complète Demo-2

### Pour Demo-3

- **[demo-3/README.md](demo-3/README.md)** - Documentation complète Demo-3
- **[demo-3/00-INSTALLATION.md](demo-3/00-INSTALLATION.md)** - Installation étape par étape
- **[demo-3/MEILLEURES_PRATIQUES.md](demo-3/MEILLEURES_PRATIQUES.md)** - Best practices NextAuth

### Pour Demo-4

- **[demo-4/README.md](demo-4/README.md)** - Documentation complète Demo-4 (le plus avancé)

### Guides généraux

- **[GUIDE_PROJETS.md](GUIDE_PROJETS.md)** - Guide complet des 5 projets
- **[COMPARAISON_COMPLETE_3_PROJETS.md](COMPARAISON_COMPLETE_3_PROJETS.md)** - Comparaison détaillée (sync, config, coût, tout)
- **[documentation/02-COMPARISON.md](documentation/02-COMPARISON.md)** - Upsert vs Webhooks approfondi
- **[NAVIGATION_PROJET.md](NAVIGATION_PROJET.md)** - Navigation entre les projets
- **[SCHEMA_COMPARISON.md](SCHEMA_COMPARISON.md)** - Comparaison des schémas Prisma
- **[documentation/07-NEXTAUTH_ALTERNATIVE.md](documentation/07-NEXTAUTH_ALTERNATIVE.md)** - NextAuth vs Clerk approfondi

---

## 🚀 Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Configurer Clerk

1. Créer un compte sur [Clerk](https://dashboard.clerk.com)
2. Créer une nouvelle application
3. Copier vos clés API

### 3. Configurer Supabase

1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer votre URL de connexion PostgreSQL :
   - Aller dans Settings → Database
   - Copier la "Connection String" (mode Direct)

### 4. Variables d'environnement

Copier le fichier d'exemple :

```bash
cp env.sample .env.local
```

Remplir `.env.local` avec vos vraies valeurs :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### 5. Initialiser la base de données

```bash
# Créer les tables dans Supabase
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

### 6. Lancer le projet

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📖 Comment ça marche ?

### Flux de synchronisation (Upsert)

1. **Utilisateur se connecte** via Clerk
2. **Page charge** → fonction `syncUser()` s'exécute
3. **Prisma upsert** :
   - Si l'utilisateur n'existe pas → **créé** dans Supabase
   - Si l'utilisateur existe → **mis à jour** avec les dernières données
4. **Affichage** des données synchronisées

### Code clé

**Synchronisation (`lib/sync-user.ts`)** :
```typescript
export async function syncUser() {
  const clerkUser = await currentUser()
  
  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { /* données mises à jour */ },
    create: { /* nouvelles données */ },
  })
  
  return user
}
```

**Utilisation dans une page** :
```typescript
export default async function Page() {
  const syncedUser = await syncUser()
  // Afficher syncedUser
}
```

## 🔧 Commandes utiles

```bash
# Développement
npm run dev

# Voir la base de données (interface graphique)
npx prisma studio

# Synchroniser le schéma avec Supabase
npx prisma db push

# Voir les migrations
npx prisma migrate dev
```

## 📊 Structure du projet

```
.
├── app/
│   ├── layout.tsx          # Layout avec ClerkProvider
│   ├── page.tsx            # Page principale avec sync
│   └── globals.css         # Styles
├── lib/
│   ├── prisma.ts           # Client Prisma singleton
│   └── sync-user.ts        # Fonction de synchronisation
├── prisma/
│   └── schema.prisma       # Schéma de la base de données
├── middleware.ts           # Middleware Clerk
└── .env                    # Variables d'environnement
```

## 🎓 Passer aux Webhooks ?

Si vous voulez upgrader vers les webhooks plus tard :

1. Créer une route API `/api/webhooks/clerk`
2. Vérifier la signature avec `svix`
3. Gérer les événements `user.created`, `user.updated`, `user.deleted`
4. Configurer l'URL du webhook dans Clerk Dashboard

Exemple de code webhook :
```typescript
// app/api/webhooks/clerk/route.ts
export async function POST(req: Request) {
  const payload = await req.json()
  const event = payload.type

  if (event === 'user.created') {
    await prisma.user.create({ /* ... */ })
  }
  // etc.
}
```

## 📝 Notes

- **Développement** : La méthode upsert est idéale
- **Production** : Considérer les webhooks pour une sync complète
- **Sécurité** : Ne jamais commiter le fichier `.env`

## 🆘 Problèmes courants

**Erreur de connexion Prisma** :
- Vérifier que `DATABASE_URL` est correcte
- Vérifier que votre IP est autorisée dans Supabase (Settings → Database → Connection Pooling)

**Utilisateur ne se synchronise pas** :
- Vérifier que les clés Clerk sont bonnes
- Vérifier que `npx prisma db push` a été exécuté

## 📚 Ressources

- [Documentation Clerk](https://clerk.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

