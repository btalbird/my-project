import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { getAppBaseUrl, getStripe } from "@/lib/stripe"

/** Stripe Customer Portal for the cook's listing subscription (V2 customer_account). */
export async function POST() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const connect = await prisma.cookConnect.findUnique({
    where: { userId: auth.user.id },
    select: { stripeAccountId: true },
  })

  if (!connect?.stripeAccountId) {
    return NextResponse.json({ error: "Connect Stripe before managing billing" }, { status: 400 })
  }

  let stripeClient: ReturnType<typeof getStripe>
  try {
    stripeClient = getStripe()
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe is not configured" },
      { status: 500 },
    )
  }

  const baseUrl = getAppBaseUrl()

  const session = await stripeClient.billingPortal.sessions.create({
    customer_account: connect.stripeAccountId,
    return_url: `${baseUrl}/for-cooks/cook-dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
