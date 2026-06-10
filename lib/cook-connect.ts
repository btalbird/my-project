import type Stripe from "stripe"

import { prisma } from "@/lib/db"

export type CookConnectSnapshot = {
  stripeAccountId: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
}

export function snapshotFromStripeAccount(account: Stripe.Account): CookConnectSnapshot {
  return {
    stripeAccountId: account.id,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
  }
}

export async function upsertCookConnectFromAccount(userId: string, account: Stripe.Account) {
  const snap = snapshotFromStripeAccount(account)
  return prisma.cookConnect.upsert({
    where: { userId },
    create: { userId, ...snap },
    update: snap,
  })
}

export async function syncCookConnectByAccountId(account: Stripe.Account) {
  const existing = await prisma.cookConnect.findUnique({
    where: { stripeAccountId: account.id },
    select: { userId: true },
  })
  if (!existing) return null
  return upsertCookConnectFromAccount(existing.userId, account)
}

export function isCookConnectReady(connect: CookConnectSnapshot | null | undefined): boolean {
  return Boolean(connect?.chargesEnabled && connect.detailsSubmitted)
}
