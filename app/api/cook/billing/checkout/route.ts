import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { getAppBaseUrl, getListingPriceId, getStripe } from "@/lib/stripe"

/**
 * Cook listing subscription checkout (platform → cook).
 * V2 Connect: bill the connected account directly via customer_account.
 */
export async function POST() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const { user } = auth

  let stripeClient: ReturnType<typeof getStripe>
  let priceId: string
  try {
    stripeClient = getStripe()
    priceId = getListingPriceId()
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe billing is not configured" },
      { status: 500 },
    )
  }

  const connect = await prisma.cookConnect.findUnique({
    where: { userId: user.id },
    select: { stripeAccountId: true },
  })

  if (!connect?.stripeAccountId) {
    return NextResponse.json(
      { error: "Complete Stripe Connect onboarding before subscribing." },
      { status: 400 },
    )
  }

  const baseUrl = getAppBaseUrl()

  const session = await stripeClient.checkout.sessions.create({
    // V2: connected account id acts as the billing customer.
    customer_account: connect.stripeAccountId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/for-cooks/cook-dashboard?subscribed=1`,
    cancel_url: `${baseUrl}/for-cooks/cook-dashboard?subscribed=0`,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id },
    },
  })

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }

  return NextResponse.json({ url: session.url })
}
