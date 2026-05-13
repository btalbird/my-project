"use client"

import { DEMO_RESTAURANTS } from "@/lib/demo-restaurants"
import { RestaurantCard } from "./restaurant-card"

interface RestaurantGridProps {
  title: string
  subtitle?: string
}

export function RestaurantGrid({ title, subtitle }: RestaurantGridProps) {
  return (
    <section className="py-10 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary-foreground">{title}</h2>
          {subtitle && <p className="text-primary-foreground/85 mt-1">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DEMO_RESTAURANTS.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </section>
  )
}
