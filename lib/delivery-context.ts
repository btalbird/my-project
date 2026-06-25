import { cookies } from "next/headers"

import { DEFAULT_RADIUS_MILES, type GeocodedDelivery } from "@/lib/delivery-address"

export const DELIVERY_COOKIE = "munch_delivery"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export type DeliveryCookiePayload = {
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  lat: number
  lng: number
  radiusMiles: number
  formatted: string
}

export function deliveryToCookiePayload(delivery: GeocodedDelivery): DeliveryCookiePayload {
  return {
    line1: delivery.line1,
    line2: delivery.line2,
    city: delivery.city,
    state: delivery.state,
    postalCode: delivery.postalCode,
    lat: delivery.lat,
    lng: delivery.lng,
    radiusMiles: delivery.radiusMiles,
    formatted: delivery.formatted,
  }
}

export function cookiePayloadToDelivery(payload: DeliveryCookiePayload): GeocodedDelivery {
  return {
    line1: payload.line1,
    line2: payload.line2,
    city: payload.city,
    state: payload.state,
    postalCode: payload.postalCode,
    lat: payload.lat,
    lng: payload.lng,
    radiusMiles: payload.radiusMiles ?? DEFAULT_RADIUS_MILES,
    formatted: payload.formatted,
  }
}

export async function readDeliveryCookie(): Promise<DeliveryCookiePayload | null> {
  const jar = await cookies()
  const raw = jar.get(DELIVERY_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as DeliveryCookiePayload
    if (
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number" ||
      !Number.isFinite(parsed.lat) ||
      !Number.isFinite(parsed.lng)
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function buildDeliveryCookieHeader(delivery: GeocodedDelivery): string {
  const payload = deliveryToCookiePayload(delivery)
  return `${DELIVERY_COOKIE}=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`
}

export function applyDeliveryCookie(response: { cookies: { set: (name: string, value: string, options?: {
  path?: string
  maxAge?: number
  sameSite?: "lax" | "strict" | "none"
  secure?: boolean
}) => void } }, delivery: GeocodedDelivery) {
  const payload = deliveryToCookiePayload(delivery)
  response.cookies.set(DELIVERY_COOKIE, JSON.stringify(payload), {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export function buildClearDeliveryCookieHeader(): string {
  return `${DELIVERY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}
