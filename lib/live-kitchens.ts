import type { Prisma } from "@prisma/client"

/** Customer-facing live kitchens: cook-owned, geocoded, subscribed, permit-verified, not demo. */
export function liveKitchenWhere(now = new Date()): Prisma.RestaurantWhereInput {
  return {
    isMehko: true,
    isPublished: true,
    isDemo: false,
    ownerId: { not: null },
    latitude: { not: null },
    longitude: { not: null },
    owner: {
      cookSubscription: {
        status: "active",
      },
    },
    mehkoPermit: {
      status: "approved",
      expiresAt: { gt: now },
    },
  }
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
