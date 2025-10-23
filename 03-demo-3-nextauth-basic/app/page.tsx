import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserButton } from "@/components/UserButton"
import { prisma } from "@/lib/prisma"

export default async function HomePage() {
  // Récupérer la session côté serveur
  const session = await getServerSession(authOptions)

  // Rediriger vers la page de connexion si pas authentifié
  if (!session) {
    redirect("/signin")
  }

  // Récupérer les détails de l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          accounts: true,
          sessions: true,
        }
      }
    }
  })

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Demo 3 : NextAuth + Supabase
          </h1>
          <p className="text-gray-600">
            Authentification avec NextAuth.js et synchronisation Prisma/Supabase
          </p>
        </div>

        {/* User Button */}
        <div className="mb-8">
          <UserButton />
        </div>

        {/* Success Badge */}
        <div className="mb-8 rounded-lg bg-green-50 p-4">
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
              Utilisateur synchronisé avec succès dans Supabase !
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Informations utilisateur
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="font-medium text-gray-700">ID :</span>
              <span className="text-gray-900">{user?.id}</span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="font-medium text-gray-700">Nom :</span>
              <span className="text-gray-900">{user?.name || "-"}</span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="font-medium text-gray-700">Email :</span>
              <span className="text-gray-900">{user?.email}</span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="font-medium text-gray-700">Rôle :</span>
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                {user?.role}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="font-medium text-gray-700">Email vérifié :</span>
              <span className="text-gray-900">
                {user?.emailVerified ? (
                  <span className="text-green-600">✓ Oui</span>
                ) : (
                  <span className="text-gray-500">Non</span>
                )}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="font-medium text-gray-700">Comptes liés :</span>
              <span className="text-gray-900">{user?._count.accounts}</span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="font-medium text-gray-700">Sessions actives :</span>
              <span className="text-gray-900">{user?._count.sessions}</span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="font-medium text-gray-700">Inscrit le :</span>
              <span className="text-gray-900">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>

            <div className="flex justify-between pb-3">
              <span className="font-medium text-gray-700">Dernière mise à jour :</span>
              <span className="text-gray-900">
                {user?.updatedAt && new Date(user.updatedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">
            Comment ça fonctionne ?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>NextAuth.js</strong> gère l'authentification (Google, GitHub, Email/Password)
              </span>
            </li>
            <li className="flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Prisma Adapter</strong> synchronise automatiquement avec Supabase
              </span>
            </li>
            <li className="flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>JWT Strategy</strong> pour des performances optimales
              </span>
            </li>
            <li className="flex items-start">
              <svg className="mr-2 mt-0.5 h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>100% gratuit</strong> et open-source (pas de vendor lock-in)
              </span>
            </li>
          </ul>
        </div>

        {/* Prisma Studio Link */}
        <div className="mt-8 rounded-lg bg-gray-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Voir vos données dans Prisma Studio
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Lancez Prisma Studio pour voir toutes les tables et données :
          </p>
          <pre className="rounded-md bg-gray-900 p-4 text-sm text-gray-100">
            <code>npx prisma studio</code>
          </pre>
          <p className="mt-2 text-sm text-gray-600">
            Puis ouvrez <strong>http://localhost:5555</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

