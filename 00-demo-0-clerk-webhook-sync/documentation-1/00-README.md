# Demo 0 : Clerk + Webhook (Synchronisation Automatique)

Projet minimaliste démontrant la synchronisation **automatique** entre Clerk et Supabase via **webhooks**.

---

## Caractéristiques

- **Auth** : Clerk (Service SaaS)
- **Base de données** : Supabase (PostgreSQL)
- **ORM** : Prisma
- **Synchronisation** : **Webhooks (automatique)**
- **Tables** : 1 (User)
- **Port** : 2999

---

## Différence clé avec le projet principal

| Aspect | **Projet Principal** | **Demo-0** |
|--------|---------------------|------------|
| **Sync** | Manuel (`syncUser()`) | **Webhook (automatique)** |
| **Code** | Appeler `syncUser()` partout | **Aucun code !** |
| **Temps réel** | Sync au prochain visit | **Sync instantanée** |
| **Configuration** | 2 clés Clerk | **2 clés + Webhook URL** |
| **Complexité** | ⭐ Simple | **⭐⭐ Moyenne** |

---

## Comment ça fonctionne ?

### Approche traditionnelle (Projet Principal)

```typescript
// À CHAQUE page
const user = await syncUser()  // ❌ Code répétitif
```

### Approche Webhook (Demo-0)

```typescript
// AUCUN code nécessaire ! ✅
// Clerk envoie automatiquement les événements
```

**Flow :**

```
1. User s'inscrit dans Clerk
   ↓
2. Clerk envoie un webhook "user.created"
   ↓
3. Notre API /api/webhooks/clerk reçoit l'événement
   ↓
4. User créé automatiquement dans Supabase
   ✅ Synchronisation instantanée !
```

---

## Événements supportés

Notre webhook écoute 3 événements :

1. **`user.created`** : Nouvel utilisateur
   - Créer l'utilisateur dans Supabase

2. **`user.updated`** : Utilisateur modifié
   - Mettre à jour email, nom, image, etc.

3. **`user.deleted`** : Utilisateur supprimé
   - Supprimer l'utilisateur de Supabase

---

## Installation

### 1. Installation des dépendances

```bash
cd demo-0
npm install
```

### 2. Configuration .env.local

```bash
cp .env.sample .env.local
```

Éditer `.env.local` :

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Webhook (générer avec openssl)
CLERK_WEBHOOK_SECRET=whsec_xxx

# Database
DATABASE_URL="postgresql://..."
```

### 3. Générer CLERK_WEBHOOK_SECRET

```bash
# Méthode 1 : Via Clerk Dashboard (recommandé)
# Le secret sera généré automatiquement

# Méthode 2 : Manuellement
openssl rand -base64 32
```

### 4. Créer les tables

```bash
npx prisma db push
npx prisma generate
```

### 5. Exposer l'API localement (ngrok)

Pour que Clerk puisse envoyer des webhooks à votre localhost :

```bash
# Installer ngrok
npm install -g ngrok

# Exposer le port 2999
ngrok http 2999
```

Ngrok vous donnera une URL publique :
```
https://abc123.ngrok.io
```

### 6. Configurer le webhook dans Clerk

1. Aller sur [Clerk Dashboard](https://dashboard.clerk.com)
2. Sélectionner votre application
3. Aller dans **Webhooks**
4. Cliquer **Add Endpoint**
5. **Endpoint URL** : `https://abc123.ngrok.io/api/webhooks/clerk`
6. **Events** : Sélectionner
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. **Signing Secret** : Copier le secret généré
8. Coller dans `.env.local` → `CLERK_WEBHOOK_SECRET`

### 7. Lancer l'application

```bash
npm run dev  # Port 2999
```

Ouvrir : **http://localhost:2999**

---

## Test de la synchronisation

### 1. Créer un utilisateur

1. Ouvrir http://localhost:2999
2. S'inscrire via Clerk
3. **Regarder les logs** :
   ```
   ✅ Webhook received: user.created
   ✅ User created in database: user@example.com
   ```

4. **Vérifier dans Supabase** :
   ```bash
   npx prisma studio
   ```
   Le user est déjà là ! Aucun code `syncUser()` nécessaire !

### 2. Modifier le profil

1. Dans Clerk, modifier votre nom
2. **Instantanément** synchronisé dans Supabase
3. Logs :
   ```
   ✅ Webhook received: user.updated
   ✅ User updated: user@example.com
   ```

### 3. Supprimer l'utilisateur

1. Dans Clerk Dashboard, supprimer l'utilisateur
2. **Automatiquement** supprimé de Supabase
3. Logs :
   ```
   ✅ Webhook received: user.deleted
   ✅ User deleted: user@example.com
   ```

---

## Code du webhook

Le webhook est simple et automatique :

```typescript
// app/api/webhooks/clerk/route.ts
export async function POST(request: Request) {
  const payload = await request.text()
  const headers = request.headers

  // Vérifier la signature Clerk
  const wh = new Webhook(CLERK_WEBHOOK_SECRET)
  const event = wh.verify(payload, headers)

  // Gérer les événements
  switch (event.type) {
    case 'user.created':
      await prisma.user.create({...})
      break
    
    case 'user.updated':
      await prisma.user.update({...})
      break
    
    case 'user.deleted':
      await prisma.user.delete({...})
      break
  }

  return Response.json({ success: true })
}
```

