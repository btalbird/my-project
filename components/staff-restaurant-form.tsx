"use client"

import type { Restaurant } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  restaurant: Pick<
    Restaurant,
    "id" | "name" | "image" | "cuisine" | "rating" | "deliveryTime" | "deliveryFee" | "promo"
  >
}

export function StaffRestaurantForm({ restaurant }: Props) {
  const router = useRouter()
  const [name, setName] = useState(restaurant.name)
  const [image, setImage] = useState(restaurant.image)
  const [cuisine, setCuisine] = useState(restaurant.cuisine)
  const [rating, setRating] = useState(String(restaurant.rating))
  const [deliveryTime, setDeliveryTime] = useState(restaurant.deliveryTime)
  const [deliveryFee, setDeliveryFee] = useState(restaurant.deliveryFee)
  const [promo, setPromo] = useState(restaurant.promo ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const ratingNum = Number(rating)
    if (!Number.isFinite(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      setError("Rating must be between 0 and 5")
      return
    }
    setPending(true)
    try {
      const res = await fetch(`/api/staff/restaurants/${restaurant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image,
          cuisine,
          rating: ratingNum,
          deliveryTime,
          deliveryFee,
          promo: promo.trim() === "" ? null : promo.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Save failed")
        return
      }
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Edit listing</CardTitle>
        <CardDescription>Public-facing name, imagery, and promo copy.</CardDescription>
      </CardHeader>
      <form onSubmit={(ev) => void onSubmit(ev)}>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {error ? (
            <p className="text-sm text-destructive sm:col-span-2" role="alert">
              {error}
            </p>
          ) : null}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cuisine">Cuisine label</Label>
            <Input id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0–5)</Label>
            <Input id="rating" type="number" step="0.1" min={0} max={5} value={rating} onChange={(e) => setRating(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Delivery time text</Label>
            <Input id="deliveryTime" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryFee">Delivery fee text</Label>
            <Input id="deliveryFee" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="promo">Promo (optional)</Label>
            <Input id="promo" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Leave empty to clear" />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/staff/restaurants">Back to list</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
