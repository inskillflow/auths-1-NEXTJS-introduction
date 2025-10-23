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
    strategy: "jwt",  // JWT = plus rapide, serverless-friendly
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // ============================================
  // PAGES PERSONNALISÉES
  // ============================================
  pages: {
    signIn: '/signin',      // Page de connexion personnalisée
    // signOut: '/signout',
    // error: '/error',
    // verifyRequest: '/verify-request',
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
        // Validation
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        // Chercher l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.hashedPassword) {
          throw new Error("Email ou mot de passe incorrect")
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect")
        }

        // Retourner l'utilisateur
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
    // Callback JWT : Ajouter des données personnalisées au token
    async jwt({ token, user, account, profile }) {
      // À la première connexion, ajouter les infos de l'utilisateur au token
      if (user) {
        token.id = user.id
        token.role = user.role || "user"
      }
      return token
    },

    // Callback Session : Ajouter des données à la session côté client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },

    // Callback SignIn : Logique personnalisée à la connexion
    async signIn({ user, account, profile }) {
      // Vous pouvez ajouter de la logique ici
      // Par exemple : vérifier si l'email est autorisé
      
      // const allowedDomains = ["example.com"]
      // if (!user.email?.endsWith("@example.com")) {
      //   return false
      // }
      
      return true
    },
  },

  // ============================================
  // EVENTS (Logging et synchronisation)
  // ============================================
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`✅ User signed in: ${user.email}`)
      
      // Logique personnalisée pour les nouveaux utilisateurs
      if (isNewUser) {
        console.log(`🆕 New user registered: ${user.email}`)
        // Vous pouvez envoyer un email de bienvenue ici
      }
    },
    
    async signOut({ session, token }) {
      console.log(`👋 User signed out`)
    },
  },

  // ============================================
  // DEBUG (Développement uniquement)
  // ============================================
  debug: process.env.NODE_ENV === "development",
}

