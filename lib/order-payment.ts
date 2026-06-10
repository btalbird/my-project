import type Stripe from "stripe"

import { prisma } from "@/lib/db"

export async function fulfillOrderFromCheckoutSession(session: Stripe.Checkout.Session) {
  const orderIdRaw = session.metadata?.orderId
  const orderId = orderIdRaw ? Number.parseInt(orderIdRaw, 10) : NaN
  if (!Number.isFinite(orderId)) return null

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, paymentStatus: true },
  })
  if (!existing) return null
  if (existing.paymentStatus === "paid") return existing

  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "paid",
      status: "preparing",
      stripeCheckoutSessionId: session.id,
      ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
    },
  })
}

export async function markOrderPaymentFailed(orderId: number) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  })
  if (!existing || existing.paymentStatus === "paid") return null

  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "failed",
      status: "cancelled",
    },
  })
}
