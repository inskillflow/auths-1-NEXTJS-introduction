import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo 2 : Clerk + Relations',
  description: 'Projet démo avec ID=ClerkId et relations User↔Course',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}

