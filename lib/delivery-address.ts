import { geocodeAddress, geocodeQuery, type GeocodeInput } from "@/lib/geocode-nominatim"

export const RADIUS_MIN = 1
export const RADIUS_MAX = 50
export const DEFAULT_RADIUS_MILES = 10

export type DeliveryAddressInput = {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  radiusMiles?: number
}

export type GeocodedDelivery = {
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

export function clampRadiusMiles(value: unknown): number {
  let radius = typeof value === "number" ? value : DEFAULT_RADIUS_MILES
  if (!Number.isFinite(radius)) radius = DEFAULT_RADIUS_MILES
  return Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, radius))
}

export function parseDeliveryInput(body: Record<string, unknown>): DeliveryAddressInput | { error: string } {
  const line1 = String(body.line1 ?? "").trim()
  const line2 = body.line2 !== undefined ? String(body.line2).trim() : ""
  const city = String(body.city ?? "").trim()
  const state = String(body.state ?? "").trim()
  const postalCode = String(body.postalCode ?? "").trim()

  if (!line1 || !city || !state || !postalCode) {
    return { error: "Street address, city, state, and ZIP code are required." }
  }

  return {
    line1,
    line2: line2 || undefined,
    city,
    state,
    postalCode,
    radiusMiles: clampRadiusMiles(body.radiusMiles),
  }
}

export async function geocodeDeliveryInput(
  input: DeliveryAddressInput,
): Promise<{ coords: { lat: number; lng: number } } | { error: string }> {
  const coords = await geocodeAddress({
    line1: input.line1,
    line2: input.line2,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
  })

  if (!coords) {
    return {
      error:
        "We could not find that address on the map. Check spelling and try again, or use a nearby major street.",
    }
  }

  return { coords }
}

export async function geocodeFreeTextAddress(
  query: string,
  radiusMiles?: number,
): Promise<{ delivery: GeocodedDelivery } | { error: string }> {
  const trimmed = query.trim()
  if (!trimmed) {
    return { error: "Enter a delivery address." }
  }

  const result = await geocodeQuery(trimmed)
  if (!result) {
    return {
      error: "We could not find that address. Try a full street address with city, state, and ZIP.",
    }
  }

  const radius = clampRadiusMiles(radiusMiles)
  const formatted = result.displayName ?? trimmed
  return {
    delivery: {
      line1: trimmed,
      line2: null,
      city: result.city ?? "",
      state: result.state ?? "",
      postalCode: result.postalCode ?? "",
      lat: result.lat,
      lng: result.lng,
      radiusMiles: radius,
      formatted,
    },
  }
}

export function parseOptionalCoords(body: Record<string, unknown>): { lat: number; lng: number } | null {
  const lat = typeof body.lat === "number" ? body.lat : Number(body.lat)
  const lng = typeof body.lng === "number" ? body.lng : Number(body.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

export function toGeocodedDelivery(
  input: DeliveryAddressInput,
  coords: { lat: number; lng: number },
): GeocodedDelivery {
  const radiusMiles = clampRadiusMiles(input.radiusMiles)
  return {
    line1: input.line1,
    line2: input.line2?.trim() || null,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    lat: coords.lat,
    lng: coords.lng,
    radiusMiles,
    formatted: [input.line1, input.line2, input.city, input.state, input.postalCode]
      .filter((p) => p && String(p).trim())
      .join(", "),
  }
}

export type GeocodeInputExport = GeocodeInput
