import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { syncUser } from '@/lib/sync-user'

export default async function Home() {
  let syncedUser = null
  let error = null

  try {
    // Synchronisation automatique à chaque visite de la page
    syncedUser = await syncUser()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Erreur de synchronisation'
  }

  return (
    <div className="container">
      <h1>🔄 Clerk + Prisma Sync</h1>

      <SignedOut>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ marginBottom: '20px', color: '#4a5568' }}>
            Connectez-vous pour voir la synchronisation en action
          </p>
          <div className="clerk-component">
            <SignInButton mode="modal">
              <button style={{
                background: '#667eea',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Se connecter
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <UserButton afterSignOutUrl="/" />
        </div>

        {error ? (
          <div className="error-badge">❌ {error}</div>
        ) : syncedUser ? (
          <>
            <div className="success-badge">
              ✅ Utilisateur synchronisé avec succès !
            </div>

            <div className="user-card">
              <h2>📊 Données dans Supabase</h2>
              {syncedUser.imageUrl && (
                <img src={syncedUser.imageUrl} alt="Avatar" className="avatar" />
              )}
              <div className="user-info">
                <div className="info-row">
                  <span className="info-label">ID Prisma:</span>
                  <span className="info-value">{syncedUser.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Clerk ID:</span>
                  <span className="info-value">{syncedUser.clerkId}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{syncedUser.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Prénom:</span>
                  <span className="info-value">{syncedUser.firstName || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nom:</span>
                  <span className="info-value">{syncedUser.lastName || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Créé le:</span>
                  <span className="info-value">
                    {new Date(syncedUser.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Mis à jour:</span>
                  <span className="info-value">
                    {new Date(syncedUser.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ 
              background: '#edf2f7', 
              padding: '16px', 
              borderRadius: '8px',
              marginTop: '20px',
              fontSize: '14px',
              color: '#4a5568'
            }}>
              <strong>💡 Comment ça marche ?</strong>
              <p style={{ marginTop: '8px' }}>
                À chaque chargement de cette page, la fonction <code>syncUser()</code> 
                vérifie si votre utilisateur Clerk existe dans Supabase. Si non, il le crée. 
                Si oui, il met à jour les informations.
              </p>
            </div>
          </>
        ) : null}
      </SignedIn>
    </div>
  )
}

