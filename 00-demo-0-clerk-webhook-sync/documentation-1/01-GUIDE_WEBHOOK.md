# Guide Complet : Webhooks Clerk

Guide détaillé pour configurer et utiliser les webhooks Clerk.

---

## Qu'est-ce qu'un webhook ?

Un **webhook** est un mécanisme permettant à une application (Clerk) d'envoyer des données en temps réel à une autre application (votre API) quand un événement se produit.

### Analogie

Imaginez un système de livraison :
- **Sans webhook (Upsert)** : Vous devez aller vérifier votre boîte aux lettres régulièrement
- **Avec webhook** : Le facteur sonne à votre porte dès qu'un colis arrive

---

## Flow complet

```
1. User s'inscrit dans Clerk
   ↓
2. Clerk déclenche l'événement "user.created"
   ↓
3. Clerk envoie une requête POST à votre webhook
   POST https://votreapp.com/api/webhooks/clerk
   Body: { type: "user.created", data: {...} }
   ↓
4. Votre API reçoit la requête
   ↓
5. Vous créez l'utilisateur dans Supabase
   ↓
6. Vous répondez 200 OK à Clerk
   ↓
7. Clerk marque le webhook comme "Delivered" ✅
```

---

## Configuration étape par étape

### 1. Installer ngrok (développement local)

Ngrok expose votre localhost sur Internet.

```bash
# Via npm
npm install -g ngrok

# Via Homebrew (Mac)
brew install ngrok

# Via Chocolatey (Windows)
choco install ngrok
```

### 2. Créer un compte ngrok

