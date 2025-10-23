# Noms de Projets Professionnels et Configuration

Guide de renommage des projets avec noms professionnels et configuration unifiée.

---

## Noms suggérés

### Projet actuel → Nom professionnel

| Dossier actuel | Nom suggéré | Description courte |
|----------------|-------------|-------------------|
| `demo-0` | `clerk-webhook-sync` | Clerk avec synchronisation webhook automatique |
| `Racine (projet principal)` | `clerk-upsert-basic` | Clerk avec synchronisation upsert manuelle |
| `demo-2` | `clerk-upsert-relations` | Clerk avec relations entre entités |
| `demo-3` | `nextauth-basic` | NextAuth simple sans relations |
| `demo-4` | `nextauth-relations` | NextAuth complet avec relations |

---

## Noms alternatifs (selon cas d'usage)

### clerk-webhook-sync (demo-0)

**Autres noms possibles :**
- `next-clerk-webhook`
- `clerk-realtime-sync`
- `clerk-event-driven`
- `auth-clerk-webhook`

### clerk-upsert-basic (projet principal)

**Autres noms possibles :**
- `next-clerk-simple`
- `clerk-manual-sync`
- `clerk-basic-auth`
- `auth-clerk-starter`

### clerk-upsert-relations (demo-2)

**Autres noms possibles :**
- `clerk-with-relations`
- `clerk-lms-starter`
- `clerk-multi-entity`
- `auth-clerk-advanced`

### nextauth-basic (demo-3)

**Autres noms possibles :**
- `nextauth-simple`
- `nextauth-starter`
- `next-auth-basic`
- `auth-nextauth-minimal`

### nextauth-relations (demo-4)

**Autres noms possibles :**
- `nextauth-complete`
- `nextauth-full-stack`
- `nextauth-enterprise`
- `auth-nextauth-advanced`

---

## Configuration des ports (tous sur 3000)

### Modifications à apporter

Tous les projets utilisent actuellement des ports différents pour permettre de les lancer simultanément. Pour les utiliser en production ou individuellement, modifier le port à 3000 dans chaque projet.

#### demo-0 (clerk-webhook-sync)

**Fichier :** `demo-0/package.json`

**Actuel :**
```json
{
  "scripts": {
    "dev": "next dev -p 2999"
  }
}
```

**Modifier en :**
```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

#### Projet principal (clerk-upsert-basic)

**Fichier :** `package.json` (racine)

**Actuel :** Déjà sur port 3000 par défaut

**Aucune modification nécessaire**

#### demo-2 (clerk-upsert-relations)

**Fichier :** `demo-2/package.json`

**Actuel :**
```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

**Modifier en :**
```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

#### demo-3 (nextauth-basic)

**Fichier :** `demo-3/package.json`

**Actuel :**
```json
{
  "scripts": {
    "dev": "next dev -p 3002"
  }
}
```

**Modifier en :**
```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

#### demo-4 (nextauth-relations)

**Fichier :** `demo-4/package.json`

**Actuel :**
```json
{
  "scripts": {
    "dev": "next dev -p 3003"
  }
}
```

**Modifier en :**
```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

---

## Modifications dans .env.local (pour NextAuth)

Si vous modifiez les ports, pensez à mettre à jour `NEXTAUTH_URL` dans les projets NextAuth.

### demo-3 et demo-4

**Fichiers :** 
- `demo-3/.env.local`
- `demo-4/.env.local`

**Actuel (demo-3) :**
```env
NEXTAUTH_URL=http://localhost:3002
```

**Actuel (demo-4) :**
```env
NEXTAUTH_URL=http://localhost:3003
```

**Modifier en :**
```env
NEXTAUTH_URL=http://localhost:3000
```

---

## Renommage des dossiers

### Option 1 : Renommer les dossiers directement

```bash
# Windows PowerShell
Rename-Item -Path "demo-0" -NewName "clerk-webhook-sync"
Rename-Item -Path "demo-2" -NewName "clerk-upsert-relations"
Rename-Item -Path "demo-3" -NewName "nextauth-basic"
Rename-Item -Path "demo-4" -NewName "nextauth-relations"

# Le projet principal peut rester à la racine ou être déplacé
mkdir clerk-upsert-basic
# Copier les fichiers du projet principal dans clerk-upsert-basic
```

```bash
# Linux/Mac
mv demo-0 clerk-webhook-sync
mv demo-2 clerk-upsert-relations
mv demo-3 nextauth-basic
mv demo-4 nextauth-relations
```

### Option 2 : Créer de nouveaux dossiers

Si vous préférez une structure propre :

```bash
# Créer un dossier pour tous les projets d'authentification
mkdir auth-projects

# Copier chaque projet avec son nouveau nom
cp -r demo-0 auth-projects/clerk-webhook-sync
cp -r . auth-projects/clerk-upsert-basic  # projet principal
cp -r demo-2 auth-projects/clerk-upsert-relations
cp -r demo-3 auth-projects/nextauth-basic
cp -r demo-4 auth-projects/nextauth-relations
```

---

## Structure finale recommandée

### Option A : Dossiers séparés à la racine

```
votre-workspace/
├── clerk-webhook-sync/
├── clerk-upsert-basic/
├── clerk-upsert-relations/
├── nextauth-basic/
└── nextauth-relations/
```

### Option B : Dossiers groupés

```
votre-workspace/
└── auth-projects/
    ├── clerk-webhook-sync/
    ├── clerk-upsert-basic/
    ├── clerk-upsert-relations/
    ├── nextauth-basic/
    └── nextauth-relations/
