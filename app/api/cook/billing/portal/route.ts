import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { getAppBaseUrl, getStripe } from "@/lib/stripe"

export async function POST() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subscription = await prisma.cookSubscription.findUnique({
    where: { userId: auth.user.id },
    select: { stripeCustomerId: true },
  })

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 })
  }

  const stripe = getStripe()
  const baseUrl = getAppBaseUrl()

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${baseUrl}/for-cooks/cook-dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
