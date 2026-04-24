/**
 * California jurisdictions reported as authorizing MEHKO-style programs on the community-maintained list
 * (as reflected on /promos/2). Always confirm with the local environmental health agency.
 */
export const MEHKO_AUTHORIZED_CALIFORNIA_JURISDICTIONS = [
  "Alameda County",
  "Amador County",
  "Contra Costa County",
  "Imperial County",
  "Lake County",
  "Los Angeles County",
  "Monterey County",
  "Riverside County",
  "San Benito County",
  "San Diego County",
  "San Mateo County",
  "Santa Barbara County",
  "Santa Clara County",
  "Santa Cruz County",
  "Sierra County",
  "Solano County",
  "Sonoma County",
  "City of Berkeley (independent)",
] as const

export const MEHKO_LA_COUNTY_PROGRAM_CAVEAT =
  "Some cities operate their own environmental health departments even within a county program. For example, Los Angeles County notes that Pasadena, Long Beach, and Vernon are excluded from the LA County program."

export const MEHKO_ORG_CA_COUNTIES_URL =
  "https://mehko.org/list-california-counties-mehko-accepting-applications/"

export type MehkoRelatedLegislation = {
  jurisdiction: string
  summary: string
  url: string
}

/** Examples with official sources; verify current status before relying on this list. */
export const MEHKO_RELATED_LEGISLATION_WATCHLIST: MehkoRelatedLegislation[] = [
  {
    jurisdiction: "Washington State (United States)",
    summary:
      "Senate Bill 5605 (2025–26 regular session) concerns authorizing and permitting microenterprise home kitchen operations. Funding, committee action, and effective dates can change—use the legislature’s bill page for the latest status.",
    url: "https://app.leg.wa.gov/billsummary?BillNumber=5605&Initiative=false&Year=2025",
  },
]
