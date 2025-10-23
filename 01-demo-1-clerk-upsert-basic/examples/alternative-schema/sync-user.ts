// lib/sync-user.ts
// VERSION ALTERNATIVE avec ID = ClerkId

import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

/**
 * Synchronise l'utilisateur Clerk avec la base de données Prisma
 * Version avec ID = ClerkId directement
 */
export async function syncUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('Utilisateur sans email')
  }

  // Upsert avec l'ID Clerk comme clé primaire
  const user = await prisma.user.upsert({
    where: {
      id: clerkUser.id,  // ← Différence principale : on utilise "id" au lieu de "clerkId"
    },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      id: clerkUser.id,  // ← On fournit l'ID manuellement (pas de @default)
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  })

  return user
}

