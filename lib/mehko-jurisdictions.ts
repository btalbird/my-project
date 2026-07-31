export type MehkoJurisdictionLevel = "city" | "county"

export type MehkoJurisdictionMatchRules = {
  cities?: string[]
  zipPrefixes?: string[]
  counties?: string[]
  /** Cities excluded when matching by county (e.g. Long Beach within LA County). */
  excludeCities?: string[]
}

export type MehkoJurisdiction = {
  id: string
  name: string
  level: MehkoJurisdictionLevel
  enabled: boolean
  issuingAgencyDefault: string
  matchRules: MehkoJurisdictionMatchRules
  permitNumberPattern?: RegExp
  renewalReminderDays: number
  officialUrl: string
}

export type KitchenAddressForJurisdiction = {
  addressCity?: string | null
  addressState?: string | null
  addressPostalCode?: string | null
}

export const MEHKO_JURISDICTIONS: MehkoJurisdiction[] = [
  {
    id: "long-beach-ca",
    name: "City of Long Beach",
    level: "city",
    enabled: true,
    issuingAgencyDefault: "City of Long Beach Department of Health and Human Services",
    matchRules: {
      cities: ["long beach"],
    },
    renewalReminderDays: 30,
    officialUrl: "https://www.longbeach.gov/health/permits-and-inspections/food-program/",
  },
  {
    id: "los-angeles-county-ca",
    name: "Los Angeles County",
    level: "county",
    enabled: false,
    issuingAgencyDefault: "Los Angeles County Department of Public Health",
    matchRules: {
      counties: ["los angeles"],
      excludeCities: ["long beach", "pasadena", "vernon"],
    },
    renewalReminderDays: 30,
    officialUrl:
      "https://publichealth.lacounty.gov/eh/business/home-based-food-business-operation.htm",
  },
]

const jurisdictionById = new Map(MEHKO_JURISDICTIONS.map((j) => [j.id, j]))

export function getMehkoJurisdiction(id: string): MehkoJurisdiction | undefined {
  return jurisdictionById.get(id)
}

export function getEnabledMehkoJurisdictions(): MehkoJurisdiction[] {
  return MEHKO_JURISDICTIONS.filter((j) => j.enabled)
}

function normalizeCity(city: string | null | undefined): string {
  return city?.trim().toLowerCase() ?? ""
}

function normalizeState(state: string | null | undefined): string {
  const s = state?.trim().toLowerCase() ?? ""
  if (s === "california" || s === "ca") return "CA"
  return s.toUpperCase()
}

function matchesCity(city: string, rules: MehkoJurisdictionMatchRules): boolean {
  if (!rules.cities?.length) return false
  return rules.cities.includes(city)
}

function matchesZip(postalCode: string, rules: MehkoJurisdictionMatchRules): boolean {
  if (!rules.zipPrefixes?.length) return false
  const zip = postalCode.replace(/\D/g, "").slice(0, 5)
  return rules.zipPrefixes.some((prefix) => zip.startsWith(prefix))
}

function matchesCountyCity(city: string, rules: MehkoJurisdictionMatchRules): boolean {
  if (!rules.counties?.length) return false
  if (rules.excludeCities?.includes(city)) return false
  return true
}

export function inferMehkoJurisdiction(address: KitchenAddressForJurisdiction): MehkoJurisdiction | null {
  const state = normalizeState(address.addressState)
  if (state !== "CA") return null

  const city = normalizeCity(address.addressCity)
  const postalCode = address.addressPostalCode?.trim() ?? ""

  for (const jurisdiction of getEnabledMehkoJurisdictions()) {
    const { matchRules } = jurisdiction
    if (matchesCity(city, matchRules)) return jurisdiction
    if (matchesZip(postalCode, matchRules)) return jurisdiction
    if (city && matchesCountyCity(city, matchRules)) return jurisdiction
  }

  return null
}

export function jurisdictionMatchesKitchen(
  jurisdictionId: string,
  address: KitchenAddressForJurisdiction,
): boolean {
  const inferred = inferMehkoJurisdiction(address)
  return inferred?.id === jurisdictionId
}
