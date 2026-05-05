import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { filterAndSortNearbyKitchens } from "@/lib/member-nearby-kitchens"
import { getSessionUserId } from "@/lib/session"

const RADIUS_MIN = 1
const RADIUS_MAX = 50

export async function GET(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      deliveryLat: true,
      deliveryLng: true,
      kitchenSearchRadiusMiles: true,
    },
  })

  if (!user?.deliveryLat || !user?.deliveryLng) {
    return NextResponse.json({
      needsAddress: true,
      radiusMiles: user?.kitchenSearchRadiusMiles ?? 10,
      kitchens: [],
    })
  }

  const url = new URL(req.url)
  const raw = url.searchParams.get("radiusMiles")
  let radius = user.kitchenSearchRadiusMiles
  if (raw !== null) {
    const n = Number(raw)
    if (Number.isFinite(n)) radius = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, n))
  }

  const restaurants = await prisma.restaurant.findMany({
    where: { isMehko: true },
    select: {
      id: true,
      name: true,
      image: true,
      cuisine: true,
      rating: true,
      deliveryTime: true,
      deliveryFee: true,
      promo: true,
      latitude: true,
      longitude: true,
      isMehko: true,
    },
  })

  const kitchens = filterAndSortNearbyKitchens(restaurants, user.deliveryLat, user.deliveryLng, radius)

  return NextResponse.json({ radiusMiles: radius, kitchens })
}
