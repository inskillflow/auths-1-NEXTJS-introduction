import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

/**
 * Synchronise l'utilisateur Clerk avec la base de données Prisma
 * Utilise upsert pour créer ou mettre à jour l'utilisateur
 */
export async function syncUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Récupère le premier email (Clerk peut avoir plusieurs emails)
  const email = clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('Utilisateur sans email')
  }

  // Upsert : crée l'utilisateur s'il n'existe pas, sinon le met à jour
  const user = await prisma.user.upsert({
    where: {
      clerkId: clerkUser.id,
    },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  })

  return user
}

