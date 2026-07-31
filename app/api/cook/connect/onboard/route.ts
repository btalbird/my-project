import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { upsertCookConnectMapping } from "@/lib/cook-connect"
import { prisma } from "@/lib/db"
import {
  createV2AccountOnboardingLink,
  createV2AccountUpdateLink,
  createV2ConnectedAccount,
  retrieveV2ConnectedAccount,
  v2AccountToConnectStatus,
} from "@/lib/stripe-connect-v2"
import { getAppBaseUrl, getStripe } from "@/lib/stripe"

/**
 * Start or resume Stripe Connect V2 onboarding.
 * 1. Ensure a V2 connected account exists (stored in CookConnect).
 * 2. Return a hosted Account Link URL for Stripe onboarding.
 */
export async function POST() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

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
  const { user } = auth

  let connect = await prisma.cookConnect.findUnique({
    where: { userId: user.id },
  })

  // Step 1 — create V2 account if this cook has no mapping yet.
  if (!connect) {
    try {
      const account = await createV2ConnectedAccount(stripeClient, user)
      connect = await upsertCookConnectMapping(user.id, account.id)
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not create Stripe Connect account. Check STRIPE_SECRET_KEY and Connect settings.",
        },
        { status: 502 },
      )
    }
  }

  // Step 2 — choose onboarding vs update link based on live Stripe status.
  try {
    const liveAccount = await retrieveV2ConnectedAccount(stripeClient, connect.stripeAccountId)
    const status = v2AccountToConnectStatus(liveAccount)
    const url = status.onboardingComplete
      ? await createV2AccountUpdateLink(stripeClient, connect.stripeAccountId, baseUrl)
      : await createV2AccountOnboardingLink(stripeClient, connect.stripeAccountId, baseUrl)

    return NextResponse.json({ url, accountId: connect.stripeAccountId })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create Stripe onboarding link.",
      },
      { status: 502 },
    )
  }
}
