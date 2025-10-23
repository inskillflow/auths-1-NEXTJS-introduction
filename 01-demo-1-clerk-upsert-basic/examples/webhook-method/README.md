# Méthode Alternative : Webhooks Clerk

Cette méthode utilise les webhooks de Clerk pour synchroniser en temps réel.

## Avantages vs Upsert

- ✅ Synchronisation en temps réel
- ✅ Capture tous les événements (création, modification, suppression)
- ✅ Pas besoin d'appeler syncUser() dans chaque page

## Installation supplémentaire

```bash
npm install svix
```

## Étapes

### 1. Créer la route webhook

Créer le fichier `app/api/webhooks/clerk/route.ts` (voir ci-dessous)

### 2. Configurer Clerk Dashboard

1. Aller sur [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Aller dans "Webhooks" dans le menu de gauche
3. Cliquer "Add Endpoint"
4. URL : `https://votre-domaine.com/api/webhooks/clerk`
5. Pour le développement local, utiliser [ngrok](https://ngrok.com) :
   ```bash
   ngrok http 3000
   # URL : https://xxxx.ngrok.io/api/webhooks/clerk
   ```
6. Sélectionner les événements :
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Copier le "Signing Secret"

### 3. Ajouter dans `.env.local`

```env
WEBHOOK_SECRET=whsec_xxxxx
```

### 4. Retirer syncUser() des pages

Vous n'avez plus besoin d'appeler `syncUser()` dans vos pages car la synchronisation se fait automatiquement via webhook.

## Résumé

- **Développement** : Méthode Upsert (simple, pas besoin de ngrok)
- **Production** : Méthode Webhooks (robuste, temps réel)

