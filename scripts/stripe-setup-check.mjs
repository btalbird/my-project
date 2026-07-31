#!/usr/bin/env node
/**
 * Verify Stripe test-mode configuration and print setup steps.
 * Usage: node ./scripts/stripe-setup-check.mjs
 */

const required = [
  ["STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY],
  ["STRIPE_LISTING_PRICE_ID", process.env.STRIPE_LISTING_PRICE_ID],
  ["STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET],
  ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY],
  ["SESSION_SECRET", process.env.SESSION_SECRET],
]

const optional = [
  ["NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL],
  ["STRIPE_PLATFORM_FEE_PERCENT", process.env.STRIPE_PLATFORM_FEE_PERCENT],
]

let ok = true

console.log("Munch Stripe setup check\n")

for (const [name, value] of required) {
  const present = Boolean(value?.trim())
  console.log(`${present ? "✓" : "✗"} ${name}`)
  if (!present) ok = false
}

console.log("\nOptional:")
for (const [name, value] of optional) {
  console.log(`${value?.trim() ? "✓" : "·"} ${name}${value ? "" : " (not set)"}`)
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3002"
console.log("\nWebhook endpoints:")
console.log(`  Platform: ${appUrl}/api/webhooks/stripe`)
console.log(`  Connect (thin): ${appUrl}/api/webhooks/stripe-connect`)
console.log("\nStripe CLI (thin Connect events):")
console.log(
  "  stripe listen --thin-events 'v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' --forward-thin-to " +
    `${appUrl}/api/webhooks/stripe-connect`,
)
console.log("\nStripe Dashboard checklist:")
console.log("  1. Create monthly recurring price → Kitchen Listing → copy price ID")
console.log("  2. Enable Connect → Express accounts")
console.log("  3. Register webhook with events: checkout.session.completed, checkout.session.expired,")
console.log("     account.updated, customer.subscription.*, invoice.payment_failed")
console.log("\nE2E test paths:")
console.log("  Cook: /for-cooks/signup → Connect → Subscribe → kitchen setup")
console.log("  Customer: set address → restaurant menu → cart → Stripe test card 4242…")

process.exit(ok ? 0 : 1)
