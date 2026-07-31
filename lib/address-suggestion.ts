export type AddressSuggestion = {
  id: string
  label: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  lat: number
  lng: number
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: {
    osm_id?: number
    osm_type?: string
    name?: string
    street?: string
    housenumber?: string
    postcode?: string
    city?: string
    town?: string
    village?: string
    hamlet?: string
    municipality?: string
    county?: string
    state?: string
    country?: string
    countrycode?: string
  }
}

const US_STATE_ABBREV: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
}

function normalizeState(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? ""
  if (!trimmed) return ""
  if (trimmed.length === 2) return trimmed.toUpperCase()
  return US_STATE_ABBREV[trimmed.toLowerCase()] ?? trimmed
}

function pickCity(props: PhotonFeature["properties"]): string {
  if (!props) return ""
  return (
    props.city?.trim() ||
    props.town?.trim() ||
    props.village?.trim() ||
    props.hamlet?.trim() ||
    props.municipality?.trim() ||
    props.county?.trim() ||
    ""
  )
}

function buildLine1(props: PhotonFeature["properties"]): string {
  if (!props) return ""
  const street = props.street?.trim() ?? ""
  const housenumber = props.housenumber?.trim() ?? ""
  if (housenumber && street) return `${housenumber} ${street}`
  if (street) return street
  return props.name?.trim() ?? ""
}

function formatLabel(parts: string[]): string {
  return parts.filter(Boolean).join(", ")
}

export function parsePhotonFeature(feature: PhotonFeature, index: number): AddressSuggestion | null {
  const coords = feature.geometry?.coordinates
  if (!coords || coords.length < 2) return null

  const props = feature.properties
  const country = props?.countrycode?.toLowerCase() ?? props?.country?.toLowerCase() ?? ""
  if (country && country !== "us" && country !== "united states") return null

  const lng = coords[0]
  const lat = coords[1]
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const line1 = buildLine1(props)
  const city = pickCity(props)
  const state = normalizeState(props?.state)
  const postalCode = props?.postcode?.trim() ?? ""

  if (!line1 && !city) return null

  const label = formatLabel([
    line1 || props?.name?.trim() || "",
    city,
    state,
    postalCode,
  ])

  const id =
    props?.osm_id != null && props?.osm_type
      ? `${props.osm_type}-${props.osm_id}`
      : `${lat.toFixed(5)},${lng.toFixed(5)}-${index}`

  return {
    id,
    label,
    line1: line1 || props?.name?.trim() || city,
    line2: null,
    city,
    state,
    postalCode,
    lat,
    lng,
  }
}

export async function searchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim()
  if (q.length < 3) return []

  const url = new URL("https://photon.komoot.io/api/")
  url.searchParams.set("q", q)
  url.searchParams.set("limit", "8")
  url.searchParams.set("lang", "en")
  // Continental US bounding box
  url.searchParams.set("bbox", "-125.0,24.0,-66.0,49.5")

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) return []

  const data = (await res.json()) as { features?: PhotonFeature[] }
  const features = Array.isArray(data.features) ? data.features : []

  const seen = new Set<string>()
  const out: AddressSuggestion[] = []

  for (let i = 0; i < features.length; i++) {
    const suggestion = parsePhotonFeature(features[i], i)
    if (!suggestion) continue
    const key = `${suggestion.label}|${suggestion.postalCode}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(suggestion)
    if (out.length >= 6) break
  }

  return out
}
