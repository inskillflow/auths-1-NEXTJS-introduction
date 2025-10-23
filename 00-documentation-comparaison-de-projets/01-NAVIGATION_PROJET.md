# Navigation du Projet - Clerk + Prisma/Supabase

Ce repository contient **2 projets de démonstration** complets.

---

## Structure du repository

```
02-next-match-clerck-3/
│
├── Projet Principal (racine)
│   ├── app/
│   ├── lib/
│   ├── prisma/
│   ├── documentation/       # Documentation complète
│   └── .env.local           # À créer
│
└── demo-2/                  # Projet Demo 2
    ├── app/
    ├── lib/
    ├── prisma/
    ├── 00-GUIDE_COMPLET_DEMO2.md
    └── .env.local           # À créer
```

---

## Projet 1 : Principal (Racine)

### Caractéristiques
- **Approche** : ID séparé + clerkId
- **Tables** : User uniquement
- **Port** : 3000
- **Recommandé pour** : Production

### Documentation

**Débutant** :
1. [documentation/05-GUIDE_COMPLET_DEBUTANT.md](documentation/05-GUIDE_COMPLET_DEBUTANT.md) - Guide complet A-Z (30 min)
2. [documentation/06-CHECKLIST_INSTALLATION.md](documentation/06-CHECKLIST_INSTALLATION.md) - Checklist

**Développeur expérimenté** :
- [documentation/03-QUICK_START.md](documentation/03-QUICK_START.md) - Démarrage rapide (5 min)

**Tous** :
- [documentation/00-INDEX.md](documentation/00-INDEX.md) - Navigation de la documentation
- [documentation/02-COMPARISON.md](documentation/02-COMPARISON.md) - Upsert vs Webhooks
- [documentation/04-ARCHITECTURE.md](documentation/04-ARCHITECTURE.md) - Architecture du projet
- [README.md](README.md) - Documentation principale

### Installation rapide

```bash
# Dans la racine du projet
npm install
cp env.sample .env.local  # Puis éditer avec vos clés
npx prisma db push
npx prisma generate
npm run dev
```

Ouvrir : http://localhost:3000

---

## Projet 2 : Demo-2 (Dossier demo-2/)

### Caractéristiques
- **Approche** : ID = ClerkId directement
- **Tables** : User + Course (avec relation)
- **Port** : 3001
- **Recommandé pour** : Apprentissage des relations Prisma

### Documentation

**Tout public** :
1. [demo-2/00-GUIDE_COMPLET_DEMO2.md](demo-2/00-GUIDE_COMPLET_DEMO2.md) - Guide complet étape par étape (30 min)

**Accès rapide** :
- [demo-2/MEMO_RAPIDE.md](demo-2/MEMO_RAPIDE.md) - Installation en 5 minutes
- [demo-2/INDEX.md](demo-2/INDEX.md) - Navigation de la documentation
- [demo-2/README.md](demo-2/README.md) - Présentation du projet
- [demo-2/GUIDE_INSTALLATION.md](demo-2/GUIDE_INSTALLATION.md) - Installation détaillée

### Installation rapide

```bash
# Depuis la racine, aller dans demo-2
cd demo-2
npm install
cp ../.env.local .env.local  # Réutilise les clés du projet principal
npx prisma db push
npx prisma generate
npm run dev
```

Ouvrir : http://localhost:3001

---

## Comparaison des deux projets

| Aspect | Projet Principal | Demo-2 |
|--------|------------------|---------|
| **Dossier** | Racine | `demo-2/` |
| **Port** | 3000 | 3001 |
| **Approche ID** | id généré + clerkId | id = ClerkId |
| **Tables** | 1 (User) | 2 (User + Course) |
| **Attributs User** | 7 champs | 11 champs (role, bio, phone, website) |
| **Relations** | Aucune | User ↔ Courses (1-N) |
| **Cours d'exemple** | Non | Oui (2 créés auto) |
| **Recommandé pour** | **Production** | **Apprentissage** |
| **Documentation** | documentation/ | demo-2/ |

---

## Par où commencer ?

### Vous débutez complètement ?

1. **Commencez par le Projet Principal**
   - Suivez [documentation/05-GUIDE_COMPLET_DEBUTANT.md](documentation/05-GUIDE_COMPLET_DEBUTANT.md)
   - Installez et testez le projet principal
   - Comprenez les bases

2. **Puis passez à Demo-2**
   - Suivez [demo-2/00-GUIDE_COMPLET_DEMO2.md](demo-2/00-GUIDE_COMPLET_DEMO2.md)
   - Apprenez les relations Prisma
   - Comparez les deux approches

### Vous êtes développeur expérimenté ?

