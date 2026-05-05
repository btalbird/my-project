import type { Restaurant } from "@prisma/client"

import { haversineMiles } from "@/lib/haversine-miles"

export type NearbyKitchenRow = Pick<
  Restaurant,
  "id" | "name" | "image" | "cuisine" | "rating" | "deliveryTime" | "deliveryFee" | "promo"
> & { distanceMiles: number }

export function filterAndSortNearbyKitchens(
  rows: (Pick<
    Restaurant,
    "id" | "name" | "image" | "cuisine" | "rating" | "deliveryTime" | "deliveryFee" | "promo" | "latitude" | "longitude" | "isMehko"
  > & { latitude: number | null; longitude: number | null })[],
  userLat: number,
  userLng: number,
  radiusMiles: number,
): NearbyKitchenRow[] {
  const out: NearbyKitchenRow[] = []
  for (const r of rows) {
    if (!r.isMehko) continue
    if (r.latitude == null || r.longitude == null) continue
    const distanceMiles = haversineMiles(userLat, userLng, r.latitude, r.longitude)
    if (distanceMiles > radiusMiles) continue
    out.push({
      id: r.id,
      name: r.name,
      image: r.image,
      cuisine: r.cuisine,
      rating: r.rating,
      deliveryTime: r.deliveryTime,
      deliveryFee: r.deliveryFee,
      promo: r.promo,
      distanceMiles,
    })
  }
  out.sort((a, b) => a.distanceMiles - b.distanceMiles)
  return out
}
