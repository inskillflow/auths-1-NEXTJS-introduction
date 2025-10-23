import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

/**
 * API d'inscription
 * POST /api/auth/signup
 */
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Hasher le mot de passe (12 rounds = bon équilibre sécurité/performance)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    console.log(`✅ New user created: ${user.email}`)

    return NextResponse.json({
      message: "Compte créé avec succès",
      user
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    )
  }
}

