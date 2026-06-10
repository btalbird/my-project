import type { Prisma } from "@prisma/client"

/** Customer-facing live kitchens: cook-owned, geocoded, not demo. */
export const liveKitchenWhere: Prisma.RestaurantWhereInput = {
  isMehko: true,
  isPublished: true,
  isDemo: false,
  ownerId: { not: null },
  latitude: { not: null },
  longitude: { not: null },
}

export function formatDeliverySnippet(city: string | null | undefined, postalCode: string | null | undefined): string {
  const parts = [city?.trim(), postalCode?.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : "Set delivery address"
}

export function formatAddressLine(
  line1: string | null | undefined,
  city: string | null | undefined,
  state: string | null | undefined,
  postalCode: string | null | undefined,
): string {
  const parts = [line1?.trim(), city?.trim(), state?.trim(), postalCode?.trim()].filter(Boolean)
  return parts.join(", ")
}
