# Index - Documentation Demo-2

Tous les documents du projet Demo-2 organisés par besoin.

---

## Par où commencer ?

### Vous êtes pressé ? (5 min)
→ **[MEMO_RAPIDE.md](MEMO_RAPIDE.md)**
- Commandes essentielles
- Installation express
- Dépannage rapide

### Vous voulez tout comprendre ? (30 min)
→ **[00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md)**
- Guide étape par étape complet
- Explications détaillées
- Exemples de code
- Section dépannage complète

### Vous voulez une vue d'ensemble ? (10 min)
→ **[README.md](README.md)**
- Présentation du projet
- Comparaison avec le projet principal
- Schéma de la base de données
- Exemples d'utilisation

---

## Documentation disponible

### Guides d'installation

| Fichier | Description | Durée |
|---------|-------------|-------|
| **[MEMO_RAPIDE.md](MEMO_RAPIDE.md)** | Installation ultra-rapide | 2 min |
| **[GUIDE_INSTALLATION.md](GUIDE_INSTALLATION.md)** | Installation détaillée avec troubleshooting | 15 min |
| **[00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md)** | Guide complet A-Z | 30 min |

### Configuration

| Fichier | Description |
|---------|-------------|
| **[ENV_TEMPLATE.md](ENV_TEMPLATE.md)** | Configuration .env.local expliquée |
| **[.env.sample](.env.sample)** | Template des variables d'environnement |

### Référence

| Fichier | Description |
|---------|-------------|
| **[README.md](README.md)** | Documentation principale du projet |
| **[prisma/schema.prisma](prisma/schema.prisma)** | Schéma de la base de données |

---

## Navigation par besoin

### Je veux installer Demo-2

**Débutant total ?**
1. Lire : [00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md)
2. Suivre : [GUIDE_INSTALLATION.md](GUIDE_INSTALLATION.md)

**Développeur expérimenté ?**
1. Lire : [MEMO_RAPIDE.md](MEMO_RAPIDE.md)
2. Exécuter les commandes

### Je veux comprendre les différences

→ Section "Différences avec le projet principal" dans [README.md](README.md)

