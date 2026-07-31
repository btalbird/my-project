"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, MapPin, Pencil } from "lucide-react"
import { toast } from "sonner"

import { AddressAutocompleteInput } from "@/components/address-autocomplete-input"
import { Badge } from "@/components/ui/badge"
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

function applyKitchenToForm(kitchen: Kitchen, setters: {
  setName: (v: string) => void
  setCuisine: (v: string) => void
  setCategoryId: (v: string) => void
  setAddressLine1: (v: string) => void
  setAddressLine2: (v: string) => void
  setAddressCity: (v: string) => void
  setAddressState: (v: string) => void
  setAddressPostalCode: (v: string) => void
  setCoords: (v: { lat: number; lng: number } | null) => void
}) {
  setters.setName(kitchen.name)
  setters.setCuisine(kitchen.cuisine)
  setters.setCategoryId(kitchen.category ? String(kitchen.category.id) : "")
  setters.setAddressLine1(kitchen.addressLine1 ?? "")
  setters.setAddressLine2(kitchen.addressLine2 ?? "")
  setters.setAddressCity(kitchen.addressCity ?? "")
  setters.setAddressState(kitchen.addressState ?? "")
  setters.setAddressPostalCode(kitchen.addressPostalCode ?? "")
  if (kitchen.latitude != null && kitchen.longitude != null) {
    setters.setCoords({ lat: kitchen.latitude, lng: kitchen.longitude })
  } else {
    setters.setCoords(null)
  }
}

export function CookKitchenSetupForm({ onSaved }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [existing, setExisting] = useState<Kitchen | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [addressCity, setAddressCity] = useState("")
  const [addressState, setAddressState] = useState("")
  const [addressPostalCode, setAddressPostalCode] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(true)

  const formSetters = {
    setName,
    setCuisine,
    setCategoryId,
    setAddressLine1,
    setAddressLine2,
    setAddressCity,
    setAddressState,
    setAddressPostalCode,
    setCoords,
  }

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
          applyKitchenToForm(data.kitchen, formSetters)
          setEditing(false)
        } else {
          setEditing(true)
        }
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startEditing() {
    if (existing) {
      applyKitchenToForm(existing, formSetters)
    }
    setError(null)
    setEditing(true)
  }

  function cancelEditing() {
    if (existing) {
      applyKitchenToForm(existing, formSetters)
      setEditing(false)
      setError(null)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const wasCreate = !existing
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
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
      }
      const res = await fetch("/api/cook/kitchen", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => ({}))) as { kitchen?: Kitchen; error?: string }
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save kitchen")
        return
      }
      if (data.kitchen) {
        setExisting(data.kitchen)
        applyKitchenToForm(data.kitchen, formSetters)
      }
      setEditing(false)
      toast.success(
        wasCreate ? "Kitchen listing created" : "Kitchen listing updated",
        {
          description: wasCreate
            ? "Your kitchen is on file. Complete permit verification to go live."
            : "Your changes have been saved.",
        },
      )
      onSaved()
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading kitchen setup…</p>
  }

  if (existing && !editing) {
    const addressWithLine2 = [existing.addressLine1, existing.addressLine2].filter(Boolean).join(", ")

    return (
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="font-serif text-xl">{existing.name}</CardTitle>
              <CardDescription className="mt-1">
                Your kitchen listing is saved. Customers will see it once your permit is approved and
                your listing is live.
              </CardDescription>
            </div>
            <Badge variant={existing.isPublished ? "default" : "secondary"}>
              {existing.isPublished ? "Published" : "Not live yet"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cuisine</dt>
              <dd className="mt-1 text-sm font-medium">{existing.cuisine}</dd>
            </div>
            {existing.category ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</dt>
                <dd className="mt-1 text-sm font-medium">{existing.category.name}</dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</dt>
              <dd className="mt-1 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  {addressWithLine2}
                  <br />
                  {[existing.addressCity, existing.addressState, existing.addressPostalCode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </dd>
            </div>
          </dl>
          {existing.latitude != null && existing.longitude != null ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Geocoded for nearby search at {existing.latitude.toFixed(4)}, {existing.longitude.toFixed(4)}
            </p>
          ) : null}
          <Button type="button" variant="outline" className="rounded-full" onClick={startEditing}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit kitchen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="font-serif text-xl">
          {existing ? "Edit kitchen listing" : "Set up your kitchen"}
        </CardTitle>
        <CardDescription>
          {existing
            ? "Update your kitchen name, cuisine, or permitted address."
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
              <AddressAutocompleteInput
                id="kitchen-line1"
                value={addressLine1}
                onValueChange={(next) => {
                  setAddressLine1(next)
                  setCoords(null)
                }}
                onSelect={(suggestion) => {
                  setAddressLine1(suggestion.line1)
                  setAddressCity(suggestion.city)
                  setAddressState(suggestion.state)
                  setAddressPostalCode(suggestion.postalCode)
                  setCoords({ lat: suggestion.lat, lng: suggestion.lng })
                }}
                inputClassName="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-9 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
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
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending} className="rounded-full">
              {pending ? "Saving…" : existing ? "Save changes" : "Create kitchen listing"}
            </Button>
            {existing ? (
              <Button type="button" variant="ghost" disabled={pending} onClick={cancelEditing}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
