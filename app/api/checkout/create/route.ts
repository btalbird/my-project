import { NextResponse } from "next/server"
import { z } from "zod"

import { isCookConnectReady } from "@/lib/cook-connect"
import { resolveDeliveryFromRequest } from "@/lib/delivery-resolve"
import { isKitchenWithinRadius } from "@/lib/nearby-kitchens"
import { prisma } from "@/lib/db"
import { liveKitchenWhere } from "@/lib/live-kitchens"
import { computeLineTotalCents, formatCents, getPlatformFeeCents, parsePriceToCents } from "@/lib/money"
import { CheckoutBodySchema } from "@/lib/order-checkout"
import { getSessionUserId } from "@/lib/session"
import { getAppBaseUrl, getStripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: z.infer<typeof CheckoutBodySchema>
  try {
    body = CheckoutBodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const restaurantRow = await prisma.restaurant.findFirst({
    where: { name: body.restaurant.trim(), ...liveKitchenWhere },
    include: {
      owner: {
        include: { cookConnect: true },
      },
    },
  })

  if (!restaurantRow) {
    return NextResponse.json(
      { error: "Kitchen not found. Choose a restaurant from the list." },
      { status: 404 },
    )
  }

  if (
    !restaurantRow.isMehko ||
    restaurantRow.isDemo ||
    !restaurantRow.isPublished ||
    !restaurantRow.ownerId ||
    restaurantRow.latitude == null ||
    restaurantRow.longitude == null
  ) {
    return NextResponse.json({ error: "This kitchen is not available for orders." }, { status: 422 })
  }

  const delivery = await resolveDeliveryFromRequest(req)
  if (delivery) {
    const inRange = isKitchenWithinRadius(
      restaurantRow,
      delivery.lat,
      delivery.lng,
      delivery.radiusMiles,
    )
    if (!inRange) {
      return NextResponse.json(
        { error: "This kitchen is outside your delivery area. Update your address or choose a closer kitchen." },
        { status: 422 },
      )
    }
  }

  const connect = restaurantRow.owner?.cookConnect
  if (!isCookConnectReady(connect)) {
    return NextResponse.json(
      {
        error:
          "This kitchen is not accepting paid orders yet. The cook must finish Stripe Connect setup.",
      },
      { status: 422 },
    )
  }

  const amountCents = computeLineTotalCents(body.lines)
  if (amountCents < 50) {
    return NextResponse.json({ error: "Order total must be at least $0.50" }, { status: 400 })
  }

  const platformFeeCents = getPlatformFeeCents(amountCents)
  const totalStr = formatCents(amountCents)

  const items = {
    restaurant: body.restaurant.trim(),
    lines: body.lines,
    total: totalStr,
    ...(body.deliveryWindow ? { deliveryWindow: body.deliveryWindow } : {}),
  }

  const order = await prisma.order.create({
    data: {
      userId,
      restaurantId: restaurantRow.id,
      status: "pending_payment",
      paymentStatus: "pending",
      items,
      amountCents,
      platformFeeCents,
    },
  })

  const stripe = getStripe()
  const baseUrl = getAppBaseUrl()

  const paymentIntentData: {
    transfer_data: { destination: string }
    application_fee_amount?: number
    metadata: { orderId: string; userId: string; restaurantId: string }
  } = {
    transfer_data: { destination: connect!.stripeAccountId },
    metadata: {
      orderId: String(order.id),
      userId,
      restaurantId: String(restaurantRow.id),
    },
  }

  if (platformFeeCents > 0) {
    paymentIntentData.application_fee_amount = platformFeeCents
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: body.lines.map((line) => ({
      price_data: {
        currency: "usd",
        product_data: { name: line.name },
        unit_amount: Math.max(1, parsePriceToCents(line.price)),
      },
      quantity: line.qty,
    })),
    payment_intent_data: paymentIntentData,
    success_url: `${baseUrl}/orders/${order.id}?paid=1`,
    cancel_url: `${baseUrl}/cart?cancelled=1&restaurant=${encodeURIComponent(body.restaurant)}`,
    metadata: {
      orderId: String(order.id),
      userId,
      restaurantId: String(restaurantRow.id),
      type: "food_order",
    },
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  })

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }

  return NextResponse.json({ url: session.url, orderId: order.id })
}
