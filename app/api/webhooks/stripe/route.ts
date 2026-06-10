import type Stripe from "stripe"

import { upsertCookSubscriptionFromStripe, syncCookSubscriptionByCustomerId } from "@/lib/cook-subscription"
import { syncCookConnectByAccountId } from "@/lib/cook-connect"
import { fulfillOrderFromCheckoutSession, markOrderPaymentFailed } from "@/lib/order-payment"
import { getStripe } from "@/lib/stripe"

export const runtime = "nodejs"

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id

  if (userId) {
    return upsertCookSubscriptionFromStripe(userId, customerId, subscription)
  }
  return syncCookSubscriptionByCustomerId(customerId, subscription)
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return Response.json({ error: "Webhook not configured" }, { status: 500 })
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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === "subscription") {
        const userId = session.metadata?.userId
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id

        if (!userId || !customerId) break

        let subscription: Stripe.Subscription | null = null
        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId)
        }

        await upsertCookSubscriptionFromStripe(userId, customerId, subscription)
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
        typeof subscriptionRef === "string"
          ? subscriptionRef
          : subscriptionRef?.id ?? null
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
