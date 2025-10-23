import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getCurrentUserWithCourses } from "@/lib/actions"
import { UserProfile } from "@/components/UserProfile"
import { CourseList } from "@/components/CourseList"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const user = await getCurrentUserWithCourses()

  if (!user) {
    redirect("/signin")
  }

  const coursesCount = {
    total: user.courses.length,
    published: user.courses.filter(c => c.published).length,
    draft: user.courses.filter(c => !c.published).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Demo 4 : NextAuth + Entités Enrichies
          </h1>
          <p className="text-gray-600">
            Architecture complète : NextAuth + User enrichi + Course + Relations
          </p>
        </div>

        {/* Success Badge */}
        <div className="mb-8 rounded-lg bg-green-50 p-4 shadow-md">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm font-medium text-green-800">
              Utilisateur synchronisé automatiquement avec Supabase !
            </p>
          </div>
        </div>

        {/* Grid Profil + Cours */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profil */}
          <UserProfile user={user} coursesCount={coursesCount} />

          {/* Cours */}
          <CourseList courses={user.courses} />
        </div>

        {/* Explanation */}
        <div className="mt-8 rounded-lg bg-blue-50 p-6 shadow-md">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">
            Comment ça fonctionne ?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Synchronisation automatique</strong> : PrismaAdapter sync les users avec Supabase automatiquement
              </span>
            </li>
            <li className="flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>User enrichi</strong> : Champs NextAuth + personnalisés (role, bio, phone, website)
              </span>
            </li>
            <li className="flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Relations Prisma</strong> : User (1) → Courses (N) avec onDelete: Cascade
              </span>
            </li>
            <li className="flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Cours d'exemple</strong> : 2 cours créés automatiquement à la première connexion
              </span>
            </li>
            <li className="flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Server Actions</strong> : CRUD complet sur les cours (créer, modifier, supprimer, publier)
              </span>
            </li>
          </ul>
        </div>

        {/* Prisma Studio */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Explorer la base de données
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Lancez Prisma Studio pour voir toutes les tables et leurs relations :
          </p>
          <pre className="mb-4 overflow-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100">
            <code>npx prisma studio</code>
          </pre>
          <p className="text-sm text-gray-600">
            Vous verrez 6 tables : <strong>users</strong>, <strong>courses</strong>, <strong>accounts</strong>, 
            <strong>sessions</strong>, <strong>verification_tokens</strong>
          </p>
        </div>

        {/* Comparaison */}
        <div className="mt-8 rounded-lg bg-purple-50 p-6 shadow-md">
          <h3 className="mb-3 text-lg font-semibold text-purple-900">
            Demo-4 vs Demo-2 (Clerk)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold text-purple-800">Demo-2 (Clerk)</h4>
              <ul className="space-y-1 text-sm text-purple-700">
                <li>• Auth : Clerk (SaaS)</li>
                <li>• Sync : Manuel (upsert)</li>
                <li>• Tables : 2 (User + Course)</li>
                <li>• Coût : $0 → $225/mois</li>
                <li>• UI : Fournie par Clerk</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-purple-800">Demo-4 (NextAuth)</h4>
              <ul className="space-y-1 text-sm text-purple-700">
                <li>• Auth : NextAuth (Open-source)</li>
                <li>• Sync : <strong>Automatique</strong></li>
                <li>• Tables : 6 (NextAuth + Course)</li>
                <li>• Coût : <strong>$0 toujours</strong></li>
                <li>• UI : Personnalisée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

