"use client"

import { signOut, useSession } from "next-auth/react"

/**
 * Bouton utilisateur avec avatar et déconnexion
 */
export function UserButton() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      {/* Avatar */}
      {session.user.image ? (
        <img
          src={session.user.image}
          alt={session.user.name || "User"}
          className="h-12 w-12 rounded-full border-2 border-blue-500"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
        </div>
      )}

      {/* Info utilisateur */}
      <div className="flex-1">
        {session.user.name && (
          <p className="font-medium text-gray-900">{session.user.name}</p>
        )}
        <p className="text-sm text-gray-500">{session.user.email}</p>
        {session.user.role && (
          <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
            {session.user.role}
          </span>
        )}
      </div>

      {/* Bouton déconnexion */}
      <button
        onClick={() => signOut({ callbackUrl: "/signin" })}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Déconnexion
      </button>
    </div>
  )
}

