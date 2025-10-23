# Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Clerk (obtenir depuis https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Supabase (obtenir depuis https://supabase.com/dashboard)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

## Obtenir les clés Clerk

1. Aller sur [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Créer un compte et une application
3. Dans l'onglet "API Keys", copier :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

## Obtenir l'URL Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Créer un compte et un projet
3. Aller dans Settings → Database
4. Dans "Connection String", choisir "Direct connection" (mode direct)
5. Copier l'URL et remplacer `[YOUR-PASSWORD]` par votre mot de passe

