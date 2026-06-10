import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { getAppBaseUrl, getStripe } from "@/lib/stripe"

export async function POST() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const connect = await prisma.cookConnect.findUnique({
    where: { userId: auth.user.id },
    select: { stripeAccountId: true, chargesEnabled: true },
  })

  if (!connect?.stripeAccountId) {
    return NextResponse.json({ error: "Connect Stripe first" }, { status: 400 })
  }

  if (!connect.chargesEnabled) {
    return NextResponse.json({ error: "Stripe account not ready for payouts yet" }, { status: 400 })
  }

  const stripe = getStripe()
  const loginLink = await stripe.accounts.createLoginLink(connect.stripeAccountId)

  return NextResponse.json({
    url: loginLink.url,
    returnUrl: `${getAppBaseUrl()}/for-cooks/cook-dashboard`,
  })
}