**C'est tout !** Aucun code dans vos pages.

---

## Structure du projet

```
demo-0/
├── app/
│   ├── api/
│   │   └── webhooks/
│   │       └── clerk/
│   │           └── route.ts        # ← Webhook handler
│   ├── layout.tsx
│   └── page.tsx                     # ← Aucun syncUser() !
├── lib/
│   └── prisma.ts
├── prisma/
│   └── schema.prisma                # Même schéma que projet principal
└── Port 2999
```

**Pas de `sync-user.ts` !** Tout est géré par le webhook.

---

## Avantages de l'approche Webhook

### ✅ Avantages

1. **Synchronisation temps réel**
   - User créé → Sync instantanée
   - User modifié → Sync instantanée

2. **Aucun code répétitif**
   - Pas besoin d'appeler `syncUser()` partout
   - Code plus propre

3. **Fiable**
   - Clerk garantit la livraison
   - Retry automatique en cas d'échec

4. **Complet**
   - Gère création, mise à jour, suppression
   - Un seul point d'entrée

5. **Architecture moderne**
   - Event-driven
   - Découplé

### ❌ Inconvénients

1. **Configuration plus complexe**
   - Besoin de ngrok en dev
   - Configuration webhook dans Clerk

2. **Debugging plus difficile**
   - Erreurs moins visibles
   - Logs à surveiller

3. **Dépendance externe**
   - Si Clerk down, pas de sync
   - Si webhook fail, data désynchronisée

4. **Développement local complexe**
   - Besoin d'exposer localhost (ngrok)
   - URL change à chaque fois

---

## Comparaison : Upsert vs Webhook

| Aspect | **Upsert (Manuel)** | **Webhook (Auto)** |
|--------|---------------------|-------------------|
| **Code** | `syncUser()` partout | **Aucun** |
| **Sync** | Au prochain visit | **Temps réel** |
| **Dev local** | Facile | **Complexe (ngrok)** |
| **Setup** | 5 min | **15 min** |
| **Fiabilité** | 100% | **99% (dépend Clerk)** |
| **Maintenance** | Faible | **Moyenne** |
| **Production** | Simple | **Besoin URL publique** |

---

## Production

### Déploiement

1. **Déployer sur Vercel/Netlify**
2. **URL production** : `https://yourdomain.com`
3. **Mettre à jour webhook Clerk** :
   - Endpoint : `https://yourdomain.com/api/webhooks/clerk`
4. **Variables d'environnement** :
   - `CLERK_WEBHOOK_SECRET` (production)
   - `DATABASE_URL` (production)

### Monitoring

Surveillez les webhooks dans Clerk Dashboard :
- Nombre de webhooks reçus
- Taux de succès
- Erreurs et retry

---

## Sécurité

### Vérification de la signature

Le webhook vérifie automatiquement que la requête vient bien de Clerk :

```typescript
const wh = new Webhook(CLERK_WEBHOOK_SECRET)
const event = wh.verify(payload, headers)
```

**Jamais exposer** `CLERK_WEBHOOK_SECRET` publiquement !

### Protection CSRF

NextAuth et Clerk protègent automatiquement contre CSRF.

---

## Debugging

### Logs du webhook

```typescript
// Dans route.ts
console.log('✅ Webhook received:', event.type)
console.log('📦 Payload:', event.data)
```

### Clerk Dashboard

Aller dans **Webhooks** → **Logs** pour voir :
- Tous les webhooks envoyés
- Status (success/fail)
- Payload
- Retry attempts

### Tester manuellement

Clerk permet de "replay" un webhook depuis le dashboard.

---

## Cas d'usage

### Utilisez Demo-0 (Webhook) si :

✅ Vous voulez une sync temps réel
✅ Vous ne voulez pas de code répétitif
✅ Vous déployez en production (URL publique)
✅ Architecture event-driven
✅ Vous avez besoin de réagir aux événements Clerk

### Utilisez Projet Principal (Upsert) si :

✅ Vous débutez
✅ Développement local simple
✅ Vous voulez contrôler quand sync
✅ Pas besoin de temps réel
✅ Setup rapide

---

## Documentation complète

- **[00-GUIDE_WEBHOOK.md](00-GUIDE_WEBHOOK.md)** - Guide détaillé webhooks
- **[NGROK_SETUP.md](NGROK_SETUP.md)** - Configuration ngrok
- **[../documentation/02-COMPARISON.md](../documentation/02-COMPARISON.md)** - Comparaison Upsert vs Webhook

---

## Ressources

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [ngrok Documentation](https://ngrok.com/docs)
- [Webhook Best Practices](https://clerk.com/docs/integrations/webhooks/overview)

---

**Demo-0 = Synchronisation automatique et temps réel !** 🚀

Le choix professionnel pour la production.

