"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Category = { id: number; name: string; slug: string }

type Kitchen = {
  id: number
  name: string
  cuisine: string
  image: string
  addressLine1: string | null
  addressLine2: string | null
  addressCity: string | null
  addressState: string | null
  addressPostalCode: string | null
  latitude: number | null
  longitude: number | null
  isPublished: boolean
  category: { id: number; name: string; slug: string } | null
}

type Props = {
  onSaved: () => void
}

export function CookKitchenSetupForm({ onSaved }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [existing, setExisting] = useState<Kitchen | null>(null)
  const [name, setName] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [addressCity, setAddressCity] = useState("")
  const [addressState, setAddressState] = useState("")
  const [addressPostalCode, setAddressPostalCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [catRes, kitchenRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/cook/kitchen"),
      ])
      if (cancelled) return
      if (catRes.ok) {
        setCategories((await catRes.json()) as Category[])
      }
      if (kitchenRes.ok) {
        const data = (await kitchenRes.json()) as { kitchen: Kitchen | null }
        if (data.kitchen) {
          setExisting(data.kitchen)
          setName(data.kitchen.name)
          setCuisine(data.kitchen.cuisine)
          setCategoryId(data.kitchen.category ? String(data.kitchen.category.id) : "")
          setAddressLine1(data.kitchen.addressLine1 ?? "")
          setAddressLine2(data.kitchen.addressLine2 ?? "")
          setAddressCity(data.kitchen.addressCity ?? "")
          setAddressState(data.kitchen.addressState ?? "")
          setAddressPostalCode(data.kitchen.addressPostalCode ?? "")
        }
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const payload = {
        name,
        cuisine,
        categoryId: categoryId ? Number(categoryId) : undefined,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        addressCity,
        addressState,
        addressPostalCode,
      }
      const res = await fetch("/api/cook/kitchen", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save kitchen")
        return
      }
      onSaved()
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading kitchen setup…</p>
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="font-serif text-xl">
          {existing ? "Your kitchen listing" : "Set up your kitchen"}
        </CardTitle>
        <CardDescription>
          {existing
            ? "Customers with a saved delivery address will see your kitchen when they are within their search radius."
            : "Add your permitted home kitchen address so neighbors can find you by distance."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kitchen-name">Kitchen name</Label>
              <Input id="kitchen-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kitchen-cuisine">Cuisine</Label>
              <Input
                id="kitchen-cuisine"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="Korean, Mexican, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kitchen-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="kitchen-category">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kitchen-line1">Kitchen street address</Label>
              <Input
                id="kitchen-line1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="kitchen-line2">Apt / suite (optional)</Label>
              <Input id="kitchen-line2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kitchen-city">City</Label>
              <Input id="kitchen-city" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kitchen-state">State</Label>
              <Input
                id="kitchen-state"
                value={addressState}
                onChange={(e) => setAddressState(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kitchen-zip">ZIP code</Label>
              <Input
                id="kitchen-zip"
                value={addressPostalCode}
                onChange={(e) => setAddressPostalCode(e.target.value)}
                required
              />
            </div>
          </div>
          {existing?.latitude != null && existing?.longitude != null ? (
            <p className="text-sm text-muted-foreground">
              Listed at {existing.latitude.toFixed(4)}, {existing.longitude.toFixed(4)} — visible to customers searching
              nearby.
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="rounded-full">
            {pending ? "Saving…" : existing ? "Update kitchen" : "Create kitchen listing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
