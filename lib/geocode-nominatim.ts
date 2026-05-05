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
