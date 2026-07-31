import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { getAppBaseUrl, getStripe } from "@/lib/stripe"

/** Open the cook's Stripe Express / full dashboard for payouts. */
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

  let stripeClient: ReturnType<typeof getStripe>
  try {
    stripeClient = getStripe()
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe is not configured" },
      { status: 500 },
    )
  }

  try {
    const loginLink = await stripeClient.accounts.createLoginLink(connect.stripeAccountId)
    return NextResponse.json({
      url: loginLink.url,
      returnUrl: `${getAppBaseUrl()}/for-cooks/cook-dashboard`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not open Stripe dashboard. Finish onboarding first.",
      },
      { status: 502 },
    )
  }
}
