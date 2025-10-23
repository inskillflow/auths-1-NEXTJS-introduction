import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // ============================================
  // ADAPTER PRISMA (Synchronisation automatique)
  // ============================================
  adapter: PrismaAdapter(prisma),
  
  // ============================================
  // STRATÉGIE DE SESSION
  // ============================================
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // ============================================
  // PAGES PERSONNALISÉES
  // ============================================
  pages: {
    signIn: '/signin',
  },

  // ============================================
  // PROVIDERS D'AUTHENTIFICATION
  // ============================================
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // Email + Password (Credentials)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.hashedPassword) {
          throw new Error("Email ou mot de passe incorrect")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    }),
  ],

  // ============================================
  // CALLBACKS (Personnalisation)
  // ============================================
  callbacks: {
    async jwt({ token, user, account }) {
      // À la première connexion
      if (user) {
        token.id = user.id
        token.role = user.role || "user"
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Logique personnalisée après la connexion
      // Par exemple : créer des cours d'exemple
      return true
    },
  },

  // ============================================
  // EVENTS (Logging et actions)
  // ============================================
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`✅ User signed in: ${user.email}`)
      
      if (isNewUser) {
        console.log(`🆕 New user registered: ${user.email}`)
        
        // Créer des cours d'exemple pour les nouveaux utilisateurs
        try {
          await prisma.course.createMany({
            data: [
              {
                title: "Introduction à Next.js 14",
                description: "Apprenez les bases de Next.js 14 avec App Router, Server Components, Server Actions et plus encore. Ce cours couvre tous les fondamentaux nécessaires pour créer des applications web modernes.",
                category: "programming",
                level: "beginner",
                price: 0,
                published: true,
                instructorId: user.id,
              },
              {
                title: "TypeScript Avancé",
                description: "Maîtrisez les types avancés, génériques, conditional types, et patterns en TypeScript. Parfait pour les développeurs qui veulent passer au niveau supérieur.",
                category: "programming",
                level: "advanced",
                price: 49.99,
                published: false,
                instructorId: user.id,
              }
            ]
          })
          console.log(`📚 Created sample courses for ${user.email}`)
        } catch (error) {
          console.error('Error creating sample courses:', error)
        }
      }
    },
  },

  // ============================================
  // DEBUG
  // ============================================
  debug: process.env.NODE_ENV === "development",
}

