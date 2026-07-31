"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { DEMO_RESTAURANTS } from "@/lib/demo-restaurants"
import { RestaurantCard } from "./restaurant-card"

interface RestaurantGridProps {
  title: string
  subtitle?: string
}

type KitchenRow = {
  id: number
  name: string
  image: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: string
  promo?: string | null
  distanceMiles?: number
}

export function RestaurantGrid({ title, subtitle }: RestaurantGridProps) {
  const [nearby, setNearby] = useState<KitchenRow[]>([])
  const [hasAddress, setHasAddress] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/kitchens/nearby")
        const data = res.ok
          ? ((await res.json()) as { kitchens?: KitchenRow[]; needsAddress?: boolean })
          : { kitchens: [], needsAddress: false }
        if (cancelled) return
        setHasAddress(!data.needsAddress)
        setNearby(Array.isArray(data.kitchens) ? data.kitchens : [])
      } catch {
        if (!cancelled) {
          setHasAddress(false)
          setNearby([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const showNearby = hasAddress && nearby.length > 0

  return (
    <section className="py-10 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showNearby ? (
          <div className="mb-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary-foreground">{title}</h2>
              {subtitle && <p className="text-primary-foreground/85 mt-1">{subtitle}</p>}
            </div>
            {loading ? (
              <p className="text-primary-foreground/85 text-sm">Loading nearby kitchens…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nearby.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-3 text-sm text-primary-foreground/90">
            {loading
              ? "Loading kitchens…"
              : hasAddress
                ? "No live kitchens in your area yet. Be the first cook on your block, or browse preview kitchens below."
                : (
                    <>
                      Enter your{" "}
                      <Link href="/delivery" className="underline underline-offset-2">
                        delivery address
                      </Link>{" "}
                      to see real kitchens near you.
                    </>
                  )}
          </div>
        )}

        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-foreground">Preview kitchens</h2>
            <p className="text-primary-foreground/85 mt-1">Sample listings to explore the experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {DEMO_RESTAURANTS.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
