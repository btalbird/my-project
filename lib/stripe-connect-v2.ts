import type Stripe from "stripe"

import type { CookConnectSnapshot } from "@/lib/cook-connect"

/** Live Connect onboarding status derived from a V2 Account object. */
export type V2ConnectStatus = CookConnectSnapshot & {
  readyToProcessPayments: boolean
  onboardingComplete: boolean
  requirementsStatus: string | null
}

type V2Account = Stripe.V2.Core.Account

/**
 * Create a Stripe Connect V2 account for a cook.
 * Uses only the properties recommended by Stripe — never top-level `type: express|standard|custom`.
 */
export async function createV2ConnectedAccount(
  stripeClient: Stripe,
  user: { email: string; name: string | null; id: string },
): Promise<V2Account> {
  const displayName = user.name?.trim() || user.email.split("@")[0] || "Munch Cook"

  const response = await stripeClient.v2.core.accounts.create({
    display_name: displayName,
    contact_email: user.email,
    identity: {
      country: "us",
    },
    dashboard: "full",
    defaults: {
      responsibilities: {
        fees_collector: "stripe",
        losses_collector: "stripe",
      },
    },
    configuration: {
      customer: {},
      merchant: {
        capabilities: {
          card_payments: {
            requested: true,
          },
        },
      },
    },
    metadata: {
      userId: user.id,
    },
  })

  return response as V2Account
}

/**
 * Fetch the latest account state from Stripe (source of truth for onboarding UI).
 * Always call this when showing Connect status — do not rely only on cached DB flags.
 */
export async function retrieveV2ConnectedAccount(
  stripeClient: Stripe,
  stripeAccountId: string,
): Promise<V2Account> {
  const response = await stripeClient.v2.core.accounts.retrieve(stripeAccountId, {
    include: ["configuration.merchant", "requirements"],
  })
  return response as V2Account
}

/** Map V2 account fields to the flags Munch uses for gating checkout and payouts. */
export function v2AccountToConnectStatus(account: V2Account): V2ConnectStatus {
  const readyToProcessPayments =
    account.configuration?.merchant?.capabilities?.card_payments?.status === "active"

  const requirementsStatus =
    account.requirements?.summary?.minimum_deadline?.status ?? null

  const onboardingComplete =
    requirementsStatus !== "currently_due" && requirementsStatus !== "past_due"

  return {
    stripeAccountId: account.id,
    chargesEnabled: readyToProcessPayments,
    payoutsEnabled: readyToProcessPayments,
    detailsSubmitted: onboardingComplete,
    readyToProcessPayments,
    onboardingComplete,
    requirementsStatus,
  }
}

/**
 * Stripe-hosted onboarding for V2 accounts (merchant + customer configurations).
 */
export async function createV2AccountOnboardingLink(
  stripeClient: Stripe,
  stripeAccountId: string,
  baseUrl: string,
): Promise<string> {
  const link = await stripeClient.v2.core.accountLinks.create({
    account: stripeAccountId,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        configurations: ["merchant", "customer"],
        refresh_url: `${baseUrl}/for-cooks/cook-dashboard?connect=refresh`,
        return_url: `${baseUrl}/for-cooks/cook-dashboard?connect=return&accountId=${stripeAccountId}`,
      },
    },
  })

  if (!link.url) {
    throw new Error("Stripe did not return an account link URL.")
  }
  return link.url
}

/**
 * Resume onboarding or update account details after the first pass.
 */
export async function createV2AccountUpdateLink(
  stripeClient: Stripe,
  stripeAccountId: string,
  baseUrl: string,
): Promise<string> {
  const link = await stripeClient.v2.core.accountLinks.create({
    account: stripeAccountId,
    use_case: {
      type: "account_update",
      account_update: {
        configurations: ["merchant", "customer"],
        refresh_url: `${baseUrl}/for-cooks/cook-dashboard?connect=refresh`,
        return_url: `${baseUrl}/for-cooks/cook-dashboard?connect=return&accountId=${stripeAccountId}`,
      },
    },
  })

  if (!link.url) {
    throw new Error("Stripe did not return an account link URL.")
  }
  return link.url
}
