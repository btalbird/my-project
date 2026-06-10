"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { RestaurantCard } from "@/components/restaurant-card"

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

type Props = {
  categorySlug: string
  categoryName: string
}

export function CategoryPageClient({ categorySlug, categoryName }: Props) {
  const [kitchens, setKitchens] = useState<KitchenRow[]>([])
  const [needsAddress, setNeedsAddress] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch(`/api/kitchens/nearby?category=${encodeURIComponent(categorySlug)}`)
      const data = (await res.json()) as { kitchens?: KitchenRow[]; needsAddress?: boolean }
      if (cancelled) return
      setNeedsAddress(Boolean(data.needsAddress))
      setKitchens(Array.isArray(data.kitchens) ? data.kitchens : [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [categorySlug])

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-foreground">{categoryName}</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">{categoryName}</h1>
      <p className="mt-2 text-muted-foreground">MEHKO kitchens near you in this category.</p>

      {needsAddress ? (
        <div className="mt-6 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/delivery" className="font-medium text-primary hover:underline">
            Set your delivery address
          </Link>{" "}
          to see {categoryName.toLowerCase()} kitchens sorted by distance.
        </div>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading kitchens…</p>
      ) : kitchens.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No live {categoryName.toLowerCase()} kitchens in your search radius yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {kitchens.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </main>
  )
}
