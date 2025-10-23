"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

/**
 * Provider de session NextAuth
 * Wrapper client pour utiliser NextAuth dans les composants
 */
export function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}

