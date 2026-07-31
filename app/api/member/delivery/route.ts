import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { parseOptionalCoords } from "@/lib/delivery-address"
import { geocodeAddress } from "@/lib/geocode-nominatim"
import { getSessionUserId } from "@/lib/session"

const RADIUS_MIN = 1
const RADIUS_MAX = 50

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
    },
  })
}

export async function PUT(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    radiusMiles?: number
    lat?: number
    lng?: number
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const line1 = String(body.line1 ?? "").trim()
  const line2 = body.line2 !== undefined ? String(body.line2).trim() : ""
  const city = String(body.city ?? "").trim()
  const state = String(body.state ?? "").trim()
  const postalCode = String(body.postalCode ?? "").trim()

  if (!line1 || !city || !state || !postalCode) {
    return NextResponse.json(
      { error: "Street address, city, state, and ZIP code are required." },
      { status: 400 },
    )
  }

  const providedCoords = parseOptionalCoords(body)
  const coords =
    providedCoords ??
    (await geocodeAddress({
      line1,
      line2: line2 || undefined,
      city,
      state,
      postalCode,
    }))

  if (!coords) {
    return NextResponse.json(
      {
        error:
          "We could not find that address on the map. Check spelling and try again, or use a nearby major street.",
      },
      { status: 422 },
    )
  }

  let radius = typeof body.radiusMiles === "number" ? body.radiusMiles : 10
  if (!Number.isFinite(radius)) radius = 10
  radius = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, radius))

  await prisma.user.update({
    where: { id: userId },
    data: {
      deliveryLine1: line1,
      deliveryLine2: line2 || null,
      deliveryCity: city,
      deliveryState: state,
      deliveryPostalCode: postalCode,
      deliveryLat: coords.lat,
      deliveryLng: coords.lng,
      kitchenSearchRadiusMiles: radius,
    },
  })

  return NextResponse.json({ ok: true, lat: coords.lat, lng: coords.lng, radiusMiles: radius })
}

/** Update search radius only (member already has geocoded home). */
export async function PATCH(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { radiusMiles?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  let radius = typeof body.radiusMiles === "number" ? body.radiusMiles : NaN
  if (!Number.isFinite(radius)) {
    return NextResponse.json({ error: "radiusMiles must be a number" }, { status: 400 })
  }
  radius = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, radius))

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deliveryLat: true, deliveryLng: true },
  })

  if (!user?.deliveryLat || !user?.deliveryLng) {
    return NextResponse.json({ error: "Save a delivery address before changing radius." }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { kitchenSearchRadiusMiles: radius },
  })

  return NextResponse.json({ ok: true, radiusMiles: radius })
}
