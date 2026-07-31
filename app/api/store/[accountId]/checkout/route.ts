import { NextResponse } from "next/server"
import { z } from "zod"

import { getAppBaseUrl, getStripe } from "@/lib/stripe"
import { getPlatformFeeCents } from "@/lib/money"

const CheckoutSchema = z.object({
  productId: z.string().min(1),
  priceId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
})

/**
 * Hosted Checkout — direct charge on the connected account with platform fee.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> },
) {
  const { accountId } = await params
  if (!accountId.startsWith("acct_")) {
    return NextResponse.json({ error: "Invalid account id" }, { status: 400 })
  }

  let body: z.infer<typeof CheckoutSchema>
  try {
    body = CheckoutSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid checkout body" }, { status: 400 })
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

  const price = await stripeClient.prices.retrieve(
    body.priceId,
    {},
    { stripeAccount: accountId },
  )
  const unitAmount = price.unit_amount ?? 0
  const totalCents = unitAmount * body.quantity
  const applicationFee = getPlatformFeeCents(totalCents)

  const baseUrl = getAppBaseUrl()

  const session = await stripeClient.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          price: body.priceId,
          quantity: body.quantity,
        },
      ],
      payment_intent_data: {
        ...(applicationFee > 0 ? { application_fee_amount: applicationFee } : {}),
        metadata: {
          type: "storefront",
          productId: body.productId,
        },
      },
      success_url: `${baseUrl}/store/${accountId}?success=1`,
      cancel_url: `${baseUrl}/store/${accountId}?cancelled=1`,
      metadata: {
        type: "storefront",
        productId: body.productId,
      },
    },
    { stripeAccount: accountId },
  )

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }

  return NextResponse.json({ url: session.url })
}
