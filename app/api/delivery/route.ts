import { NextResponse } from "next/server"

import {
  clampRadiusMiles,
  geocodeDeliveryInput,
  geocodeFreeTextAddress,
  parseDeliveryInput,
  toGeocodedDelivery,
  type GeocodedDelivery,
} from "@/lib/delivery-address"
import { applyDeliveryCookie, readDeliveryCookie, cookiePayloadToDelivery } from "@/lib/delivery-context"
import { formatDeliverySnippet } from "@/lib/live-kitchens"
import { prisma } from "@/lib/db"
import { getSessionUserId } from "@/lib/session"

function deliveryResponse(delivery: GeocodedDelivery, extra?: Record<string, unknown>) {
  const res = NextResponse.json({
    delivery: {
      line1: delivery.line1,
      line2: delivery.line2,
      city: delivery.city,
      state: delivery.state,
      postalCode: delivery.postalCode,
      lat: delivery.lat,
      lng: delivery.lng,
      radiusMiles: delivery.radiusMiles,
      formatted: delivery.formatted,
      snippet: formatDeliverySnippet(delivery.city, delivery.postalCode),
    },
    ...extra,
  })
  applyDeliveryCookie(res, delivery)
  return res
}

async function persistMemberDelivery(userId: string, delivery: GeocodedDelivery) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      deliveryLine1: delivery.line1,
      deliveryLine2: delivery.line2,
      deliveryCity: delivery.city || null,
      deliveryState: delivery.state || null,
      deliveryPostalCode: delivery.postalCode || null,
      deliveryLat: delivery.lat,
      deliveryLng: delivery.lng,
      kitchenSearchRadiusMiles: delivery.radiusMiles,
    },
  })
}

export async function GET() {
  const userId = await getSessionUserId()
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        deliveryLine1: true,
        deliveryLine2: true,
        deliveryCity: true,
        deliveryState: true,
        deliveryPostalCode: true,
        deliveryLat: true,
        deliveryLng: true,
        kitchenSearchRadiusMiles: true,
      },
    })
    if (user?.deliveryLat != null && user?.deliveryLng != null) {
      const formatted = [user.deliveryLine1, user.deliveryCity, user.deliveryState, user.deliveryPostalCode]
        .filter(Boolean)
        .join(", ")
      return NextResponse.json({
        delivery: {
          line1: user.deliveryLine1,
          line2: user.deliveryLine2,
          city: user.deliveryCity,
          state: user.deliveryState,
          postalCode: user.deliveryPostalCode,
          lat: user.deliveryLat,
          lng: user.deliveryLng,
          radiusMiles: user.kitchenSearchRadiusMiles,
          formatted,
          snippet: formatDeliverySnippet(user.deliveryCity, user.deliveryPostalCode),
        },
      })
    }
  }

  const cookie = await readDeliveryCookie()
  if (cookie) {
    const delivery = cookiePayloadToDelivery(cookie)
    return NextResponse.json({
      delivery: {
        line1: delivery.line1,
        line2: delivery.line2,
        city: delivery.city,
        state: delivery.state,
        postalCode: delivery.postalCode,
        lat: delivery.lat,
        lng: delivery.lng,
        radiusMiles: delivery.radiusMiles,
        formatted: delivery.formatted,
        snippet: formatDeliverySnippet(delivery.city, delivery.postalCode),
      },
    })
  }

  return NextResponse.json({ delivery: null })
}

export async function PUT(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const freeText = body.query !== undefined ? String(body.query).trim() : ""
  let delivery: GeocodedDelivery

  if (freeText && !body.line1 && !body.city) {
    const result = await geocodeFreeTextAddress(freeText, body.radiusMiles as number | undefined)
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 422 })
    }
    delivery = result.delivery
  } else {
    const parsed = parseDeliveryInput(body)
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const geocoded = await geocodeDeliveryInput(parsed)
    if ("error" in geocoded) {
      return NextResponse.json({ error: geocoded.error }, { status: 422 })
    }
    delivery = toGeocodedDelivery(parsed, geocoded.coords)
  }

  const userId = await getSessionUserId()
  if (userId) {
    await persistMemberDelivery(userId, delivery)
  }

  return deliveryResponse(delivery, { ok: true })
}

export async function PATCH(req: Request) {
  let body: { radiusMiles?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const radiusMiles = clampRadiusMiles(body.radiusMiles)
  const userId = await getSessionUserId()

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        deliveryLine1: true,
        deliveryLine2: true,
        deliveryCity: true,
        deliveryState: true,
        deliveryPostalCode: true,
        deliveryLat: true,
        deliveryLng: true,
      },
    })
    if (!user?.deliveryLat || !user?.deliveryLng) {
      return NextResponse.json({ error: "Save a delivery address before changing radius." }, { status: 400 })
    }
    await prisma.user.update({
      where: { id: userId },
      data: { kitchenSearchRadiusMiles: radiusMiles },
    })
    const delivery: GeocodedDelivery = {
      line1: user.deliveryLine1 ?? "",
      line2: user.deliveryLine2,
      city: user.deliveryCity ?? "",
      state: user.deliveryState ?? "",
      postalCode: user.deliveryPostalCode ?? "",
      lat: user.deliveryLat,
      lng: user.deliveryLng,
      radiusMiles,
      formatted: [user.deliveryLine1, user.deliveryCity, user.deliveryState, user.deliveryPostalCode]
        .filter(Boolean)
        .join(", "),
    }
    return deliveryResponse(delivery, { ok: true })
  }

  const cookie = await readDeliveryCookie()
  if (!cookie) {
    return NextResponse.json({ error: "Save a delivery address before changing radius." }, { status: 400 })
  }
  const delivery = cookiePayloadToDelivery(cookie)
  delivery.radiusMiles = radiusMiles
  return deliveryResponse(delivery, { ok: true })
}
