import { notFound } from "next/navigation"

import { StaffRestaurantForm } from "@/components/staff-restaurant-form"
import { prisma } from "@/lib/db"

export default async function StaffRestaurantEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const restaurantId = Number(id)
  if (!Number.isFinite(restaurantId)) notFound()

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      id: true,
      name: true,
      image: true,
      cuisine: true,
      rating: true,
      deliveryTime: true,
      deliveryFee: true,
      promo: true,
    },
  })
  if (!restaurant) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">{restaurant.name}</h1>
        <p className="mt-1 text-muted-foreground">Restaurant id {restaurant.id}</p>
      </div>
      <StaffRestaurantForm restaurant={restaurant} />
    </div>
  )
}
