"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"
import { revalidatePath } from "next/cache"

/**
 * Récupérer l'utilisateur courant avec ses cours
 */
export async function getCurrentUserWithCourses() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      courses: {
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          courses: true,
          sessions: true,
        }
      }
    }
  })

  return user
}

/**
 * Créer un nouveau cours
 */
export async function createCourse(data: {
  title: string
  description?: string
  category: string
  level?: string
  price?: number
  published?: boolean
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié")
  }

  const course = await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level || "beginner",
      price: data.price || 0,
      published: data.published || false,
      instructorId: session.user.id,
    }
  })

  revalidatePath('/')
  return course
}

/**
 * Mettre à jour un cours
 */
export async function updateCourse(
  courseId: string,
  data: {
    title?: string
    description?: string
    category?: string
    level?: string
    price?: number
    published?: boolean
  }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié")
  }

  // Vérifier que le cours appartient à l'utilisateur
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course || course.instructorId !== session.user.id) {
    throw new Error("Non autorisé")
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data
  })

  revalidatePath('/')
  return updatedCourse
}

/**
 * Supprimer un cours
 */
export async function deleteCourse(courseId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié")
  }

  // Vérifier que le cours appartient à l'utilisateur
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course || course.instructorId !== session.user.id) {
    throw new Error("Non autorisé")
  }

  await prisma.course.delete({
    where: { id: courseId }
  })

  revalidatePath('/')
  return { success: true }
}

/**
 * Publier/dépublier un cours
 */
export async function toggleCoursePublished(courseId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié")
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course || course.instructorId !== session.user.id) {
    throw new Error("Non autorisé")
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: { published: !course.published }
  })

  revalidatePath('/')
  return updatedCourse
}

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateUserProfile(data: {
  name?: string
  bio?: string
  phoneNumber?: string
  website?: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié")
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data
  })

  revalidatePath('/')
  return user
}

