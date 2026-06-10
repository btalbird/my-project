import { NextResponse } from "next/server"

import {
  getOwnedRestaurantIds,
  requireActiveCookSubscription,
  requireCookUser,
} from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { parseItems } from "@/lib/order-format"

export async function GET(req: Request) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subCheck = await requireActiveCookSubscription(auth.user.id, auth.user.role)
  if ("response" in subCheck) return subCheck.response

  const restaurantIds = await getOwnedRestaurantIds(auth.user.id, auth.user.role)
  if (restaurantIds.length === 0) {
    return NextResponse.json({ orders: [] })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")
  const limitParam = url.searchParams.get("limit")
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200) : 50

  const createdAt: { gte?: Date; lte?: Date } = {}
  if (from) {
    const d = new Date(from)
    if (!Number.isNaN(d.getTime())) createdAt.gte = d
  }
  if (to) {
    const d = new Date(to)
    if (!Number.isNaN(d.getTime())) createdAt.lte = d
  }

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: { in: restaurantIds },
      paymentStatus: "paid",
      ...(status ? { status } : {}),
      ...(Object.keys(createdAt).length > 0 ? { createdAt } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      restaurant: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return NextResponse.json({
    orders: orders.map((o) => {
      const items = parseItems(o.items)
      return {
        id: o.id,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        customer: {
          id: o.user.id,
          name: o.user.name,
          email: o.user.email,
        },
        restaurant: o.restaurant?.name ?? items.restaurant ?? null,
        items,
      }
    }),
  })
}
