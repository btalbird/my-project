"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

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
  formatted?: string | null
  snippet?: string | null
}

type Props = {
  title?: string
  description?: string
  onSaved?: (delivery: DeliveryPayload) => void
}

export function DeliveryAddressForm({
  title = "Delivery address",
  description = "We use your address to show MEHKO kitchens near you and sort them by distance.",
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(true)
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [city, setCity] = useState("")
  const [stateVal, setStateVal] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [radiusMiles, setRadiusMiles] = useState(10)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savePending, setSavePending] = useState(false)
  const radiusPatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/delivery")
      if (!res.ok) {
        if (!cancelled) setLoading(false)
        return
      }
      const data = (await res.json()) as { delivery: DeliveryPayload | null }
      if (cancelled) return
      if (data.delivery) {
        setLine1(data.delivery.line1 ?? "")
        setLine2(data.delivery.line2 ?? "")
        setCity(data.delivery.city ?? "")
        setStateVal(data.delivery.state ?? "")
        setPostalCode(data.delivery.postalCode ?? "")
        setRadiusMiles(data.delivery.radiusMiles ?? 10)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSavePending(true)
    try {
      const res = await fetch("/api/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line1,
          line2: line2 || undefined,
          city,
          state: stateVal,
          postalCode,
          radiusMiles,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveError(typeof data.error === "string" ? data.error : "Could not save address")
        return
      }
      const saved = (data as { delivery: DeliveryPayload }).delivery
      onSaved?.(saved)
    } finally {
      setSavePending(false)
    }
  }

  function scheduleRadiusPersist(next: number) {
    setRadiusMiles(next)
    if (radiusPatchTimer.current) clearTimeout(radiusPatchTimer.current)
    radiusPatchTimer.current = setTimeout(() => {
      void fetch("/api/delivery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ radiusMiles: next }),
      })
    }, 450)
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading delivery settings…</p>
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void saveAddress(e)} className="space-y-4">
          {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="delivery-line1">Street address</Label>
              <Input id="delivery-line1" value={line1} onChange={(e) => setLine1(e.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="delivery-line2">Apt / suite (optional)</Label>
              <Input id="delivery-line2" value={line2} onChange={(e) => setLine2(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-city">City</Label>
              <Input id="delivery-city" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-state">State</Label>
              <Input id="delivery-state" value={stateVal} onChange={(e) => setStateVal(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-zip">ZIP code</Label>
              <Input id="delivery-zip" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-sm">
              <Label>Search radius</Label>
              <span className="font-medium">{radiusMiles} mi</span>
            </div>
            <Slider
              min={1}
              max={50}
              step={1}
              value={[radiusMiles]}
              onValueChange={(v) => scheduleRadiusPersist(v[0] ?? 10)}
            />
          </div>

          <Button type="submit" disabled={savePending} className="rounded-full">
            {savePending ? "Saving…" : "Save delivery address"}
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          Signed in? Your address is also saved to your{" "}
          <Link href="/member" className="text-primary hover:underline">
            member portal
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  )
}
