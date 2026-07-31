import { NextResponse } from "next/server"
import { z } from "zod"

import {
  getOwnedRestaurantIds,
  requireActiveCookSubscription,
  requireCookUser,
} from "@/lib/cook-auth"
import { prisma } from "@/lib/db"

const COOK_ORDER_STATUSES = ["preparing", "ready", "completed", "cancelled"] as const

const UpdateOrderSchema = z.object({
  status: z.enum(COOK_ORDER_STATUSES),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subCheck = await requireActiveCookSubscription(auth.user.id, auth.user.role)
  if ("response" in subCheck) return subCheck.response

  const { id } = await params
  const orderId = Number.parseInt(id, 10)
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 })
  }

  let body: z.infer<typeof UpdateOrderSchema>
  try {
    body = UpdateOrderSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const restaurantIds = await getOwnedRestaurantIds(auth.user.id, auth.user.role)
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      restaurantId: { in: restaurantIds },
      paymentStatus: "paid",
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: body.status },
    select: { id: true, status: true },
  })

  return NextResponse.json({ order: updated })
}
