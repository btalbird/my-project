import type Stripe from "stripe"

import { prisma } from "@/lib/db"

function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const end = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end
  return end ? new Date(end * 1000) : null
}

/** V2 Connect accounts bill via customer_account (acct_...) instead of customer (cus_...). */
export function subscriptionBillingAccountId(subscription: Stripe.Subscription): string | null {
  const v2Account = (subscription as Stripe.Subscription & { customer_account?: string | null })
    .customer_account
  if (typeof v2Account === "string" && v2Account.startsWith("acct_")) {
    return v2Account
  }

  const customer = subscription.customer
  if (typeof customer === "string") return customer
  if (customer && typeof customer === "object" && "id" in customer) return customer.id
  return null
}

export async function upsertCookSubscriptionFromStripe(
  userId: string,
  billingAccountId: string,
  subscription: Stripe.Subscription | null,
) {
  const status = subscription?.status ?? "canceled"
  const currentPeriodEnd = subscription ? subscriptionPeriodEnd(subscription) : null

  return prisma.cookSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: billingAccountId,
      stripeSubscriptionId: subscription?.id ?? null,
      status,
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId: billingAccountId,
      stripeSubscriptionId: subscription?.id ?? null,
      status,
      currentPeriodEnd,
    },
  })
}

export async function syncCookSubscriptionByBillingAccountId(
  billingAccountId: string,
  subscription: Stripe.Subscription | null,
) {
  const byCustomer = await prisma.cookSubscription.findUnique({
    where: { stripeCustomerId: billingAccountId },
    select: { userId: true },
  })
  if (byCustomer) {
    return upsertCookSubscriptionFromStripe(byCustomer.userId, billingAccountId, subscription)
  }

  // V2: subscription.customer_account is the Connect account id — map via CookConnect.
  if (billingAccountId.startsWith("acct_")) {
    const connect = await prisma.cookConnect.findUnique({
      where: { stripeAccountId: billingAccountId },
      select: { userId: true },
    })
    if (connect) {
      return upsertCookSubscriptionFromStripe(connect.userId, billingAccountId, subscription)
    }
  }

  return null
}

/** @deprecated Use syncCookSubscriptionByBillingAccountId */
export const syncCookSubscriptionByCustomerId = syncCookSubscriptionByBillingAccountId
