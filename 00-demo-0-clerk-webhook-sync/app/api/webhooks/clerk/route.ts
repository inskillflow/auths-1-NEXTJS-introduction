import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Webhook Clerk : Synchronisation automatique avec Supabase
 * 
 * Événements gérés :
 * - user.created : Créer l'utilisateur dans la DB
 * - user.updated : Mettre à jour l'utilisateur
 * - user.deleted : Supprimer l'utilisateur
 */
export async function POST(req: Request) {
  // Récupérer le secret webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET manquant')
  }

  // Récupérer les headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Vérifier que tous les headers sont présents
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Headers manquants', { status: 400 })
  }

  // Récupérer le body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Créer une nouvelle instance Svix avec le secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Vérifier la signature
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('❌ Erreur de vérification webhook:', err)
    return new Response('Signature invalide', { status: 400 })
  }

  // Récupérer les données
  const { id } = evt.data
  const eventType = evt.type

  console.log(`✅ Webhook reçu: ${eventType}`)
  console.log(`📦 Clerk User ID: ${id}`)

  try {
    // Gérer les différents types d'événements
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data

        // Créer l'utilisateur dans la base de données
        const user = await prisma.user.create({
          data: {
            clerkId: id,
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
          },
        })

        console.log(`✅ Utilisateur créé dans la DB: ${user.email}`)
        break
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data

        // Mettre à jour l'utilisateur
        const user = await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
          },
        })

        console.log(`✅ Utilisateur mis à jour: ${user.email}`)
        break
      }

      case 'user.deleted': {
        const { id } = evt.data

        // Supprimer l'utilisateur
        await prisma.user.delete({
          where: { clerkId: id },
        })

        console.log(`✅ Utilisateur supprimé: ${id}`)
        break
      }

      default:
        console.log(`⚠️  Événement non géré: ${eventType}`)
    }

    return Response.json({ success: true, event: eventType })
  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error)
    return new Response('Erreur serveur', { status: 500 })
  }
}

