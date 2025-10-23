import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// NextAuth Route Handler
const handler = NextAuth(authOptions)

// Export pour les méthodes GET et POST
export { handler as GET, handler as POST }

