import { NextResponse } from "next/server"

import { clampRadiusMiles } from "@/lib/delivery-address"
import { resolveDeliveryFromRequest } from "@/lib/delivery-resolve"
import { findNearbyLiveKitchens } from "@/lib/nearby-kitchens"

export async function GET(req: Request) {
  try {
    const delivery = await resolveDeliveryFromRequest(req)
    if (!delivery) {
      return NextResponse.json({
        needsAddress: true,
        kitchens: [],
        delivery: null,
      })
    }

    const url = new URL(req.url)
    const rawRadius = url.searchParams.get("radiusMiles")
    let radiusMiles = delivery.radiusMiles
    if (rawRadius != null) {
      radiusMiles = clampRadiusMiles(Number(rawRadius))
    }

    const tagsParam = url.searchParams.get("tags") ?? ""
    const tagSlugs = tagsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const category = url.searchParams.get("category")?.trim() || null
    const q = url.searchParams.get("q")?.trim() || null

    const kitchens = await findNearbyLiveKitchens(delivery.lat, delivery.lng, radiusMiles, {
      category,
      tagSlugs,
      q,
    })

    return NextResponse.json({
      needsAddress: false,
      radiusMiles,
      kitchens,
      delivery: {
        lat: delivery.lat,
        lng: delivery.lng,
        radiusMiles,
        formatted: delivery.formatted,
        city: delivery.city,
        postalCode: delivery.postalCode,
      },
    })
  } catch (err) {
    console.error("[kitchens/nearby]", err)
    return NextResponse.json(
      { error: "Failed to load nearby kitchens", kitchens: [], needsAddress: false },
      { status: 500 },
    )
  }
}
