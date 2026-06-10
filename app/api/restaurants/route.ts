import { NextResponse } from "next/server"

import { clampRadiusMiles } from "@/lib/delivery-address"
import { resolveDeliveryFromRequest } from "@/lib/delivery-resolve"
import { findNearbyLiveKitchens } from "@/lib/nearby-kitchens"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const tagsParam = url.searchParams.get("tags") ?? ""
  const category = url.searchParams.get("category")?.trim() || null
  const q = url.searchParams.get("q")?.trim() || null
  const tagSlugs = tagsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const delivery = await resolveDeliveryFromRequest(req)
  if (!delivery) {
    return NextResponse.json({
      restaurants: [],
      needsAddress: true,
      radiusMiles: null,
    })
  }

  const rawRadius = url.searchParams.get("radiusMiles")
  const radiusMiles = rawRadius != null ? clampRadiusMiles(Number(rawRadius)) : delivery.radiusMiles
  const kitchens = await findNearbyLiveKitchens(delivery.lat, delivery.lng, radiusMiles, {
    category,
    tagSlugs,
    q,
  })

  return NextResponse.json({
    restaurants: kitchens,
    needsAddress: false,
    radiusMiles,
  })
}
