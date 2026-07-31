"use client"

import { startTransition, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"

import { AddressAutocompleteInput } from "@/components/address-autocomplete-input"
import { RestaurantCard } from "@/components/restaurant-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

type DeliveryPayload = {
  line1: string | null
  line2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  lat: number | null
  lng: number | null
  radiusMiles: number
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
  distanceMiles: number
}

export function MemberPortalClient() {
  const [loading, setLoading] = useState(true)
  const [delivery, setDelivery] = useState<DeliveryPayload | null>(null)
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [city, setCity] = useState("")
  const [stateVal, setStateVal] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [radiusMiles, setRadiusMiles] = useState(10)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [kitchens, setKitchens] = useState<KitchenRow[]>([])
  const [kitchensLoading, setKitchensLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savePending, setSavePending] = useState(false)
  const radiusPatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadDelivery = useCallback(async () => {
    const res = await fetch("/api/member/delivery")
    if (!res.ok) return
    const data = (await res.json()) as { delivery: DeliveryPayload }
    setDelivery(data.delivery)
    setLine1(data.delivery.line1 ?? "")
    setLine2(data.delivery.line2 ?? "")
    setCity(data.delivery.city ?? "")
    setStateVal(data.delivery.state ?? "")
    setPostalCode(data.delivery.postalCode ?? "")
    setRadiusMiles(data.delivery.radiusMiles ?? 10)
    if (data.delivery.lat != null && data.delivery.lng != null) {
      setCoords({ lat: data.delivery.lat, lng: data.delivery.lng })
    }
  }, [])

  const loadKitchens = useCallback(async (radius: number) => {
    setKitchensLoading(true)
    try {
      const res = await fetch(`/api/member/nearby-kitchens?radiusMiles=${encodeURIComponent(String(radius))}`)
      const data = (await res.json()) as { kitchens: KitchenRow[]; needsAddress?: boolean }
      if (data.needsAddress) {
        setKitchens([])
        return
      }
      setKitchens(Array.isArray(data.kitchens) ? data.kitchens : [])
    } finally {
      setKitchensLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await loadDelivery()
      if (cancelled) return
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [loadDelivery])

  useEffect(() => {
    if (loading) return
    if (delivery?.lat != null && delivery?.lng != null) {
      startTransition(() => {
        void loadKitchens(radiusMiles)
      })
    }
  }, [loading, delivery?.lat, delivery?.lng, radiusMiles, loadKitchens])

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSavePending(true)
    try {
      const res = await fetch("/api/member/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line1,
          line2: line2 || undefined,
          city,
          state: stateVal,
          postalCode,
          radiusMiles,
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveError(typeof data.error === "string" ? data.error : "Could not save address")
        return
      }
      await loadDelivery()
      await loadKitchens(radiusMiles)
    } finally {
      setSavePending(false)
    }
  }

  function scheduleRadiusPersist(next: number) {
    setRadiusMiles(next)
    if (radiusPatchTimer.current) clearTimeout(radiusPatchTimer.current)
    radiusPatchTimer.current = setTimeout(() => {
      void fetch("/api/member/delivery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ radiusMiles: next }),
      })
    }, 450)
  }

  const hasCoords = delivery?.lat != null && delivery?.lng != null

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">Loading your portal…</div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Member portal</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Save your home address to see permitted MEHKO home kitchens on Munch within a distance you choose. Straight-line
          miles are shown for discovery; driving time may differ.
        </p>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Delivery address</CardTitle>
          <CardDescription>We use this as your home point for the kitchen map. Address is stored on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void saveAddress(e)} className="space-y-4 max-w-xl">
            {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="addr1">Street address</Label>
              <AddressAutocompleteInput
                id="addr1"
                value={line1}
                onValueChange={(next) => {
                  setLine1(next)
                  setCoords(null)
                }}
                onSelect={(suggestion) => {
                  setLine1(suggestion.line1)
                  setCity(suggestion.city)
                  setStateVal(suggestion.state)
                  setPostalCode(suggestion.postalCode)
                  setCoords({ lat: suggestion.lat, lng: suggestion.lng })
                }}
                placeholder="1234 Maple Ave"
                inputClassName="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-9 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr2">Apt / suite (optional)</Label>
              <Input
                id="addr2"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="Unit 5"
                autoComplete="address-line2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Los Angeles" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="CA" required />
              </div>
            </div>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="zip">ZIP code</Label>
              <Input id="zip" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="90012" required />
            </div>
            <Button type="submit" className="rounded-full" disabled={savePending}>
              {savePending ? "Saving…" : "Save address & refresh kitchens"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl">MEHKO kitchens near you</CardTitle>
          <CardDescription>
            {hasCoords
              ? "Participating home kitchens on the platform within your search radius."
              : "Save a delivery address above to see kitchens."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 max-w-md">
            <div className="flex items-center justify-between gap-4">
              <Label id="radius-label">Search radius</Label>
              <span className="text-sm font-medium tabular-nums text-foreground">{radiusMiles} mi</span>
            </div>
            <Slider
              aria-labelledby="radius-label"
              min={1}
              max={50}
              step={1}
              value={[radiusMiles]}
              onValueChange={(v) => {
                const next = v[0] ?? 10
                scheduleRadiusPersist(next)
              }}
              disabled={!hasCoords}
            />
            <p className="text-xs text-muted-foreground">Default is 10 miles. Drag to shrink or expand (1–50 mi).</p>
          </div>

          {kitchensLoading ? (
            <p className="text-sm text-muted-foreground">Updating kitchen list…</p>
          ) : hasCoords && kitchens.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No participating kitchens in this radius. Try widening the search or check back as more cooks join your
              area.
            </p>
          ) : null}

          {kitchens.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {kitchens.map((r) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={{
                    id: r.id,
                    name: r.name,
                    image: r.image,
                    cuisine: r.cuisine,
                    rating: r.rating,
                    deliveryTime: r.deliveryTime,
                    deliveryFee: r.deliveryFee,
                    promo: r.promo,
                    distanceMiles: r.distanceMiles,
                  }}
                />
              ))}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Map lookup uses{" "}
            <a className="underline hover:text-foreground" href="https://nominatim.openstreetmap.org/" target="_blank" rel="noreferrer">
              OpenStreetMap Nominatim
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        <Link href="/orders" className="text-primary hover:underline">
          View your orders
        </Link>
        {" · "}
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  )
}
