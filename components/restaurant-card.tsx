"use client"

import { Star, Clock, Heart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface RestaurantCardProps {
  restaurant: {
    id: number
    name: string
    image: string
    cuisine: string
    rating: number
    deliveryTime: string
    deliveryFee: string
    /** Matches demo/DB rows where promo may be null when absent. */
    promo?: string | null
  }
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-2xl bg-secondary aspect-[4/3]">
        {/* Restaurant Image */}
        <Link
          href={`/restaurants/${restaurant.id}`}
          className="block w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-6xl transition-transform duration-300 group-hover:scale-105"
        >
          {restaurant.image}
        </Link>

        {/* Promo Badge */}
        {restaurant.promo && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
            {restaurant.promo}
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            const prev = isFavorite
            setIsFavorite(!prev)
            fetch("/api/favorites/toggle", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ restaurantId: restaurant.id }),
            })
              .then(async (res) => {
                if (res.status === 401) {
                  setIsFavorite(prev)
                  return
                }
                const data = (await res.json().catch(() => ({}))) as { favorited?: boolean }
                if (typeof data.favorited === "boolean") {
                  setIsFavorite(data.favorited)
                } else if (!res.ok) {
                  setIsFavorite(prev)
                }
              })
              .catch(() => {
                setIsFavorite(prev)
              })
          }}
          className="absolute top-3 right-3 w-9 h-9 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-card hover:scale-110"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </button>

        {/* Delivery Time Badge */}
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{restaurant.deliveryTime}</span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/restaurants/${restaurant.id}`}
            className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors"
          >
            {restaurant.name}
          </Link>
          <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg shrink-0">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm font-medium text-foreground">{restaurant.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
        <p className="text-sm text-muted-foreground">{restaurant.deliveryFee} delivery fee</p>
      </div>
    </article>
  )
}
