import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { upsertCookConnectFromAccount } from "@/lib/cook-connect"
import { prisma } from "@/lib/db"
import { getAppBaseUrl, getStripe } from "@/lib/stripe"

export async function POST() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const stripe = getStripe()
  const baseUrl = getAppBaseUrl()
  const { user } = auth

  let connect = await prisma.cookConnect.findUnique({
    where: { userId: user.id },
  })

  if (!connect) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: user.email,
      metadata: { userId: user.id },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
    })

    connect = await upsertCookConnectFromAccount(user.id, account)
  }

  const linkType = connect.detailsSubmitted ? "account_update" : "account_onboarding"
  const accountLink = await stripe.accountLinks.create({
    account: connect.stripeAccountId,
    refresh_url: `${baseUrl}/for-cooks/cook-dashboard?connect=refresh`,
    return_url: `${baseUrl}/for-cooks/cook-dashboard?connect=return`,
    type: linkType,
  })

  return NextResponse.json({ url: accountLink.url })
}
