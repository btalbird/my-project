import type Stripe from "stripe"

import { prisma } from "@/lib/db"
import type { V2ConnectStatus } from "@/lib/stripe-connect-v2"

export type CookConnectSnapshot = {
  stripeAccountId: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
}

/** Legacy V1 Express snapshot — kept for webhook backward compatibility. */
export function snapshotFromStripeAccount(account: Stripe.Account): CookConnectSnapshot {
  return {
    stripeAccountId: account.id,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
  }
}

export function snapshotFromV2Status(status: V2ConnectStatus): CookConnectSnapshot {
  return {
    stripeAccountId: status.stripeAccountId,
    chargesEnabled: status.chargesEnabled,
    payoutsEnabled: status.payoutsEnabled,
    detailsSubmitted: status.detailsSubmitted,
  }
}

/** Persist user ↔ Connect account mapping (account id only; status is refreshed from Stripe). */
export async function upsertCookConnectMapping(userId: string, stripeAccountId: string) {
  return prisma.cookConnect.upsert({
    where: { userId },
    create: {
      userId,
      stripeAccountId,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    },
    update: {
      stripeAccountId,
    },
  })
}

export async function upsertCookConnectFromV2Status(userId: string, status: V2ConnectStatus) {
  const snap = snapshotFromV2Status(status)
  return prisma.cookConnect.upsert({
    where: { userId },
    create: { userId, ...snap },
    update: snap,
  })
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

export async function syncCookConnectByV2AccountId(stripeAccountId: string, status: V2ConnectStatus) {
  const existing = await prisma.cookConnect.findUnique({
    where: { stripeAccountId },
    select: { userId: true },
  })
  if (!existing) return null
  return upsertCookConnectFromV2Status(existing.userId, status)
}

export function isCookConnectReady(connect: CookConnectSnapshot | null | undefined): boolean {
  return Boolean(connect?.chargesEnabled && connect.detailsSubmitted)
}
