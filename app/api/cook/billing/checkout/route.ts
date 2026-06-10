import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { getAppBaseUrl, getListingPriceId, getStripe } from "@/lib/stripe"

export async function POST() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const { user } = auth
  const stripe = getStripe()
  const priceId = getListingPriceId()
  const baseUrl = getAppBaseUrl()

  let subscription = await prisma.cookSubscription.findUnique({
    where: { userId: user.id },
  })

  let customerId = subscription?.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    })
    customerId = customer.id
    subscription = await prisma.cookSubscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeCustomerId: customerId,
        status: "incomplete",
      },
      update: {
        stripeCustomerId: customerId,
      },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
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