1. **Lisez les comparaisons**
   - [SCHEMA_COMPARISON.md](SCHEMA_COMPARISON.md) - Comparaison des schémas
   - [documentation/02-COMPARISON.md](documentation/02-COMPARISON.md) - Upsert vs Webhooks

2. **Installez les deux projets rapidement**
   - Projet principal : [documentation/03-QUICK_START.md](documentation/03-QUICK_START.md)
   - Demo-2 : [demo-2/MEMO_RAPIDE.md](demo-2/MEMO_RAPIDE.md)

3. **Testez et comparez**

---

## Objectifs pédagogiques

### Projet Principal

Apprenez :
- Authentification avec Clerk
- Synchronisation Clerk ↔ Prisma
- Base de données avec Supabase
- Next.js 14 avec App Router
- Architecture découplée (ID séparé)

### Demo-2

Apprenez en plus :
- Relations Prisma (1-N)
- Approche alternative (ID = ClerkId)
- Gestion d'attributs enrichis
- Modélisation de données complexes
- Prisma Studio

---

## Prérequis

Pour les deux projets :
- Node.js v18+ installé
- Un compte Clerk (gratuit)
- Un projet Supabase (gratuit)
- Un éditeur de code (VS Code recommandé)
- Un terminal

---

## Installation globale

### Option 1 : Tout installer

```bash
# 1. Projet principal
npm install
cp env.sample .env.local
# Éditer .env.local avec vos clés
npx prisma db push
npx prisma generate

# 2. Demo-2
cd demo-2
npm install
cp ../.env.local .env.local
npx prisma db push
npx prisma generate
cd ..

# 3. Lancer les deux (dans des terminaux séparés)
# Terminal 1
npm run dev

# Terminal 2
cd demo-2
npm run dev
```

### Option 2 : Installer uniquement ce dont vous avez besoin

**Pour apprendre les bases** : Projet principal uniquement

**Pour apprendre les relations** : Les deux projets

---

## Commandes utiles

### Projet Principal

```bash
# Développement
npm run dev                    # http://localhost:3000
npx prisma studio             # http://localhost:5555

# Maintenance
npx prisma db push
npx prisma generate
```

### Demo-2

```bash
cd demo-2
npm run dev                    # http://localhost:3001
npx prisma studio             # http://localhost:5555

# Maintenance
npx prisma db push
npx prisma generate
```

---

## Documentation complète

### Index des documentations

**Projet Principal** :
- [documentation/00-INDEX.md](documentation/00-INDEX.md) - Navigation complète
- [documentation/05-GUIDE_COMPLET_DEBUTANT.md](documentation/05-GUIDE_COMPLET_DEBUTANT.md) - Guide principal
- [documentation/03-QUICK_START.md](documentation/03-QUICK_START.md) - Démarrage rapide
- [documentation/02-COMPARISON.md](documentation/02-COMPARISON.md) - Comparaison méthodes
- [documentation/04-ARCHITECTURE.md](documentation/04-ARCHITECTURE.md) - Architecture

**Demo-2** :
- [demo-2/INDEX.md](demo-2/INDEX.md) - Navigation complète
- [demo-2/00-GUIDE_COMPLET_DEMO2.md](demo-2/00-GUIDE_COMPLET_DEMO2.md) - Guide principal
- [demo-2/MEMO_RAPIDE.md](demo-2/MEMO_RAPIDE.md) - Installation rapide
- [demo-2/README.md](demo-2/README.md) - Présentation

**Comparaisons** :
- [SCHEMA_COMPARISON.md](SCHEMA_COMPARISON.md) - Schémas Prisma

---

## Ressources externes

- **Clerk** : https://clerk.com/docs
- **Prisma** : https://www.prisma.io/docs
- **Supabase** : https://supabase.com/docs
- **Next.js** : https://nextjs.org/docs

---

## Aide

### Projet Principal
Consultez : [documentation/05-GUIDE_COMPLET_DEBUTANT.md#dépannage](documentation/05-GUIDE_COMPLET_DEBUTANT.md#dépannage)

### Demo-2
Consultez : [demo-2/00-GUIDE_COMPLET_DEMO2.md#dépannage](demo-2/00-GUIDE_COMPLET_DEMO2.md#dépannage)

---

## Conclusion

**Deux projets, deux approches, un objectif** : Maîtriser l'authentification et les bases de données avec Next.js.

**Commencez maintenant** :
- Débutant → [documentation/05-GUIDE_COMPLET_DEBUTANT.md](documentation/05-GUIDE_COMPLET_DEBUTANT.md)
- Expérimenté → [documentation/03-QUICK_START.md](documentation/03-QUICK_START.md)

**Bon apprentissage !**

