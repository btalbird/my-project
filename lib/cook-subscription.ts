import type Stripe from "stripe"

import { prisma } from "@/lib/db"

function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const end = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end
  return end ? new Date(end * 1000) : null
}

export async function upsertCookSubscriptionFromStripe(
  userId: string,
  stripeCustomerId: string,
  subscription: Stripe.Subscription | null,
) {
  const status = subscription?.status ?? "canceled"
  const currentPeriodEnd = subscription ? subscriptionPeriodEnd(subscription) : null

  return prisma.cookSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId: subscription?.id ?? null,
      status,
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId: subscription?.id ?? null,
      status,
      currentPeriodEnd,
    },
  })
}

export async function syncCookSubscriptionByCustomerId(
  stripeCustomerId: string,
  subscription: Stripe.Subscription | null,
) {
  const existing = await prisma.cookSubscription.findUnique({
    where: { stripeCustomerId },
    select: { userId: true },
  })
  if (!existing) return null
  return upsertCookSubscriptionFromStripe(existing.userId, stripeCustomerId, subscription)
}
