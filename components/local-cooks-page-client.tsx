"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PersonalChefCard } from "@/components/personal-chef-card"
import { RestaurantCard } from "@/components/restaurant-card"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import type { PersonalChef } from "@/lib/neighborhood-chefs"
import { filterChefsByQuery } from "@/lib/neighborhood-chefs"

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
  sampleChefs: PersonalChef[]
}

export function LocalCooksPageClient({ sampleChefs }: Props) {
  const [query, setQuery] = useState("")
  const [nearby, setNearby] = useState<KitchenRow[]>([])
  const [deliveryLabel, setDeliveryLabel] = useState("Your delivery area")
  const [needsAddress, setNeedsAddress] = useState(true)
  const [monthlyListingFee, setMonthlyListingFee] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetch("/api/kitchens/nearby"), fetch("/api/delivery"), fetch("/api/cooks/listing-fee")])
      .then(async ([nearbyRes, deliveryRes, feeRes]) => {
        const nearbyData = (await nearbyRes.json()) as {
          kitchens?: KitchenRow[]
          needsAddress?: boolean
        }
        const deliveryData = (await deliveryRes.json()) as {
          delivery?: { snippet?: string; formatted?: string } | null
        }
        const feeData = (await feeRes.json()) as { fee?: { label?: string } }
        if (cancelled) return
        setNeedsAddress(Boolean(nearbyData.needsAddress))
        setNearby(Array.isArray(nearbyData.kitchens) ? nearbyData.kitchens : [])
        setDeliveryLabel(
          deliveryData.delivery?.snippet ||
            deliveryData.delivery?.formatted ||
            "Your delivery area",
        )
        if (typeof feeData.fee?.label === "string") {
          setMonthlyListingFee(feeData.fee.label)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const filteredSamples = useMemo(() => filterChefsByQuery(sampleChefs, query), [sampleChefs, query])
  const filteredNearby = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return nearby
    return nearby.filter(
      (k) => k.name.toLowerCase().includes(q) || k.cuisine.toLowerCase().includes(q),
    )
  }, [nearby, query])

  const totalLive = filteredNearby.length
  const totalSamples = filteredSamples.length

  return (
    <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/community/our-story" className="hover:text-foreground transition-colors">
            Community
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">Local cooks</span>
        </nav>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              MEHKO Certified Chefs in your neighborhood
            </h1>
            <p className="text-muted-foreground">
              Meet MEHKO home kitchens serving near your address, sorted by distance.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Serving near</p>
                <p className="text-sm font-semibold text-foreground">{deliveryLabel}</p>
                <Button variant="link" className="h-auto p-0 text-sm" asChild>
                  <Link href="/delivery">Update delivery address</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-sm text-muted-foreground">
            {query.trim() ? (
              <>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {totalLive + totalSamples}
                </span>{" "}
                results matching your search.
              </>
            ) : needsAddress ? (
              <>Set your delivery address to see live kitchens near you.</>
            ) : (
              <>
                <span className="font-medium text-foreground">{totalLive}</span> live kitchen
                {totalLive === 1 ? "" : "s"} near this address.
              </>
            )}
          </p>
          <div className="w-full sm:max-w-md">
            <SearchBar value={query} onChange={setQuery} placeholder="Search cooks or cuisines" />
          </div>
        </div>

        {!needsAddress && filteredNearby.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-serif text-xl font-bold text-foreground">Kitchens near you</h2>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNearby.map((kitchen) => (
                <RestaurantCard
                  key={kitchen.id}
                  restaurant={{
                    ...kitchen,
                    monthlyListingFee: monthlyListingFee ?? undefined,
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="font-serif text-xl font-bold text-foreground">Sample chef profiles</h2>
          <p className="mt-1 text-sm text-muted-foreground">Preview profiles for the local cooks experience.</p>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredSamples.map((chef) => (
              <PersonalChefCard
                key={chef.id}
                chef={chef}
                monthlyListingFee={monthlyListingFee ?? undefined}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
