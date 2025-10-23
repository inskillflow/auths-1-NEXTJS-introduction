"use client"

import { signOut } from "next-auth/react"

interface UserProfileProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    bio?: string | null
    phoneNumber?: string | null
    website?: string | null
    createdAt: Date
    _count: {
      courses: number
      sessions: number
    }
  }
  coursesCount: {
    total: number
    published: number
    draft: number
  }
}

export function UserProfile({ user, coursesCount }: UserProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profil Utilisateur</h2>
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
        >
          Déconnexion
        </button>
      </div>

      {/* Avatar et nom */}
      <div className="flex items-center gap-4 mb-6">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-20 h-20 rounded-full border-2 border-blue-500"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{user.name || "Sans nom"}</h3>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            {user.role}
          </span>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="font-medium text-gray-700">ID :</span>
          <span className="text-gray-900 text-sm" title={user.id}>
            {user.id.substring(0, 15)}...
          </span>
        </div>

        {user.bio && (
          <div className="py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700 block mb-1">Bio :</span>
            <p className="text-gray-900 text-sm">{user.bio}</p>
          </div>
        )}

        {user.phoneNumber && (
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Téléphone :</span>
            <span className="text-gray-900">{user.phoneNumber}</span>
          </div>
        )}

        {user.website && (
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Site web :</span>
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {user.website}
            </a>
          </div>
        )}

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="font-medium text-gray-700">Sessions actives :</span>
          <span className="text-gray-900">{user._count.sessions}</span>
        </div>

        <div className="flex justify-between py-2">
          <span className="font-medium text-gray-700">Inscrit le :</span>
          <span className="text-gray-900">
            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{coursesCount.total}</div>
          <div className="text-sm text-gray-600">Cours créés</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{coursesCount.published}</div>
          <div className="text-sm text-gray-600">Publiés</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{coursesCount.draft}</div>
          <div className="text-sm text-gray-600">Brouillons</div>
        </div>
      </div>
    </div>
  )
}

