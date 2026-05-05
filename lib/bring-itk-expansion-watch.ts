/**
 * Bring Munch — MEHKO expansion & advocacy watchlist
 *
 * Editors: add, remove, or edit rows here to update the public page. Prefer:
 * - Official .gov / .ca.gov / legislature domains for `officialUrl`
 * - Short, verifiable status lines (avoid promises about passage dates)
 *
 * `level` is only for display chips in the UI.
 */
export type BringItkWatchEntry = {
  id: string
  jurisdiction: string
  level: "state" | "county" | "city"
  /** One or two sentences: what is happening or what is true today. */
  status: string
  /** Practical ways readers can engage (hearings, comment, contacting reps). */
  howToHelp: string
  /** Primary official resource readers should use. */
  officialUrl: string
  officialLinkLabel: string
}

export const BRING_ITK_EXPANSION_WATCHLIST: BringItkWatchEntry[] = [
  {
    id: "washington-sb5605",
    jurisdiction: "Washington State",
    level: "state",
    status:
      "The 2025–26 legislature is considering SB 5605, which would create a statewide framework for permitting microenterprise home kitchen operations with local health jurisdiction permits and inspections.",
    howToHelp:
      "Follow committee hearings on the official bill page, sign up for alerts from your district legislators, and submit written testimony when windows open.",
    officialUrl: "https://app.leg.wa.gov/billsummary?BillNumber=5605&Initiative=false&Year=2025",
    officialLinkLabel: "Washington State Legislature — SB 5605",
  },
  {
    id: "california-cdph-framework",
    jurisdiction: "California (statewide MEHKO framework)",
    level: "state",
    status:
      "MEHKO has existed in statute since 2019, but each city or county must still opt in through local ordinances and environmental health programs—adoption speed varies widely.",
    howToHelp:
      "Ask your county board of supervisors and city council to place MEHKO adoption on the agenda, and request a public workshop from environmental health with CDPH materials in hand.",
    officialUrl:
      "https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/MicroenterpriseHomeKitchenOperations.aspx",
    officialLinkLabel: "CDPH — Microenterprise Home Kitchen Operations",
  },
  {
    id: "orange-county-ca",
    jurisdiction: "Orange County, California",
    level: "county",
    status:
      "Community trackers list Orange County among jurisdictions that had not authorized MEHKO programs as of mid-2025—meaning home MEHKO sales are not permitted there until local action is taken.",
    howToHelp:
      "Use the county environmental health portal to understand current retail food programs, then engage the Board of Supervisors through public comment when MEHKO is agendized.",
    officialUrl: "https://ochca.gov/programs/environmental-health",
    officialLinkLabel: "Orange County Health Care Agency — Environmental Health",
  },
  {
    id: "pasadena-ca",
    jurisdiction: "Pasadena, California",
    level: "city",
    status:
      "Independent cities sometimes evaluate their own programs separately from county environmental health. Check city agendas and notices for workshops or ordinances related to home kitchen retail.",
    howToHelp:
      "Monitor City Clerk agendas, speak during public comment, and coordinate with neighbors who want a safe, permitted path for home kitchens.",
    officialUrl: "https://www.cityofpasadena.net/government/city-clerk/agendas-and-notices/",
    officialLinkLabel: "City of Pasadena — City Clerk (agendas & notices)",
  },
]
