# Configuration .env.local pour Demo-2

## Fichier à créer : `.env.local`

Créez un fichier `.env.local` à la racine du dossier `demo-2/` avec ce contenu :

```env
# ============================================
# CLERK AUTHENTICATION
# ============================================

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx


# ============================================
# SUPABASE DATABASE
# ============================================

DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

## Option 1 : Partager la DB avec le projet principal

Si vous voulez que Demo-2 utilise la même base de données que le projet principal :

**Copiez simplement le `.env.local` du projet principal vers `demo-2/`**

```bash
# Depuis la racine du repository
cp .env.local demo-2/.env.local
```

Les deux projets partageront la même base Supabase mais avec des tables différentes :
- Projet principal : table `users` (avec clerkId)
- Demo-2 : tables `users` (avec id = clerkId) + `courses`

**ATTENTION** : Les deux tables `users` sont différentes ! Si vous faites ça, utilisez une base de données distincte pour éviter les conflits.

## Option 2 : Base de données séparée (recommandé)

### 1. Créer un nouveau projet Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Créez un nouveau projet : "clerk-demo-2"
3. Notez le mot de passe

### 2. Récupérer l'URL

1. Settings → Database
2. Connection String → URI
3. Copier l'URL complète
4. Remplacer `[YOUR-PASSWORD]`

### 3. Utiliser les MÊMES clés Clerk

Vous pouvez utiliser les mêmes clés Clerk pour les deux projets :
- Les utilisateurs seront les mêmes
- Mais stockés dans des bases de données différentes

## Vérification

Après avoir créé `.env.local`, vérifiez :

```bash
# 1. Le fichier existe
ls demo-2/.env.local    # Mac/Linux
dir demo-2\.env.local   # Windows

# 2. Les variables sont chargées
cd demo-2
npx prisma db push
```

Si ça fonctionne, vous verrez :
```
✔ Your database is now in sync with your Prisma schema
```

## Troubleshooting

### Erreur "Invalid Publishable Key"

- Vérifiez que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` commence par `pk_test_`
- Pas d'espaces avant/après le `=`

### Erreur "Can't reach database"

- Vérifiez `DATABASE_URL`
- Vérifiez que `[YOUR-PASSWORD]` est remplacé
- Vérifiez que le projet Supabase est actif (vert)

### Les variables ne sont pas chargées

- Le fichier doit s'appeler exactement `.env.local`
- Il doit être dans `demo-2/` (pas à la racine)
- Redémarrez le serveur après modification

## Structure finale

```
02-next-match-clerck-3/
├── .env.local              # Pour le projet principal
├── demo-2/
│   ├── .env.local          # Pour Demo-2
│   └── ...
└── ...
```

---

**Note** : Ne jamais commiter `.env.local` dans Git !

