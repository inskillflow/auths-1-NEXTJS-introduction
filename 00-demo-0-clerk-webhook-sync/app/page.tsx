import { SignInButton, SignedIn, SignedOut, UserButton, currentUser } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  // Récupérer l'utilisateur Clerk
  const clerkUser = await currentUser()

  // Récupérer l'utilisateur de la DB (synchronisé via webhook)
  let dbUser = null
  
  if (clerkUser) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    })
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>Demo 0 : Synchronisation via Webhook</h1>
            <p style={{ color: '#718096', marginTop: '8px' }}>
              Synchronisation automatique et temps réel
            </p>
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>

      <SignedOut>
        <div className="sign-in-prompt">
          <h2>Bienvenue sur Demo 0</h2>
          <p>
            Ce projet démontre la synchronisation <strong>automatique</strong> via webhooks :<br/>
            • Aucun code <code>syncUser()</code> nécessaire<br/>
            • Synchronisation en temps réel<br/>
            • Gère création, mise à jour et suppression<br/>
          </p>
          <div className="clerk-btn">
            <SignInButton mode="modal">
              <button>Se connecter</button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {!dbUser ? (
          <div className="card" style={{ background: '#fef3c7' }}>
            <h2 style={{ color: '#92400e' }}>⏳ Synchronisation en cours...</h2>
            <p style={{ color: '#78350f' }}>
              Le webhook est en train de créer votre utilisateur dans la base de données.
              <br />
              Rafraîchissez la page dans quelques secondes.
            </p>
          </div>
        ) : (
          <>
            <div className="badge">
              ✅ Utilisateur synchronisé automatiquement via webhook !
            </div>

            <div className="card">
              <h2>Informations Utilisateur</h2>
              <p style={{ marginBottom: '16px', color: '#718096' }}>
                Synchronisé automatiquement depuis Clerk sans aucun code <code>syncUser()</code>
              </p>
              
              {dbUser.imageUrl && (
                <img src={dbUser.imageUrl} alt="Avatar" className="avatar" />
              )}
              
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">ID (DB):</span>
                  <span className="info-value">{dbUser.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Clerk ID:</span>
                  <span className="info-value" title={dbUser.clerkId}>
                    {dbUser.clerkId.substring(0, 20)}...
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{dbUser.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Prénom:</span>
                  <span className="info-value">{dbUser.firstName || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nom:</span>
                  <span className="info-value">{dbUser.lastName || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Créé le:</span>
                  <span className="info-value">
                    {new Date(dbUser.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Mis à jour le:</span>
                  <span className="info-value">
                    {new Date(dbUser.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Explication */}
            <div className="explanation">
              <h3>💡 Comment ça fonctionne ?</h3>
              <p>
                <strong>1. Webhook automatique :</strong> Quand vous vous êtes inscrit, 
                Clerk a automatiquement envoyé un événement <code>user.created</code> à 
                notre API <code>/api/webhooks/clerk</code>.
              </p>
              <p style={{ marginTop: '12px' }}>
                <strong>2. Création instantanée :</strong> Notre webhook a reçu l'événement 
                et a créé votre utilisateur dans Supabase en temps réel, sans que vous ayez 
                à écrire de code <code>syncUser()</code>.
              </p>
              <p style={{ marginTop: '12px' }}>
                <strong>3. Mises à jour automatiques :</strong> Si vous modifiez votre profil 
                dans Clerk (nom, email, photo), le webhook <code>user.updated</code> synchronisera 
                automatiquement les changements.
              </p>
            </div>

            {/* Test */}
            <div className="card" style={{ marginTop: '20px' }}>
              <h2>🧪 Tester la synchronisation</h2>
              <div style={{ color: '#718096', marginBottom: '16px' }}>
                <p><strong>Étape 1 :</strong> Ouvrir Prisma Studio</p>
                <pre style={{ 
                  background: '#1f2937', 
                  color: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '6px',
                  margin: '8px 0',
                  overflow: 'auto'
                }}>
                  <code>npx prisma studio</code>
                </pre>
                
                <p style={{ marginTop: '16px' }}><strong>Étape 2 :</strong> Modifier votre profil Clerk</p>
                <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                  <li>Cliquer sur votre avatar en haut à droite</li>
                  <li>Modifier votre prénom ou nom</li>
                  <li>Sauvegarder</li>
                </ul>
                
                <p style={{ marginTop: '16px' }}><strong>Étape 3 :</strong> Vérifier dans Prisma Studio</p>
                <p style={{ fontSize: '14px', marginTop: '4px' }}>
                  Les changements apparaissent <strong>instantanément</strong> dans la base de données !
                </p>
              </div>
            </div>

            {/* Logs webhook */}
            <div className="card" style={{ marginTop: '20px', background: '#f3f4f6' }}>
              <h2>📝 Logs Webhook</h2>
              <p style={{ color: '#718096', marginBottom: '12px' }}>
                Vérifiez la console de votre terminal pour voir les logs du webhook :
              </p>
              <pre style={{ 
                background: '#1f2937', 
                color: '#10b981', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '13px',
                overflow: 'auto'
              }}>
                <code>
{`✅ Webhook reçu: user.created
📦 Clerk User ID: ${dbUser.clerkId}
✅ Utilisateur créé dans la DB: ${dbUser.email}`}
                </code>
              </pre>
            </div>

            {/* Avantages */}
            <div className="explanation" style={{ background: '#dcfce7', border: '1px solid #86efac' }}>
              <h3 style={{ color: '#166534' }}>✨ Avantages de l'approche Webhook</h3>
              <ul style={{ marginLeft: '20px', color: '#15803d' }}>
                <li>✅ <strong>Aucun code répétitif</strong> : Pas de <code>syncUser()</code> partout</li>
                <li>✅ <strong>Temps réel</strong> : Sync instantanée dès qu'un événement se produit</li>
                <li>✅ <strong>Complet</strong> : Gère création, mise à jour ET suppression</li>
                <li>✅ <strong>Fiable</strong> : Clerk garantit la livraison avec retry automatique</li>
                <li>✅ <strong>Architecture moderne</strong> : Event-driven, découplé</li>
              </ul>
            </div>
          </>
        )}
      </SignedIn>
    </div>
  )
}

