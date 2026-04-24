/** Demo community-led partners (replace with CMS or DB when available). */
export type CommunityPartner = {
  id: string
  name: string
  neighborhood: string
  description: string
  imageSrc: string
  websiteUrl: string | null
  socialLabel: string
  socialUrl: string | null
}

export const COMMUNITY_PARTNERS: CommunityPartner[] = [
  {
    id: "oakland-third-place",
    name: "East Bay Third Place Collective",
    neighborhood: "Oakland, CA",
    description:
      "Runs a weekly living-room-style gathering and micro-library in a storefront donated by neighbors. Donations support snacks, childcare stipends, and guest teachers from the block.",
    imageSrc:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop",
    websiteUrl: "https://example.org/east-bay-third-place",
    socialLabel: "Instagram",
    socialUrl: "https://instagram.com",
  },
  {
    id: "sunset-childcare",
    name: "Sunset Family Circle",
    neighborhood: "San Francisco, CA",
    description:
      "Coordinates sliding-scale childcare swaps and a shared playroom so parents can work a few hours without losing a whole paycheck. Partners with local MEHKO cooks for family meal nights.",
    imageSrc:
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&q=80&auto=format&fit=crop",
    websiteUrl: "https://example.org/sunset-family-circle",
    socialLabel: "Facebook",
    socialUrl: "https://facebook.com",
  },
  {
    id: "riverside-essentials",
    name: "Riverside Essentials Table",
    neighborhood: "Los Angeles, CA",
    description:
      "Distributes hygiene kits, socks, and ready-to-eat meals at a weekly sidewalk table. Works with unhoused neighbors to decide what shows up each week—no one-size-fits-all bags.",
    imageSrc:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80&auto=format&fit=crop",
    websiteUrl: null,
    socialLabel: "X",
    socialUrl: "https://x.com",
  },
  {
    id: "san-jose-seminars",
    name: "South Bay Skills Share",
    neighborhood: "San Jose, CA",
    description:
      "Hosts free evening seminars on budgeting for food, starting a cottage business, and reading nutrition labels—taught by neighbors who actually live here.",
    imageSrc:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80&auto=format&fit=crop",
    websiteUrl: "https://example.org/south-bay-skills",
    socialLabel: "Instagram",
    socialUrl: "https://instagram.com",
  },
  {
    id: "sacramento-mutual-aid",
    name: "Capitol Corridor Mutual Aid",
    neighborhood: "Sacramento, CA",
    description:
      "Grassroots network for grocery rides, fridge restocks after hospital stays, and pop-up produce stands sourced from small growers. In The Kitchen profit share helps cover fuel and cold bags.",
    imageSrc:
      "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800&q=80&auto=format&fit=crop",
    websiteUrl: "https://example.org/capitol-corridor-aid",
    socialLabel: "Instagram",
    socialUrl: "https://instagram.com",
  },
  {
    id: "long-beach-youth",
    name: "Harbor Youth Studio",
    neighborhood: "Long Beach, CA",
    description:
      "After-school space for teens to cook together, learn knife skills safely, and take meals home to siblings. Partners with local chefs for guest demos once a month.",
    imageSrc:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop",
    websiteUrl: null,
    socialLabel: "YouTube",
    socialUrl: "https://youtube.com",
  },
]
