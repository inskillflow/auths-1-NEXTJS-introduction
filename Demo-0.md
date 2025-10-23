# Demo-0 : clerk-webhook-sync

#### Description

Architecture professionnelle utilisant Clerk avec synchronisation automatique via webhooks. Aucun code de synchronisation manuel requis dans l'application.

#### Schéma de base de données

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  firstName String?
  lastName  String?
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Architecture de synchronisation

```
User Action → Clerk → Webhook Event → API Route → Prisma → Supabase
```

#### Code clé

Route webhook (`app/api/webhooks/clerk/route.ts`) :

```typescript
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  
  // Vérifier signature avec Svix
  const wh = new Webhook(WEBHOOK_SECRET)
  const evt = wh.verify(payload, headers)
  
  switch (evt.type) {
    case 'user.created':
      await prisma.user.create({ data: { ... } })
      break
    case 'user.updated':
      await prisma.user.update({ where: { clerkId }, data: { ... } })
      break
    case 'user.deleted':
      await prisma.user.delete({ where: { clerkId } })
      break
  }
  
  return Response.json({ success: true })
}
```

#### Variables d'environnement requises

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
DATABASE_URL
```

#### Dépendances spécifiques

- `@clerk/nextjs` : 4.29.0
- `svix` : 1.15.0

#### Avantages techniques

1. Synchronisation en temps réel (< 1 seconde)
2. Aucun code de sync dans l'application
3. Architecture découplée et event-driven
4. Gère automatiquement création, mise à jour et suppression
5. Fiabilité garantie par Clerk (retry automatique)
6. Production-ready

#### Inconvénients techniques

1. Configuration initiale plus complexe
2. Nécessite exposition publique de l'endpoint (ngrok en développement)
3. Debugging moins direct
4. Dépendance externe pour la synchronisation
5. Coût Clerk après 10,000 utilisateurs actifs/mois

#### Cas d'usage optimaux

- Applications en production nécessitant une synchronisation temps réel
- Architectures microservices event-driven
- Applications avec besoins de traçabilité complète
- Projets nécessitant réaction immédiate aux événements utilisateur

#### Métriques

- Temps de setup : 15-20 minutes
- Temps de synchronisation : 500ms - 1s (async)
- Charge serveur : Faible (événementiel)
- Maintenance : Faible

---

## Annexe : Diagramme d'architecture

### Architecture complète Demo-0

```mermaid
graph TD
    USER[Utilisateur] --> CLERK[Clerk Auth]
    CLERK -->|Login Success| APP[Application]
    
    CLERK -->|Event: user.created| WEBHOOK[Webhook Sender]
    CLERK -->|Event: user.updated| WEBHOOK
    CLERK -->|Event: user.deleted| WEBHOOK
    
    WEBHOOK -->|POST + Signature| API["API Route<br/>/api/webhooks/clerk"]
    API --> VERIFY[Svix Verification]
    
    VERIFY -->|Valid| SWITCH{Event Type?}
    VERIFY -->|Invalid| REJECT[Return 400]
    
    SWITCH -->|user.created| CREATE[Prisma Create]
    SWITCH -->|user.updated| UPDATE[Prisma Update]
    SWITCH -->|user.deleted| DELETE[Prisma Delete]
    
    CREATE --> DB[(Supabase)]
    UPDATE --> DB
    DELETE --> DB
    
    APP -->|Read User| DB
    
    style USER fill:#b3e5fc,color:#000
    style CLERK fill:#81d4fa,color:#000
    style APP fill:#b3e5fc,color:#000
    style WEBHOOK fill:#81d4fa,color:#000
    style API fill:#ffd54f,color:#000
    style VERIFY fill:#fff176,color:#000
    style SWITCH fill:#ffcc80,color:#000
    style CREATE fill:#a5d6a7,color:#000
    style UPDATE fill:#a5d6a7,color:#000
    style DELETE fill:#ef9a9a,color:#000
    style DB fill:#66bb6a,color:#000
    style REJECT fill:#ef9a9a,color:#000
```

### Schéma de base de données

```mermaid
erDiagram
    User {
        string id PK "cuid()"
        string clerkId UK "Clerk User ID"
        string email UK
        string firstName
        string lastName
        string imageUrl
        datetime createdAt
        datetime updatedAt
    }
```

### Flux événementiel

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant C as Clerk
    participant W as Webhook
    participant A as API Route
    participant D as Supabase
    
    U->>C: Signup/Update/Delete
    C->>W: Trigger event
    W->>A: POST + signature
    A->>A: Verify with Svix
    
    alt Event valide
        A->>D: Create/Update/Delete
        D->>A: Success
        A->>W: 200 OK
    else Event invalide
        A->>W: 400 Bad Request
    end
    
    Note over U,D: Synchronisation temps réel automatique
```

