"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type StoreProduct = {
  id: string
  name: string
  description: string | null
  defaultPrice: {
    id: string
    unit_amount: number | null
    currency: string
  } | null
}

export function StorePageClient({ accountId }: { accountId: string }) {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      toast.success("Payment successful — thank you!")
    } else if (searchParams.get("cancelled") === "1") {
      toast.message("Checkout cancelled.")
    }
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/store/${accountId}/products`)
        const data = (await res.json()) as { products?: StoreProduct[]; error?: string }
        if (!res.ok) {
          throw new Error(typeof data.error === "string" ? data.error : "Failed to load products")
        }
        if (!cancelled) setProducts(data.products ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [accountId])

  async function buy(product: StoreProduct) {
    if (!product.defaultPrice?.id) return
    setPendingId(product.id)
    setError(null)
    try {
      const res = await fetch(`/api/store/${accountId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          priceId: product.defaultPrice.id,
          quantity: 1,
        }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(typeof data.error === "string" ? data.error : "Checkout failed")
        return
      }
      window.location.href = data.url
    } finally {
      setPendingId(null)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Kitchen storefront</h1>
        <p className="text-sm text-muted-foreground">
          Sample Stripe Connect storefront. In production, use a kitchen slug instead of the account
          id in the URL.
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <Card className="mt-8 border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Products</CardTitle>
          <CardDescription>Pay securely with Stripe Checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products listed yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {products.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    {product.description ? (
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    ) : null}
                    <p className="text-sm font-semibold mt-1">
                      {product.defaultPrice?.unit_amount != null
                        ? `$${(product.defaultPrice.unit_amount / 100).toFixed(2)}`
                        : "—"}
                    </p>
                  </div>
                  <Button
                    className="rounded-full shrink-0"
                    disabled={pendingId === product.id || !product.defaultPrice?.id}
                    onClick={() => void buy(product)}
                  >
                    Buy
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
