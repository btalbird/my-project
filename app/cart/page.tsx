"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Line = { name: string; qty: number; price: string }

const initialLines: Line[] = [
  { name: "Neighborhood bowl", qty: 1, price: "$14.00" },
  { name: "Seasonal side", qty: 1, price: "$5.50" },
]

export default function CartPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState("Community Kitchen")
  const [deliveryWindow, setDeliveryWindow] = useState("Estimated arrival · 6:15–6:40 PM")
  const [lines, setLines] = useState<Line[]>(initialLines)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const subtotalNums = lines.map((l) => {
    const n = Number.parseFloat(l.price.replace(/[^0-9.]/g, ""))
    return Number.isFinite(n) ? n * l.qty : 0
  })
  const subtotal = subtotalNums.reduce((a, b) => a + b, 0)
  const totalStr = `$${subtotal.toFixed(2)}`

  async function placeOrder() {
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant: restaurant.trim() || "Order",
          lines,
          total: totalStr,
          ...(deliveryWindow.trim() ? { deliveryWindow: deliveryWindow.trim() } : {}),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { id?: number; error?: string }
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please sign in to place an order.")
          return
        }
        setError(typeof data.error === "string" ? data.error : "Could not place order")
        return
      }
      if (typeof data.id === "number") {
        router.push(`/orders/${data.id}`)
        router.refresh()
        return
      }
      setError("Unexpected response from server")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">Cart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Review your items and place a test order. Change quantities or labels below, then checkout.
      </p>

      <Card className="mt-8 border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="restaurant">Restaurant / seller</Label>
            <Input
              id="restaurant"
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              autoComplete="organization"
            />
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
            disabled={pending || lines.length === 0}
            onClick={() => void placeOrder()}
          >
            {pending ? "Placing order…" : "Place order"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
