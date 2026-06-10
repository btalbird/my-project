/**
 * Forward geocode a US-style address via OpenStreetMap Nominatim (no API key).
 * Respect usage policy: https://operations.osmfoundation.org/policies/nominatim/ (1 req/s, identify app).
 */
const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ?? "MunchWebApp/1.0 (member delivery; contact support@munch.example)"

export type GeocodeInput = {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
}

export async function geocodeAddress(input: GeocodeInput): Promise<{ lat: number; lng: number } | null> {
  const parts = [
    input.line1.trim(),
    input.line2?.trim(),
    input.city.trim(),
    input.state.trim(),
    input.postalCode.trim(),
  ].filter(Boolean)

  if (parts.length < 4) return null

  const q = parts.join(", ")
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", "1")
  url.searchParams.set("countrycodes", "us")
  url.searchParams.set("q", q)

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  })

  if (!res.ok) return null

  const data = (await res.json()) as { lat?: string; lon?: string }[]
  const first = data[0]
  if (!first?.lat || !first?.lon) return null

  const lat = Number(first.lat)
  const lng = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return { lat, lng }
}

export type GeocodeQueryResult = {
  lat: number
  lng: number
  city?: string
  state?: string
  postalCode?: string
  displayName?: string
}

/** Geocode a free-text US address (e.g. hero search). */
export async function geocodeQuery(q: string): Promise<GeocodeQueryResult | null> {
  const trimmed = q.trim()
  if (!trimmed) return null

  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", "1")
  url.searchParams.set("countrycodes", "us")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("q", trimmed)

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  })

  if (!res.ok) return null

  const data = (await res.json()) as {
    lat?: string
    lon?: string
    display_name?: string
    address?: {
      city?: string
      town?: string
      village?: string
      state?: string
      postcode?: string
      house_number?: string
      road?: string
    }
  }[]

  const first = data[0]
  if (!first?.lat || !first?.lon) return null

  const lat = Number(first.lat)
  const lng = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const addr = first.address
  const city = addr?.city ?? addr?.town ?? addr?.village
  const line1 =
    addr?.house_number && addr?.road ? `${addr.house_number} ${addr.road}` : addr?.road ?? trimmed

  return {
    lat,
    lng,
    city,
    state: addr?.state,
    postalCode: addr?.postcode,
    displayName: first.display_name,
  }
}
