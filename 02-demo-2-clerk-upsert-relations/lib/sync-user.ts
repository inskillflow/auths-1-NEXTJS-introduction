import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

/**
 * Synchronise l'utilisateur Clerk avec la base de données Prisma
 * VERSION : ID = ClerkId (pas de clerkId séparé)
 */
export async function syncUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Récupère le premier email
  const email = clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('Utilisateur sans email')
  }

  // Upsert : utilise l'ID Clerk directement comme clé primaire
  const user = await prisma.user.upsert({
    where: {
      id: clerkUser.id,  // Différence principale : on utilise "id" au lieu de "clerkId"
    },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      // On ne met pas à jour le role pour ne pas écraser un rôle admin
    },
    create: {
      id: clerkUser.id,  // On fournit l'ID manuellement (pas de @default)
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: 'user',  // Rôle par défaut à la création
    },
    include: {
      courses: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10  // Limite à 10 cours récents
      }
    }
  })

  return user
}

/**
 * Crée des cours d'exemple pour un utilisateur (pour la démo)
 */
export async function createSampleCourses(userId: string) {
  // Vérifier si l'utilisateur a déjà des cours
  const existingCourses = await prisma.course.count({
    where: { instructorId: userId }
  })

  if (existingCourses > 0) {
    return // Ne pas créer de cours d'exemple si l'utilisateur en a déjà
  }

  // Créer 2 cours d'exemple
  await prisma.course.createMany({
    data: [
      {
        title: "Introduction à Next.js 14",
        description: "Apprenez les bases de Next.js 14 avec App Router, Server Components et plus encore.",
        category: "programming",
        level: "beginner",
        price: 0,
        published: true,
        instructorId: userId,
      },
      {
        title: "TypeScript Avancé",
        description: "Maîtrisez les types avancés, génériques, et patterns en TypeScript.",
        category: "programming",
        level: "advanced",
        price: 49.99,
        published: false,
        instructorId: userId,
      }
    ]
  })
}

