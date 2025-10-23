import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { syncUser, createSampleCourses } from '@/lib/sync-user'

export default async function Home() {
  let user = null
  let error = null

  try {
    // Synchronisation automatique
    user = await syncUser()
    
    // Créer des cours d'exemple si c'est la première connexion
    if (user && user.courses.length === 0) {
      await createSampleCourses(user.id)
      // Recharger l'utilisateur avec ses cours
      user = await syncUser()
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Erreur de synchronisation'
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>Demo 2 : Relations User ↔ Course</h1>
            <p style={{ color: '#718096', marginTop: '8px' }}>
              Approche : ID = ClerkId directement
            </p>
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>

      <SignedOut>
        <div className="sign-in-prompt">
          <h2>Bienvenue sur la Demo 2</h2>
          <p>
            Ce projet démontre une synchronisation Clerk → Prisma avec :<br/>
            • ID = ClerkId (pas de @default)<br/>
            • Deux tables avec relation (User ↔ Course)<br/>
            • Attributs enrichis
          </p>
          <div className="clerk-btn">
            <SignInButton mode="modal">
              <button>Se connecter</button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {error ? (
          <div className="card" style={{ background: '#fee2e2' }}>
            <h2 style={{ color: '#991b1b' }}>Erreur</h2>
            <p style={{ color: '#7f1d1d' }}>{error}</p>
          </div>
        ) : user ? (
          <>
            <div className="badge">
              Utilisateur synchronisé avec succès
            </div>

            <div className="grid" style={{ marginTop: '20px' }}>
              {/* Carte Utilisateur */}
              <div className="card">
                <h2>Profil Utilisateur</h2>
                {user.imageUrl && (
                  <img src={user.imageUrl} alt="Avatar" className="avatar" />
                )}
                
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">ID (Clerk):</span>
                    <span className="info-value" title={user.id}>
                      {user.id.substring(0, 20)}...
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nom complet:</span>
                    <span className="info-value">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Rôle:</span>
                    <span className={`user-role ${user.role}`}>
                      {user.role}
                    </span>
                  </div>
                  {user.bio && (
                    <div className="info-row">
                      <span className="info-label">Bio:</span>
                      <span className="info-value">{user.bio}</span>
                    </div>
                  )}
                  {user.phoneNumber && (
                    <div className="info-row">
                      <span className="info-label">Téléphone:</span>
                      <span className="info-value">{user.phoneNumber}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="info-row">
                      <span className="info-label">Site web:</span>
                      <span className="info-value">{user.website}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Inscrit le:</span>
                    <span className="info-value">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="stats">
                  <div className="stat-item">
                    <div className="stat-number">{user.courses.length}</div>
                    <div className="stat-label">Cours créés</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {user.courses.filter(c => c.published).length}
                    </div>
                    <div className="stat-label">Publiés</div>
                  </div>
                </div>
              </div>

              {/* Carte Cours */}
              <div className="card">
                <h2>Mes Cours ({user.courses.length})</h2>
                
                {user.courses.length === 0 ? (
                  <div className="no-courses">
                    <p>Aucun cours pour le moment</p>
                    <p style={{ marginTop: '8px', fontSize: '12px' }}>
                      Utilisez Prisma Studio pour créer des cours
                    </p>
                  </div>
                ) : (
                  <div>
                    {user.courses.map((course) => (
                      <div key={course.id} className="course-item">
                        <h3>{course.title}</h3>
                        {course.description && (
                          <p>{course.description.substring(0, 100)}...</p>
                        )}
                        <div className="course-meta">
                          <span className="course-tag">
                            {course.category}
                          </span>
                          <span className="course-tag level">
                            {course.level}
                          </span>
                          <span className="course-tag price">
                            {parseFloat(course.price.toString()) === 0 
                              ? 'Gratuit' 
                              : `${course.price} €`}
                          </span>
                          {!course.published && (
                            <span className="course-tag draft">
                              Brouillon
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Explication */}
            <div className="explanation">
              <h3>Comment ça fonctionne ?</h3>
              <p>
                <strong>1. ID = ClerkId :</strong> L'ID de l'utilisateur dans la base de données 
                est directement l'ID Clerk (ex: <code>{user.id.substring(0, 25)}...</code>). 
                Pas besoin de champ <code>clerkId</code> séparé.
              </p>
              <p style={{ marginTop: '8px' }}>
                <strong>2. Relation :</strong> Chaque cours (<code>Course</code>) a un 
                <code>instructorId</code> qui pointe vers <code>User.id</code>. 
                Un utilisateur peut créer plusieurs cours.
              </p>
              <p style={{ marginTop: '8px' }}>
                <strong>3. Attributs enrichis :</strong> Le modèle User contient des champs 
                supplémentaires comme <code>role</code>, <code>bio</code>, 
                <code>phoneNumber</code>, etc.
              </p>
            </div>

            {/* Instructions */}
            <div className="card" style={{ marginTop: '20px' }}>
              <h2>Pour créer plus de cours</h2>
              <p style={{ color: '#718096', marginBottom: '16px' }}>
                Utilisez Prisma Studio pour ajouter des cours :
              </p>
              <pre style={{ 
                background: '#1f2937', 
                color: '#f3f4f6', 
                padding: '16px', 
                borderRadius: '8px',
                overflow: 'auto'
              }}>
                <code>npx prisma studio</code>
              </pre>
              <p style={{ color: '#718096', marginTop: '12px', fontSize: '14px' }}>
                Puis allez dans la table <strong>courses</strong> et créez un nouveau cours 
                avec <code>instructorId = {user.id.substring(0, 15)}...</code>
              </p>
            </div>
          </>
        ) : null}
      </SignedIn>
    </div>
  )
}

