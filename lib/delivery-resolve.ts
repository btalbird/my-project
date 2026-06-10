import { cookiePayloadToDelivery, readDeliveryCookie } from "@/lib/delivery-context"
import { DEFAULT_RADIUS_MILES } from "@/lib/delivery-address"
import { prisma } from "@/lib/db"
import { getSessionUserId } from "@/lib/session"

export type ResolvedDelivery = {
  lat: number
  lng: number
  radiusMiles: number
  line1: string | null
  line2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  formatted: string | null
  source: "member" | "cookie" | "params"
}

export async function resolveDeliveryFromRequest(req: Request): Promise<ResolvedDelivery | null> {
  const url = new URL(req.url)
  const paramLat = url.searchParams.get("lat")
  const paramLng = url.searchParams.get("lng")
  const paramRadius = url.searchParams.get("radiusMiles")

  if (paramLat != null && paramLng != null) {
    const lat = Number(paramLat)
    const lng = Number(paramLng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      let radiusMiles = DEFAULT_RADIUS_MILES
      if (paramRadius != null) {
        const n = Number(paramRadius)
        if (Number.isFinite(n)) radiusMiles = n
      }
      return {
        lat,
        lng,
        radiusMiles,
        line1: null,
        line2: null,
        city: null,
        state: null,
        postalCode: null,
        formatted: null,
        source: "params",
      }
    }
  }

  const userId = await getSessionUserId()
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        deliveryLine1: true,
        deliveryLine2: true,
        deliveryCity: true,
        deliveryState: true,
        deliveryPostalCode: true,
        deliveryLat: true,
        deliveryLng: true,
        kitchenSearchRadiusMiles: true,
      },
    })
    if (user?.deliveryLat != null && user?.deliveryLng != null) {
      return {
        lat: user.deliveryLat,
        lng: user.deliveryLng,
        radiusMiles: user.kitchenSearchRadiusMiles ?? DEFAULT_RADIUS_MILES,
        line1: user.deliveryLine1,
        line2: user.deliveryLine2,
        city: user.deliveryCity,
        state: user.deliveryState,
        postalCode: user.deliveryPostalCode,
        formatted: [user.deliveryLine1, user.deliveryCity, user.deliveryState, user.deliveryPostalCode]
          .filter(Boolean)
          .join(", "),
        source: "member",
      }
    }
  }

  const cookie = await readDeliveryCookie()
  if (cookie) {
    const delivery = cookiePayloadToDelivery(cookie)
    return {
      lat: delivery.lat,
      lng: delivery.lng,
      radiusMiles: delivery.radiusMiles,
      line1: delivery.line1,
      line2: delivery.line2,
      city: delivery.city,
      state: delivery.state,
      postalCode: delivery.postalCode,
      formatted: delivery.formatted,
      source: "cookie",
    }
  }

  return null
}
