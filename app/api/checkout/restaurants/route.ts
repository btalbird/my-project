import { NextResponse } from "next/server"

import { clampRadiusMiles } from "@/lib/delivery-address"
import { resolveDeliveryFromRequest } from "@/lib/delivery-resolve"
import { findNearbyLiveKitchens } from "@/lib/nearby-kitchens"
import { prisma } from "@/lib/db"
import { liveKitchenWhere } from "@/lib/live-kitchens"

export async function GET(req: Request) {
  const delivery = await resolveDeliveryFromRequest(req)

  const baseRows = delivery
    ? await findNearbyLiveKitchens(delivery.lat, delivery.lng, delivery.radiusMiles)
    : (
        await prisma.restaurant.findMany({
          where: liveKitchenWhere(),
          select: { id: true, name: true, cuisine: true },
          orderBy: { name: "asc" },
        })
      ).map((r) => ({ ...r, distanceMiles: undefined as number | undefined }))

  const ids = baseRows.map((r) => r.id)
  if (ids.length === 0) {
    return NextResponse.json({ restaurants: [], needsAddress: !delivery })
  }

  const withOwners = await prisma.restaurant.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      cuisine: true,
      owner: {
        select: {
          cookConnect: {
            select: {
              chargesEnabled: true,
              detailsSubmitted: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })

  const distanceById = new Map(baseRows.map((r) => [r.id, r.distanceMiles]))

  return NextResponse.json({
    needsAddress: !delivery,
    radiusMiles: delivery ? clampRadiusMiles(delivery.radiusMiles) : null,
    restaurants: withOwners.map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      distanceMiles: distanceById.get(r.id),
      acceptsPaidOrders: Boolean(
        r.owner?.cookConnect?.chargesEnabled && r.owner?.cookConnect?.detailsSubmitted,
      ),
    })),
  })
}
