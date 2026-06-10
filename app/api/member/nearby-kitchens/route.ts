import { NextResponse } from "next/server"

import { clampRadiusMiles } from "@/lib/delivery-address"
import { findNearbyLiveKitchens } from "@/lib/nearby-kitchens"
import { prisma } from "@/lib/db"
import { getSessionUserId } from "@/lib/session"

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
    radius = clampRadiusMiles(Number(raw))
  }

  const kitchens = await findNearbyLiveKitchens(user.deliveryLat, user.deliveryLng, radius)

  return NextResponse.json({ radiusMiles: radius, kitchens })
}
