import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { getStripeConfigStatus } from "@/lib/stripe"

export const dynamic = "force-dynamic"

/**
 * Deployment / parity check: open `/api/health` on Vercel vs localhost.
 * Does not expose secrets — only whether required env vars exist and the DB answers.
 */
export async function GET() {
  const databaseUrlConfigured = Boolean(process.env.DATABASE_URL?.trim())
  const sessionSecretConfigured = Boolean(process.env.SESSION_SECRET?.trim())
  const stripe = getStripeConfigStatus()
  const nominatimConfigured = Boolean(process.env.NOMINATIM_USER_AGENT?.trim())
  const adminEmailsConfigured = Boolean(process.env.ADMIN_EMAILS?.trim())

  if (!databaseUrlConfigured) {
    return NextResponse.json(
      {
        ok: false,
        databaseUrlConfigured: false,
        dbReachable: false,
        sessionSecretConfigured,
        stripe,
        nominatimConfigured,
        adminEmailsConfigured,
        hint: "Set DATABASE_URL on Vercel (see .env.example), then redeploy.",
      },
      { status: 503 },
    )
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    const stripeReady =
      stripe.secretKey && stripe.listingPriceId && stripe.webhookSecret && stripe.publishableKey

    return NextResponse.json({
      ok: true,
      databaseUrlConfigured: true,
      dbReachable: true,
      sessionSecretConfigured,
      stripe,
      stripeReady,
      nominatimConfigured,
      adminEmailsConfigured,
      appUrl: stripe.appUrl,
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        databaseUrlConfigured: true,
        dbReachable: false,
        sessionSecretConfigured,
        stripe,
        nominatimConfigured,
        adminEmailsConfigured,
        hint: "DATABASE_URL is set but the database did not accept a query. Run `pnpm db:migrate` and `pnpm db:seed` (see .env.example).",
      },
      { status: 503 },
    )
  }
}