1. Aller sur [ngrok.com](https://ngrok.com)
2. S'inscrire gratuitement
3. Récupérer votre token d'authentification
4. Configurer :
   ```bash
   ngrok config add-authtoken VOTRE_TOKEN
   ```

### 3. Exposer votre application

```bash
# Lancer votre app
npm run dev  # Port 2999

# Dans un autre terminal, exposer le port
ngrok http 2999
```

Vous obtiendrez :
```
Session Status: online
Forwarding: https://abc123-456-789.ngrok-free.app -> http://localhost:2999
```

**Important** : Cette URL change à chaque fois que vous relancez ngrok (sauf si vous avez un compte payant).

### 4. Configurer le webhook dans Clerk

1. **Aller dans Clerk Dashboard**
   - [https://dashboard.clerk.com](https://dashboard.clerk.com)

2. **Sélectionner votre application**

3. **Naviguer vers Webhooks**
   - Dans le menu : Configure → Webhooks

4. **Add Endpoint**
   - Cliquer sur "Add Endpoint"

5. **Remplir les informations**
   - **Endpoint URL** : `https://abc123.ngrok-free.app/api/webhooks/clerk`
   - **Description** : "Synchronisation avec Supabase"

6. **Sélectionner les événements**
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`

7. **Copier le Signing Secret**
   - Clerk génère un secret : `whsec_xxxxx...`
   - Copier ce secret

8. **Ajouter dans .env.local**
   ```env
   CLERK_WEBHOOK_SECRET=whsec_xxxxx...
   ```

9. **Sauvegarder**

---

## Test du webhook

### 1. Vérifier les logs

Dans votre terminal (là où tourne `npm run dev`) :

```bash
# Vous devriez voir :
Started server on http://localhost:2999
```

### 2. Créer un utilisateur

1. Ouvrir http://localhost:2999
2. Cliquer "Se connecter"
3. S'inscrire avec un nouvel email

### 3. Vérifier les logs du webhook

Dans votre terminal, vous devriez voir :

```bash
✅ Webhook reçu: user.created
📦 Clerk User ID: user_2abc...
✅ Utilisateur créé dans la DB: test@example.com
```

### 4. Vérifier dans Clerk Dashboard

1. Aller dans **Webhooks** → **Logs**
2. Vous devriez voir :
   - Event : `user.created`
   - Status : ✅ Delivered (200)
   - Attempts : 1

### 5. Vérifier dans Supabase

```bash
npx prisma studio
```

L'utilisateur est là ! 🎉

---

## Événements supportés

### user.created

**Quand :** Un nouvel utilisateur s'inscrit

**Payload :**
```json
{
  "type": "user.created",
  "data": {
    "id": "user_2abc123",
    "email_addresses": [
      {
        "email_address": "user@example.com",
        "id": "idn_xxx"
      }
    ],
    "first_name": "John",
    "last_name": "Doe",
    "image_url": "https://...",
    "created_at": 1234567890
  }
}
```

**Action :** Créer l'utilisateur dans la DB

### user.updated

**Quand :** L'utilisateur modifie son profil

**Payload :** Identique à `user.created`

**Action :** Mettre à jour l'utilisateur dans la DB

### user.deleted

**Quand :** L'utilisateur est supprimé (manuellement dans Clerk Dashboard)

**Payload :**
```json
{
  "type": "user.deleted",
  "data": {
    "id": "user_2abc123",
    "deleted": true
  }
}
```

**Action :** Supprimer l'utilisateur de la DB

---

## Sécurité

### Vérification de la signature

Clerk signe chaque webhook avec `CLERK_WEBHOOK_SECRET`.

Notre code vérifie automatiquement :

```typescript
const wh = new Webhook(CLERK_WEBHOOK_SECRET)
const evt = wh.verify(payload, headers)
```

**Si la signature est invalide** → `400 Bad Request`

### Protection contre les attaques

✅ **Replay attacks** : Évités par timestamp dans la signature
✅ **Man-in-the-middle** : HTTPS requis
✅ **Brute force** : Rate limiting de Clerk

---

## Debugging

### Le webhook ne se déclenche pas

**Vérifier :**
1. ngrok est bien lancé : `ngrok http 2999`
2. L'URL dans Clerk est correcte
3. Les événements sont bien sélectionnés
4. L'app tourne : `npm run dev`

**Test manuel :**

Dans Clerk Dashboard → Webhooks → Votre endpoint → **Send test event**

### Erreur 400 "Signature invalide"

**Causes possibles :**
- `CLERK_WEBHOOK_SECRET` incorrect
- Secret non à jour (si vous avez recréé le webhook)

**Solution :**
1. Copier le nouveau secret depuis Clerk
2. Mettre à jour `.env.local`
3. Redémarrer `npm run dev`

### Erreur 500

**Voir les logs** dans le terminal :

```bash
❌ Erreur lors du traitement du webhook: ...
```

**Causes fréquentes :**
- Problème de connexion à Supabase
- Champ manquant dans le payload
- Utilisateur déjà existant (pour `user.created`)

---

## Production

### Déploiement sur Vercel

1. **Déployer** :
   ```bash
   vercel
   ```

2. **URL production** :
   ```
   https://votre-app.vercel.app
   ```

3. **Mettre à jour le webhook Clerk** :
   - Endpoint URL : `https://votre-app.vercel.app/api/webhooks/clerk`

4. **Variables d'environnement Vercel** :
   - `CLERK_WEBHOOK_SECRET` (copier depuis Clerk)
   - `DATABASE_URL` (Supabase production)

### Monitoring

**Clerk Dashboard → Webhooks → Logs** :
- Voir tous les webhooks envoyés
- Status (delivered/failed)
- Nombre de tentatives
- Temps de réponse

**Alertes** :

Configurez des alertes si :
- Taux d'échec > 5%
- Temps de réponse > 5s
- Webhooks en retry

---

## Retry et gestion d'erreurs

### Stratégie de retry de Clerk

Si votre webhook répond autre chose que `200 OK` :

1. **Retry 1** : après 5 secondes
2. **Retry 2** : après 30 secondes
3. **Retry 3** : après 5 minutes
4. **Retry 4** : après 1 heure

Après 4 échecs → Webhook marqué comme "Failed"

### Idempotence

Votre webhook peut recevoir le même événement plusieurs fois.

**Solution** : Vérifier si l'utilisateur existe déjà

```typescript
case 'user.created': {
  // Vérifier si existe
  const existing = await prisma.user.findUnique({
    where: { clerkId: id }
  })
  
  if (existing) {
    console.log('User already exists, skipping')
    return Response.json({ success: true })
  }
  
  // Créer
  await prisma.user.create({...})
}
```

---

## Alternatives à ngrok

### localtunnel

```bash
npm install -g localtunnel
lt --port 2999
```

### VS Code Port Forwarding

Si vous utilisez VS Code :
1. Command Palette → "Forward a Port"
2. Port : 2999
3. Visibility : Public

### Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:2999
```

---

## Comparaison finale

| Aspect | **Upsert** | **Webhook** |
|--------|-----------|-------------|
| Code | `syncUser()` partout | Aucun |
| Sync | Au visit | Temps réel |
| Setup dev | Simple | ngrok requis |
| Setup prod | Simple | Simple |
| Fiabilité | 100% | 99.9% |
| Debugging | Facile | Moyen |

---

## Ressources

- [Clerk Webhooks Docs](https://clerk.com/docs/integrations/webhooks)
- [ngrok Documentation](https://ngrok.com/docs)
- [Svix (Clerk uses it)](https://www.svix.com/)

---

**Webhook = Synchronisation professionnelle et temps réel !** 🚀

