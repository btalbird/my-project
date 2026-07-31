import type Stripe from "stripe"

import {
  subscriptionBillingAccountId,
  syncCookSubscriptionByBillingAccountId,
  upsertCookSubscriptionFromStripe,
} from "@/lib/cook-subscription"
import { syncCookConnectByAccountId } from "@/lib/cook-connect"
import { prisma } from "@/lib/db"
import { fulfillOrderFromCheckoutSession, markOrderPaymentFailed } from "@/lib/order-payment"
import { getStandardWebhookSecret, getStripe } from "@/lib/stripe"

export const runtime = "nodejs"

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const billingAccountId = subscriptionBillingAccountId(subscription)

  if (!billingAccountId) return null

  if (userId) {
    return upsertCookSubscriptionFromStripe(userId, billingAccountId, subscription)
  }
  return syncCookSubscriptionByBillingAccountId(billingAccountId, subscription)
}

/**
 * Standard (snapshot) Stripe webhooks — checkout, subscriptions, invoices.
 * Configure in Dashboard → Webhooks → Your platform endpoint.
 */
export async function POST(req: Request) {
  let webhookSecret: string
  try {
    webhookSecret = getStandardWebhookSecret()
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Webhook not configured" },
      { status: 500 },
    )
  }

  const stripe = getStripe()
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    await prisma.stripeWebhookEvent.create({ data: { id: event.id } })
  } catch {
    return Response.json({ received: true, duplicate: true })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === "subscription") {
        const userId = session.metadata?.userId
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id

        if (!userId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const billingAccountId = subscriptionBillingAccountId(subscription)
        if (!billingAccountId) break

        await upsertCookSubscriptionFromStripe(userId, billingAccountId, subscription)
        break
      }

      if (session.mode === "payment" && session.metadata?.type === "food_order") {
        await fulfillOrderFromCheckoutSession(session)
      }
      break
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.metadata?.type !== "food_order") break
      const orderId = session.metadata.orderId
      if (!orderId) break
      await markOrderPaymentFailed(Number.parseInt(orderId, 10))
      break
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionEvent(subscription)
      break
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionRef = (invoice as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null
      }).subscription
      const subscriptionId =
        typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id ?? null
      if (!subscriptionId) break
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      await handleSubscriptionEvent(subscription)
      break
    }
    case "account.updated": {
      const account = event.data.object as Stripe.Account
      await syncCookConnectByAccountId(account)
      break
    }
    default:
      break
  }

  return Response.json({ received: true })
}
