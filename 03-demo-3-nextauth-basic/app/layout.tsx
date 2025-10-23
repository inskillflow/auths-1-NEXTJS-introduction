import { SessionProvider } from '@/components/SessionProvider'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo 3 : NextAuth + Supabase',
  description: 'Authentification avec NextAuth.js et Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

