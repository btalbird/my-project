import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { retrieveV2ConnectedAccount, v2AccountToConnectStatus } from "@/lib/stripe-connect-v2"
import { getStripe } from "@/lib/stripe"

/**
 * Live Connect status for the signed-in cook.
 * Status is always fetched from Stripe's V2 Accounts API (not inferred from cache alone).
 */
export async function GET() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const connect = await prisma.cookConnect.findUnique({
    where: { userId: auth.user.id },
    select: { stripeAccountId: true },
  })

  if (!connect?.stripeAccountId) {
    return NextResponse.json({
      hasAccount: false,
      accountId: null,
      readyToProcessPayments: false,
      onboardingComplete: false,
      requirementsStatus: null,
    })
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
    const account = await retrieveV2ConnectedAccount(stripeClient, connect.stripeAccountId)
    const status = v2AccountToConnectStatus(account)

    return NextResponse.json({
      hasAccount: true,
      accountId: connect.stripeAccountId,
      displayName: account.display_name ?? null,
      contactEmail: account.contact_email ?? null,
      readyToProcessPayments: status.readyToProcessPayments,
      onboardingComplete: status.onboardingComplete,
      requirementsStatus: status.requirementsStatus,
      // In production you may prefer a kitchen slug instead of exposing acct_ in URLs.
      storefrontPath: `/store/${connect.stripeAccountId}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load Connect account status from Stripe.",
      },
      { status: 502 },
    )
  }
}
