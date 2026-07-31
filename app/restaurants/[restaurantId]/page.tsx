import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RestaurantCartLink, RestaurantMenuClient } from "@/components/restaurant-menu-client"
import { getDemoRestaurantById } from "@/lib/demo-restaurants"
import { prisma } from "@/lib/db"
import { liveKitchenWhere } from "@/lib/live-kitchens"
import { formatCents } from "@/lib/money"

type DisplayRestaurant = {
  id: number
  name: string
  image: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: string
  promo: string | null
  isDemo: boolean
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>
}) {
  const { restaurantId } = await params
  const id = Number(restaurantId)

  let fromDatabase: DisplayRestaurant | null = null
  let menuItems: {
    id: number
    name: string
    description: string | null
    priceCents: number
    priceLabel: string
    image: string | null
    imageUrl: string | null
  }[] = []

  if (Number.isFinite(id)) {
    try {
      const row = await prisma.restaurant.findFirst({
        where: { id, ...liveKitchenWhere() },
        select: {
          id: true,
          name: true,
          image: true,
          cuisine: true,
          rating: true,
          deliveryTime: true,
          deliveryFee: true,
          promo: true,
          isDemo: true,
        },
      })
      if (row) {
        fromDatabase = row
        const items = await prisma.menuItem.findMany({
          where: { restaurantId: id, isAvailable: true },
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        })
        menuItems = items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          priceCents: item.priceCents,
          priceLabel: formatCents(item.priceCents),
          image: item.image,
          imageUrl: item.imageUrl,
        }))
      }
    } catch {
      fromDatabase = null
    }
  }

  const demo = Number.isFinite(id) ? getDemoRestaurantById(id) : undefined
  const restaurant = fromDatabase ?? (demo ? { ...demo, id, isDemo: true } : null)
  const usingDemoFallback = !fromDatabase && Boolean(demo)

  if (!restaurant) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/restaurants" className="hover:text-foreground transition-colors">
          Restaurants
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-foreground">{restaurant.name}</span>
      </nav>

      {usingDemoFallback ? (
        <p className="mt-6 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          Preview data (database unavailable or this ID isn&apos;t in the DB yet). Run Postgres and{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">node ./scripts/seed.mjs</code> for
          live listings.
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-secondary text-6xl sm:h-32 sm:w-32">
          {restaurant.image}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{restaurant.name}</h1>
          <p className="mt-2 text-muted-foreground">{restaurant.cuisine}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Rating <span className="font-medium text-foreground">{restaurant.rating.toFixed(1)}</span>
            <span className="mx-2 text-border">•</span>
            {restaurant.deliveryTime}
            <span className="mx-2 text-border">•</span>
            {restaurant.deliveryFee} delivery fee
          </p>
          {restaurant.promo ? (
            <p className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {restaurant.promo}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {fromDatabase ? <RestaurantCartLink restaurantName={restaurant.name} /> : null}
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/restaurants">More kitchens</Link>
            </Button>
          </div>
        </div>
      </div>

      <Card className="mt-10 border-2 border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Menu</CardTitle>
          <CardDescription>
            {fromDatabase
              ? "Add items to your cart, then check out securely with Stripe."
              : "Dishes from this kitchen will show here when the menu is connected."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fromDatabase ? (
            <RestaurantMenuClient
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
              items={menuItems}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No menu items yet.</p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
