import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { liveKitchenWhere } from "@/lib/live-kitchens"
import { formatCents } from "@/lib/money"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const restaurantId = Number.parseInt(id, 10)
  if (!Number.isFinite(restaurantId)) {
    return NextResponse.json({ error: "Invalid restaurant id" }, { status: 400 })
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, ...liveKitchenWhere() },
    select: {
      id: true,
      name: true,
      cuisine: true,
      image: true,
      rating: true,
      deliveryTime: true,
      deliveryFee: true,
      promo: true,
      isDemo: true,
    },
  })

  if (!restaurant) {
    return NextResponse.json({ error: "Kitchen not found" }, { status: 404 })
  }

  const items = await prisma.menuItem.findMany({
    where: { restaurantId, isAvailable: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      image: true,
    },
  })

  return NextResponse.json({
    restaurant,
    items: items.map((item) => ({
      ...item,
      priceLabel: formatCents(item.priceCents),
    })),
  })
}