→ Tableau comparatif dans [00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md#différences-avec-le-projet-principal)

### Je veux créer des cours

→ Section "Créer des cours manuellement" dans [00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md#créer-des-cours-manuellement)

→ Section "Exemples d'utilisation" dans [README.md](README.md)

### Je veux modifier mon profil

→ Section "Modifier votre profil" dans [00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md#modifier-votre-profil)

### Je veux comprendre le schéma

→ Section "Schéma de la base de données" dans [README.md](README.md)

→ Section "Comprendre le schéma" dans [00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md#comprendre-le-schéma)

→ Voir le fichier [prisma/schema.prisma](prisma/schema.prisma)

### Je veux comprendre le code

→ Section "Comprendre le code" dans [00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md#comprendre-le-code)

→ Lire les fichiers commentés :
- [lib/sync-user.ts](lib/sync-user.ts)
- [app/page.tsx](app/page.tsx)

### J'ai un problème

→ Section "Dépannage" dans [00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md#dépannage)

→ Section "Dépannage express" dans [MEMO_RAPIDE.md](MEMO_RAPIDE.md#dépannage-express)

→ Section "Troubleshooting" dans [GUIDE_INSTALLATION.md](GUIDE_INSTALLATION.md#résolution-de-problèmes)

### Je veux aller plus loin

→ Section "Aller plus loin" dans [00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md#aller-plus-loin)

→ Section "Pour aller plus loin" dans [README.md](README.md)

---

## Parcours recommandés

### Parcours A : Débutant (30-40 min)

1. **[README.md](README.md)** - Vue d'ensemble (5 min)
2. **[00-GUIDE_COMPLET_DEMO2.md](00-GUIDE_COMPLET_DEMO2.md)** - Tout suivre (30 min)
3. **Tester l'application**
4. **Créer des cours**
5. **Modifier le profil**

### Parcours B : Développeur expérimenté (10 min)

1. **[MEMO_RAPIDE.md](MEMO_RAPIDE.md)** - Commandes (2 min)
2. **Installer et lancer** (5 min)
3. **[README.md](README.md)** - Comprendre les différences (3 min)
4. **Tester**

### Parcours C : J'ai fait le projet principal (5 min)

1. **[README.md](README.md)** - Section "Différences" (2 min)
2. **[MEMO_RAPIDE.md](MEMO_RAPIDE.md)** - Installation (3 min)
3. **Comparer les deux projets**

---

## Structure des fichiers du projet

```
demo-2/
│
├── Documentation/
│   ├── INDEX.md                     # Vous êtes ici
│   ├── 00-GUIDE_COMPLET_DEMO2.md   # Guide complet
│   ├── README.md                    # Documentation principale
│   ├── GUIDE_INSTALLATION.md        # Installation détaillée
│   ├── MEMO_RAPIDE.md              # Commandes rapides
│   └── ENV_TEMPLATE.md             # Configuration .env
│
├── Code source/
│   ├── app/                         # Pages Next.js
│   ├── lib/                         # Logique métier
│   ├── prisma/                      # Schéma DB
│   └── middleware.ts                # Clerk middleware
│
└── Configuration/
    ├── package.json
    ├── tsconfig.json
    └── .env.sample                  # Template
```

---

## Commandes essentielles

```bash
# Installation
cd demo-2
npm install
cp ../.env.local .env.local
npx prisma db push
npx prisma generate

# Développement
npm run dev                # Démarre sur :3001
npx prisma studio         # Interface DB :5555

# Maintenance
npx prisma db push        # Sync schéma
npx prisma generate       # Génère le client
```

---

## Liens utiles

### Documentation externe

- **Clerk** : https://clerk.com/docs
- **Prisma** : https://www.prisma.io/docs
- **Prisma Relations** : https://www.prisma.io/docs/concepts/components/prisma-schema/relations
- **Supabase** : https://supabase.com/docs
- **Next.js** : https://nextjs.org/docs

### Dashboards

- **Application** : http://localhost:3001
- **Prisma Studio** : http://localhost:5555 (après `npx prisma studio`)
- **Supabase** : https://supabase.com/dashboard
- **Clerk** : https://dashboard.clerk.com

---

## Checklist d'installation

- [ ] Node.js installé
- [ ] Projet principal installé
- [ ] Dans le dossier demo-2/
- [ ] `npm install` exécuté
- [ ] `.env.local` créé avec les bonnes valeurs
- [ ] `npx prisma db push` exécuté
- [ ] `npx prisma generate` exécuté
- [ ] `npm run dev` démarre sans erreur
- [ ] http://localhost:3001 accessible
- [ ] Connexion réussie
- [ ] 2 cours d'exemple créés
- [ ] Prisma Studio fonctionne

---

## Questions fréquentes

**Q : Puis-je utiliser la même DB que le projet principal ?**
R : Oui, mais les tables seront différentes. Mieux vaut utiliser une DB séparée.

**Q : Pourquoi le port 3001 et pas 3000 ?**
R : Pour pouvoir lancer les deux projets en même temps sans conflit.

**Q : Quelle approche est meilleure ?**
R : Projet principal (ID séparé) pour la production. Demo-2 (ID = ClerkId) pour apprendre.

**Q : Les cours d'exemple sont obligatoires ?**
R : Non, ils sont créés automatiquement pour la démo. Vous pouvez les supprimer.

**Q : Comment supprimer les cours d'exemple ?**
R : Via Prisma Studio, table "courses", sélectionner et supprimer.

**Q : Puis-je ajouter d'autres tables ?**
R : Oui ! Voir la section "Aller plus loin" dans le guide complet.

---

## Aide et support

Si vous êtes bloqué :

1. Consultez la section Dépannage du document approprié
2. Vérifiez vos variables d'environnement
3. Consultez les logs du terminal
4. Vérifiez Prisma Studio pour voir vos données
5. Comparez avec le projet principal

---

**Bon développement !**

