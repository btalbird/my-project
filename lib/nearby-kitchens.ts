import type { Restaurant } from "@prisma/client"

import { filterAndSortNearbyKitchens, type NearbyKitchenRow } from "@/lib/member-nearby-kitchens"
import { prisma } from "@/lib/db"
import { liveKitchenWhere } from "@/lib/live-kitchens"

const kitchenSelect = {
  id: true,
  name: true,
  image: true,
  cuisine: true,
  rating: true,
  deliveryTime: true,
  deliveryFee: true,
  promo: true,
  latitude: true,
  longitude: true,
  isMehko: true,
  categoryId: true,
  ownerId: true,
} as const

export type NearbyKitchenFilters = {
  category?: string | null
  tagSlugs?: string[]
  q?: string | null
}

export async function loadLiveKitchenRows(filters?: NearbyKitchenFilters) {
  const tagSlugs = filters?.tagSlugs?.filter(Boolean) ?? []
  const category = filters?.category?.trim() || null
  const q = filters?.q?.trim() || null

  const andClauses =
    tagSlugs.length > 0
      ? tagSlugs.map((slug) => ({
          tags: { some: { tag: { slug } } },
        }))
      : []

  return prisma.restaurant.findMany({
    where: {
      ...liveKitchenWhere(),
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { cuisine: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(andClauses.length ? { AND: andClauses } : {}),
    },
    select: kitchenSelect,
  })
}

export async function findNearbyLiveKitchens(
  lat: number,
  lng: number,
  radiusMiles: number,
  filters?: NearbyKitchenFilters,
): Promise<NearbyKitchenRow[]> {
  const rows = await loadLiveKitchenRows(filters)
  return filterAndSortNearbyKitchens(rows, lat, lng, radiusMiles)
}

export function isKitchenWithinRadius(
  kitchen: Pick<Restaurant, "latitude" | "longitude">,
  lat: number,
  lng: number,
  radiusMiles: number,
): boolean {
  if (kitchen.latitude == null || kitchen.longitude == null) return false
  const nearby = filterAndSortNearbyKitchens(
    [
      {
        id: 0,
        name: "",
        image: "",
        cuisine: "",
        rating: 0,
        deliveryTime: "",
        deliveryFee: "",
        promo: null,
        latitude: kitchen.latitude,
        longitude: kitchen.longitude,
        isMehko: true,
      },
    ],
    lat,
    lng,
    radiusMiles,
  )
  return nearby.length > 0
}
