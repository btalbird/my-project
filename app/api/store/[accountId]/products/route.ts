import { NextResponse } from "next/server"

import { getStripe } from "@/lib/stripe"

/**
 * Public storefront catalog for a connected account.
 * URL uses acct_... for the demo — use a kitchen slug in production.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ accountId: string }> },
) {
  const { accountId } = await params
  if (!accountId.startsWith("acct_")) {
    return NextResponse.json({ error: "Invalid account id" }, { status: 400 })
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

  const products = await stripeClient.products.list(
    { limit: 20, active: true, expand: ["data.default_price"] },
    { stripeAccount: accountId },
  )

  return NextResponse.json({
    accountId,
    products: products.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      defaultPrice:
        typeof product.default_price === "object" && product.default_price
          ? {
              id: product.default_price.id,
              unit_amount: product.default_price.unit_amount,
              currency: product.default_price.currency,
            }
          : null,
    })),
  })
}
