"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { addToCart } from "@/lib/cart-storage"
import { menuItemVisual } from "@/lib/menu-item-image"

type MenuItem = {
  id: number
  name: string
  description: string | null
  priceCents: number
  priceLabel: string
  image: string | null
  imageUrl: string | null
}

type Props = {
  restaurantId: number
  restaurantName: string
  items: MenuItem[]
}

export function RestaurantMenuClient({ restaurantId, restaurantName, items }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/me")
      .then(async (res) => {
        const data = (await res.json()) as { userId?: string | null }
        if (!cancelled) setUserId(data.userId ?? null)
      })
      .catch(() => {
        if (!cancelled) setUserId(null)
      })
    return () => {
      cancelled = true
    }
  }, [pathname])

  function handleAdd(item: MenuItem) {
    if (!userId) {
      toast.error("Sign in to add items to your cart")
      router.push(`/signin?next=${encodeURIComponent(pathname)}`)
      return
    }

    setPendingId(item.id)
    const result = addToCart(userId, restaurantId, restaurantName, {
      id: item.id,
      name: item.name,
      priceCents: item.priceCents,
    })
    setPendingId(null)

    if (!result.ok && result.reason === "sign_in_required") {
      toast.error("Sign in to add items to your cart")
      router.push(`/signin?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (!result.ok && result.reason === "different_restaurant") {
      toast.error("Your cart has items from another kitchen. Clear your cart first.")
      return
    }

    toast.success(`Added ${item.name}`)
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No menu items yet.</p>
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const visual = menuItemVisual(item.imageUrl, item.image)
        return (
        <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              {visual.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element -- menu photos may be data URLs
                <img
                  src={visual.src}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
                />
              ) : visual.kind === "emoji" ? (
                <span className="text-2xl">{visual.emoji}</span>
              ) : null}
              <div className="min-w-0">
                <h3 className="font-medium text-foreground">{item.name}</h3>
                {item.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                ) : null}
                <p className="mt-1 text-sm font-semibold text-foreground">{item.priceLabel}</p>
              </div>
            </div>
          </div>
          <Button
            className="rounded-full shrink-0"
            disabled={pendingId === item.id || userId === undefined}
            onClick={() => handleAdd(item)}
          >
            Add to cart
          </Button>
        </li>
        )
      })}
    </ul>
  )
}

export function RestaurantCartLink({ restaurantName }: { restaurantName: string }) {
  return (
    <Button asChild className="rounded-full">
      <Link href={`/cart?restaurant=${encodeURIComponent(restaurantName)}`}>View cart</Link>
    </Button>
  )
}
