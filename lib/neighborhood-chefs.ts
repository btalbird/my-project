export type PersonalChef = {
  id: string
  name: string
  /** Portrait for the card; swap for uploaded chef photos later. */
  photoUrl: string
  photoAlt: string
  /** Short line about their cooking. */
  quip: string
  healthPermitNumber: string
  issuingAgency: string
  websiteUrl: string
}

/** Placeholder neighborhood label until delivery address is stored client- or server-side. */
export const DEFAULT_NEIGHBORHOOD_LABEL = "Your delivery area"

export const NEIGHBORHOOD_CHEFS: PersonalChef[] = [
  {
    id: "marisol-vega",
    name: "Marisol Vega",
    photoUrl:
      "https://images.unsplash.com/photo-1583394291164-47e15d9c08a3?w=600&h=750&fit=crop&q=80",
    photoAlt: "Marisol Vega smiling in a kitchen apron",
    quip: "Weeknight Oaxacan mole and citrus tacos—always from scratch, never rushed.",
    healthPermitNumber: "RHF-2024-08412",
    issuingAgency: "County of Santa Clara Department of Environmental Health",
    websiteUrl: "https://example.com/marisol-kitchen",
  },
  {
    id: "james-okonkwo",
    name: "James Okonkwo",
    photoUrl:
      "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&h=750&fit=crop&q=80",
    photoAlt: "James Okonkwo in chef whites",
    quip: "Low-and-slow jollof, suya skewers, and vegan egusi for the whole block.",
    healthPermitNumber: "MEHO-ME-441902",
    issuingAgency: "Alameda County Environmental Health",
    websiteUrl: "https://example.com/taste-of-lagos-bay",
  },
  {
    id: "linh-tran",
    name: "Linh Tran",
    photoUrl:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=750&fit=crop&q=80",
    photoAlt: "Linh Tran plating fresh herbs",
    quip: "Saigon-style pho broth simmered 12 hours; summer rolls picked that morning.",
    healthPermitNumber: "CFP-SF-239881-B",
    issuingAgency: "San Francisco Department of Public Health — Environmental Health Branch",
    websiteUrl: "https://example.com/broth-and-basil",
  },
  {
    id: "sofia-ricci",
    name: "Sofia Ricci",
    photoUrl:
      "https://images.unsplash.com/photo-1594736797933-d0d2c0b0f9c3?w=600&h=750&fit=crop&q=80",
    photoAlt: "Sofia Ricci holding a wooden spoon",
    quip: "Sicilian Sunday gravy, hand-rolled gnocchi, and gluten-free tiramisu on request.",
    healthPermitNumber: "SMC-EH-7783401",
    issuingAgency: "San Mateo County Environmental Health Services",
    websiteUrl: "https://example.com/casa-ricci-meals",
  },
  {
    id: "david-park",
    name: "David Park",
    photoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&q=80",
    photoAlt: "David Park in a casual shirt",
    quip: "Korean fried chicken, kimchi jjigae, and banchan sets sized for families.",
    healthPermitNumber: "RME-2025-00934",
    issuingAgency: "County of Santa Clara Department of Environmental Health",
    websiteUrl: "https://example.com/seoul-street-at-home",
  },
]

/** Case-insensitive search across name, quip, permit, agency, and id. All whitespace-separated terms must match. */
export function filterChefsByQuery(chefs: PersonalChef[], query: string): PersonalChef[] {
  const raw = query.trim().toLowerCase()
  if (!raw) return chefs

  const tokens = raw.split(/\s+/).filter(Boolean)
  return chefs.filter((chef) => {
    const hay = [chef.name, chef.quip, chef.healthPermitNumber, chef.issuingAgency, chef.id, chef.photoAlt]
      .join(" ")
      .toLowerCase()
    return tokens.every((t) => hay.includes(t))
  })
}
