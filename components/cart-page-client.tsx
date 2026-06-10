"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Line = { name: string; qty: number; price: string }

type CheckoutRestaurant = {
  id: number
  name: string
  cuisine: string
  acceptsPaidOrders: boolean
  distanceMiles?: number
}

const initialLines: Line[] = [
  { name: "Neighborhood bowl", qty: 1, price: "$14.00" },
  { name: "Seasonal side", qty: 1, price: "$5.50" },
]

export function CartPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [restaurants, setRestaurants] = useState<CheckoutRestaurant[]>([])
  const [restaurant, setRestaurant] = useState("")
  const [deliveryWindow, setDeliveryWindow] = useState("Estimated arrival · 6:15–6:40 PM")
  const [lines, setLines] = useState<Line[]>(initialLines)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [loadingKitchens, setLoadingKitchens] = useState(true)
  const [needsAddress, setNeedsAddress] = useState(false)

  useEffect(() => {
    const fromQuery = searchParams.get("restaurant")
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/checkout/restaurants")
        const data = (await res.json()) as {
          restaurants: CheckoutRestaurant[]
          needsAddress?: boolean
        }
        if (cancelled) return
        const list = Array.isArray(data.restaurants) ? data.restaurants : []
        setNeedsAddress(Boolean(data.needsAddress))
        setRestaurants(list)
        const preferred =
          (fromQuery && list.find((r) => r.name === fromQuery)?.name) ||
          list.find((r) => r.acceptsPaidOrders)?.name ||
          list[0]?.name ||
          ""
        setRestaurant(preferred)
      } finally {
        if (!cancelled) setLoadingKitchens(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [searchParams])

  const subtotalNums = lines.map((l) => {
    const n = Number.parseFloat(l.price.replace(/[^0-9.]/g, ""))
    return Number.isFinite(n) ? n * l.qty : 0
  })
  const subtotal = subtotalNums.reduce((a, b) => a + b, 0)
  const totalStr = `$${subtotal.toFixed(2)}`

  const selectedKitchen = restaurants.find((r) => r.name === restaurant)

  async function payWithStripe() {
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant: restaurant.trim() || "Order",
          lines,
          total: totalStr,
          ...(deliveryWindow.trim() ? { deliveryWindow: deliveryWindow.trim() } : {}),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        url?: string
        error?: string
      }
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/signin?next=${encodeURIComponent("/cart")}`)
          return
        }
        setError(typeof data.error === "string" ? data.error : "Could not start checkout")
        return
      }
      if (typeof data.url === "string") {
        window.location.href = data.url
        return
      }
      setError("Unexpected response from server")
    } finally {
      setPending(false)
    }
  }

  const cancelled = searchParams.get("cancelled") === "1"

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">Cart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pay securely at checkout. Your payment goes to the home kitchen (minus any platform fee).
      </p>

      {cancelled ? (
        <p className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Checkout was cancelled. Your cart is still here when you&apos;re ready.
        </p>
      ) : null}

      {needsAddress ? (
        <p className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/delivery" className="font-medium text-primary hover:underline">
            Set your delivery address
          </Link>{" "}
          to see kitchens near you at checkout.
        </p>
      ) : null}

      <Card className="mt-8 border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="restaurant">Kitchen</Label>
            {loadingKitchens ? (
              <p className="text-sm text-muted-foreground">Loading kitchens…</p>
            ) : restaurants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No kitchens available.</p>
            ) : (
              <>
                <Select value={restaurant} onValueChange={setRestaurant}>
                  <SelectTrigger id="restaurant">
                    <SelectValue placeholder="Select a kitchen" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((r) => (
                      <SelectItem key={r.id} value={r.name}>
                        {r.name} · {r.cuisine}
                        {typeof r.distanceMiles === "number"
                          ? ` · ${r.distanceMiles < 10 ? r.distanceMiles.toFixed(1) : Math.round(r.distanceMiles)} mi`
                          : ""}
                        {!r.acceptsPaidOrders ? " (setup pending)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedKitchen && !selectedKitchen.acceptsPaidOrders ? (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    This kitchen hasn&apos;t finished Stripe Connect yet. Choose another kitchen or
                    try again later.
                  </p>
                ) : null}
              </>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="window">Delivery window (optional)</Label>
            <Input
              id="window"
              value={deliveryWindow}
              onChange={(e) => setDeliveryWindow(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Line items</p>
            <ul className="space-y-3 rounded-lg border border-border bg-secondary/20 p-3">
              {lines.map((line, i) => (
                <li key={i} className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Item</Label>
                    <Input
                      value={line.name}
                      onChange={(e) => {
                        const v = e.target.value
                        setLines((prev) => prev.map((x, j) => (j === i ? { ...x, name: v } : x)))
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => {
                        const q = Math.max(1, Number.parseInt(e.target.value, 10) || 1)
                        setLines((prev) => prev.map((x, j) => (j === i ? { ...x, qty: q } : x)))
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Price</Label>
                    <Input
                      value={line.price}
                      onChange={(e) => {
                        const v = e.target.value
                        setLines((prev) => prev.map((x, j) => (j === i ? { ...x, price: v } : x)))
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="flex justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold tabular-nums text-foreground">{totalStr}</span>
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="outline" asChild className="w-full sm:w-auto rounded-full">
            <Link href="/restaurants">Keep browsing</Link>
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto rounded-full"
            disabled={
              pending ||
              lines.length === 0 ||
              !restaurant ||
              loadingKitchens ||
              !selectedKitchen?.acceptsPaidOrders
            }
            onClick={() => void payWithStripe()}
          >
            {pending ? "Redirecting to Stripe…" : "Pay with Stripe"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
