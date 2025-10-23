import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo 0 : Clerk + Webhook',
  description: 'Synchronisation automatique via webhooks',
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

