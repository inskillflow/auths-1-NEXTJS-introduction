// app/api/webhooks/clerk/route.ts
// Exemple de synchronisation avec Webhooks Clerk

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  // Récupérer le webhook secret
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('WEBHOOK_SECRET manquant dans .env')
  }

  // Récupérer les headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Headers manquants', { status: 400 })
  }

  // Récupérer le body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Vérifier la signature
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Erreur vérification webhook:', err)
    return new Response('Signature invalide', { status: 400 })
  }

  // Gérer les événements
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0]?.email_address || '',
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      },
    })

    console.log(`✅ Utilisateur créé: ${id}`)
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: email_addresses[0]?.email_address || '',
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      },
    })

    console.log(`✅ Utilisateur mis à jour: ${id}`)
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (id) {
      await prisma.user.delete({
        where: { clerkId: id },
      })

      console.log(`✅ Utilisateur supprimé: ${id}`)
    }
  }

  return new Response('OK', { status: 200 })
}

