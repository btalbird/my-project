import Stripe from "stripe"

/**
 * Singleton Stripe client for all server-side Stripe requests.
 * Set STRIPE_SECRET_KEY in `.env` (test: sk_test_..., live: sk_live_...).
 */
let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Add your secret key from Stripe Dashboard → Developers → API keys.",
    )
  }
  if (!stripeClient) {
    // API version is pinned automatically by the SDK (2026-06-24.dahlia).
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

/** Alias used in Stripe sample integrations — same client as getStripe(). */
export const getStripeClient = getStripe

export function getListingPriceId(): string {
  const priceId = process.env.STRIPE_LISTING_PRICE_ID?.trim()
  if (!priceId) {
    throw new Error(
      "STRIPE_LISTING_PRICE_ID is not configured. Create a monthly recurring Price in Stripe Dashboard and paste the price_... ID.",
    )
  }
  return priceId
}

export function getStandardWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not configured. Create a webhook endpoint in Stripe Dashboard and paste the whsec_... signing secret.",
    )
  }
  return secret
}

/** Thin Connect account events use a separate destination in Stripe Dashboard. */
export function getConnectWebhookSecret(): string {
  const secret =
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!secret) {
    throw new Error(
      "STRIPE_CONNECT_WEBHOOK_SECRET (or STRIPE_WEBHOOK_SECRET) is not configured for Connect thin events.",
    )
  }
  return secret
}

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3002"
}

export type StripeConfigStatus = {
  secretKey: boolean
  listingPriceId: boolean
  webhookSecret: boolean
  connectWebhookSecret: boolean
  publishableKey: boolean
  appUrl: string
}

export function getStripeConfigStatus(): StripeConfigStatus {
  return {
    secretKey: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    listingPriceId: Boolean(process.env.STRIPE_LISTING_PRICE_ID?.trim()),
    webhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
    connectWebhookSecret: Boolean(
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET?.trim() || process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    ),
    publishableKey: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()),
    appUrl: getAppBaseUrl(),
  }
}