```

### Option C : Groupés par provider

```
votre-workspace/
├── clerk-auth/
│   ├── webhook-sync/
│   ├── upsert-basic/
│   └── upsert-relations/
└── nextauth/
    ├── basic/
    └── relations/
```

---

## Mise à jour du package.json name

Pour chaque projet, modifier le champ `name` dans `package.json`.

### demo-0 (clerk-webhook-sync)

```json
{
  "name": "clerk-webhook-sync",
  "version": "1.0.0"
}
```

### Projet principal (clerk-upsert-basic)

```json
{
  "name": "clerk-upsert-basic",
  "version": "1.0.0"
}
```

### demo-2 (clerk-upsert-relations)

```json
{
  "name": "clerk-upsert-relations",
  "version": "1.0.0"
}
```

### demo-3 (nextauth-basic)

```json
{
  "name": "nextauth-basic",
  "version": "1.0.0"
}
```

### demo-4 (nextauth-relations)

```json
{
  "name": "nextauth-relations",
  "version": "1.0.0"
}
```

---

## Conventions de nommage recommandées

### Pour vos propres projets

**Format général :**
```
[provider]-[méthode]-[feature]
```

**Exemples :**
- `clerk-webhook-marketplace`
- `nextauth-oauth-dashboard`
- `clerk-manual-blog`
- `nextauth-full-ecommerce`

**Ou par cas d'usage :**
- `lms-clerk-webhook` (Learning Management System)
- `marketplace-nextauth-oauth`
- `blog-clerk-simple`
- `ecommerce-nextauth-full`

---

## Checklist de renommage complet

Pour chaque projet que vous renommez :

- [ ] Renommer le dossier
- [ ] Modifier `name` dans `package.json`
- [ ] Modifier `dev` script dans `package.json` (retirer `-p XXXX`)
- [ ] Modifier `start` script dans `package.json` (retirer `-p XXXX`)
- [ ] Pour NextAuth : Modifier `NEXTAUTH_URL` dans `.env.local`
- [ ] Pour Webhooks : Mettre à jour l'URL webhook dans Clerk Dashboard
- [ ] Tester `npm install`
- [ ] Tester `npm run dev`
- [ ] Vérifier que l'application fonctionne sur http://localhost:3000

---

## Commandes rapides de modification

### Script pour modifier tous les package.json (Windows PowerShell)

```powershell
# demo-0
$path = "demo-0/package.json"
(Get-Content $path) -replace '"dev": "next dev -p 2999"', '"dev": "next dev"' | Set-Content $path
(Get-Content $path) -replace '"start": "next start -p 2999"', '"start": "next start"' | Set-Content $path

# demo-2
$path = "demo-2/package.json"
(Get-Content $path) -replace '"dev": "next dev -p 3001"', '"dev": "next dev"' | Set-Content $path
(Get-Content $path) -replace '"start": "next start -p 3001"', '"start": "next start"' | Set-Content $path

# demo-3
$path = "demo-3/package.json"
(Get-Content $path) -replace '"dev": "next dev -p 3002"', '"dev": "next dev"' | Set-Content $path
(Get-Content $path) -replace '"start": "next start -p 3002"', '"start": "next start"' | Set-Content $path

# demo-4
$path = "demo-4/package.json"
(Get-Content $path) -replace '"dev": "next dev -p 3003"', '"dev": "next dev"' | Set-Content $path
(Get-Content $path) -replace '"start": "next start -p 3003"', '"start": "next start"' | Set-Content $path
```

### Script pour modifier tous les package.json (Linux/Mac)

```bash
# demo-0
sed -i 's/"dev": "next dev -p 2999"/"dev": "next dev"/' demo-0/package.json
sed -i 's/"start": "next start -p 2999"/"start": "next start"/' demo-0/package.json

# demo-2
sed -i 's/"dev": "next dev -p 3001"/"dev": "next dev"/' demo-2/package.json
sed -i 's/"start": "next start -p 3001"/"start": "next start"/' demo-2/package.json

# demo-3
sed -i 's/"dev": "next dev -p 3002"/"dev": "next dev"/' demo-3/package.json
sed -i 's/"start": "next start -p 3002"/"start": "next start"/' demo-3/package.json

# demo-4
sed -i 's/"dev": "next dev -p 3003"/"dev": "next dev"/' demo-4/package.json
sed -i 's/"start": "next start -p 3003"/"start": "next start"/' demo-4/package.json
```

---

## Notes importantes

### Exécution simultanée

Après modification des ports à 3000 pour tous les projets, vous NE POURREZ PLUS exécuter plusieurs projets simultanément. Si vous avez besoin de comparer les projets côte à côte, gardez les ports différents.

### Production

En production, le port n'a généralement pas d'importance car il est géré par la plateforme (Vercel, Netlify, etc.). Les modifications suggérées sont principalement pour la standardisation.

### Variables d'environnement

N'oubliez pas de mettre à jour toutes les références aux URLs dans :
- `.env.local`
- Clerk Dashboard (pour webhooks)
- Google Cloud Console (pour OAuth callbacks)
- GitHub Settings (pour OAuth callbacks)

---

## Résumé des noms recommandés

**Choix final recommandé :**

1. `clerk-webhook-sync` - Synchronisation temps réel avec webhooks
2. `clerk-upsert-basic` - Approche simple et pédagogique
3. `clerk-upsert-relations` - Avec gestion de relations
4. `nextauth-basic` - Alternative open-source simple
5. `nextauth-relations` - Architecture complète et avancée

Ces noms sont descriptifs, professionnels et indiquent clairement la technologie et l'approche utilisées.

