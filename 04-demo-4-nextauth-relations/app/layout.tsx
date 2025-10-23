import { SessionProvider } from '@/components/SessionProvider'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo 4 : NextAuth + Entités Enrichies',
  description: 'Architecture complète avec NextAuth, User enrichi et Course',
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

