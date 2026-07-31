import { NextResponse } from "next/server"
import { z } from "zod"

import { requireActiveCookSubscription, requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { getStripe } from "@/lib/stripe"

const CreateProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  priceCents: z.number().int().min(50).max(500_00),
  currency: z.string().trim().length(3).default("usd"),
})

/**
 * List Stripe Products on the cook's connected account (Stripe-Account header).
 */
export async function GET() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subCheck = await requireActiveCookSubscription(auth.user.id, auth.user.role)
  if ("response" in subCheck) return subCheck.response

  const connect = await prisma.cookConnect.findUnique({
    where: { userId: auth.user.id },
    select: { stripeAccountId: true },
  })
  if (!connect?.stripeAccountId) {
    return NextResponse.json({ error: "Connect Stripe before managing products." }, { status: 400 })
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
    { stripeAccount: connect.stripeAccountId },
  )

  return NextResponse.json({
    accountId: connect.stripeAccountId,
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

/**
 * Create a Product + default Price on the connected account.
 */
export async function POST(req: Request) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subCheck = await requireActiveCookSubscription(auth.user.id, auth.user.role)
  if ("response" in subCheck) return subCheck.response

  const connect = await prisma.cookConnect.findUnique({
    where: { userId: auth.user.id },
    select: { stripeAccountId: true },
  })
  if (!connect?.stripeAccountId) {
    return NextResponse.json({ error: "Connect Stripe before creating products." }, { status: 400 })
  }

  let body: z.infer<typeof CreateProductSchema>
  try {
    body = CreateProductSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 })
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

  const product = await stripeClient.products.create(
    {
      name: body.name,
      description: body.description,
      default_price_data: {
        unit_amount: body.priceCents,
        currency: body.currency.toLowerCase(),
      },
    },
    { stripeAccount: connect.stripeAccountId },
  )

  return NextResponse.json({ product }, { status: 201 })
}
