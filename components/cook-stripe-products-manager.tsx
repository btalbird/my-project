"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type StripeProduct = {
  id: string
  name: string
  description: string | null
  defaultPrice: {
    id: string
    unit_amount: number | null
    currency: string
  } | null
}

export function CookStripeProductsManager() {
  const [accountId, setAccountId] = useState<string | null>(null)
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch("/api/cook/stripe-products")
    const data = (await res.json()) as {
      accountId?: string
      products?: StripeProduct[]
      error?: string
    }
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Failed to load Stripe products")
    }
    setAccountId(data.accountId ?? null)
    setProducts(data.products ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await load()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  async function createProduct(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const priceCents = Math.round(Number.parseFloat(price.replace(/[^0-9.]/g, "")) * 100)
      if (!Number.isFinite(priceCents) || priceCents < 50) {
        setError("Enter a valid price of at least $0.50")
        return
      }
      const res = await fetch("/api/cook/stripe-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          priceCents,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not create product")
        return
      }
      setName("")
      setDescription("")
      setPrice("")
      toast.success("Stripe product created")
      await load()
    } finally {
      setPending(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading Stripe products…</p>

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Stripe catalog</CardTitle>
          <CardDescription>
            Products live on your connected Stripe account. Customers can buy them from your sample
            storefront.
            {accountId ? (
              <>
                {" "}
                <Link href={`/store/${accountId}`} className="text-primary underline-offset-4 hover:underline">
                  View storefront
                </Link>
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void createProduct(e)} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="stripe-product-name">Product name</Label>
              <Input id="stripe-product-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="stripe-product-desc">Description</Label>
              <Input
                id="stripe-product-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-product-price">Price (USD)</Label>
              <Input
                id="stripe-product-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="12.00"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={pending} className="rounded-full">
                {pending ? "Creating…" : "Create Stripe product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Your Stripe products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No Stripe products yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {products.map((product) => (
                <li key={product.id} className="py-3">
                  <p className="font-medium">{product.name}</p>
                  {product.description ? (
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  ) : null}
                  <p className="text-sm font-semibold mt-1">
                    {product.defaultPrice?.unit_amount != null
                      ? `$${(product.defaultPrice.unit_amount / 100).toFixed(2)}`
                      : "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
