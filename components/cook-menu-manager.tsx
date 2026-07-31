"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { compressImageFile } from "@/lib/compress-image"
import { menuItemVisual } from "@/lib/menu-item-image"

type MenuItem = {
  id: number
  name: string
  description: string | null
  priceCents: number
  priceLabel: string
  image: string | null
  imageUrl: string | null
  isAvailable: boolean
}

function MenuItemPhoto({
  item,
  uploading,
  onUpload,
  onRemove,
}: {
  item: MenuItem
  uploading: boolean
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const visual = menuItemVisual(item.imageUrl, item.image)

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary/30">
        {visual.kind === "photo" ? (
          <Image
            src={visual.src}
            alt=""
            width={48}
            height={48}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : visual.kind === "emoji" ? (
          <span className="text-xl">{visual.emoji}</span>
        ) : (
          <ImagePlus className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Uploading…
            </>
          ) : visual.kind === "photo" ? (
            "Change photo"
          ) : (
            "Add photo"
          )}
        </Button>
        {visual.kind === "photo" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto px-0 text-xs text-muted-foreground"
            disabled={uploading}
            onClick={onRemove}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function CookMenuManager() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const newPhotoInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch("/api/cook/menu")
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(typeof data.error === "string" ? data.error : "Failed to load menu")
    }
    const data = (await res.json()) as { items: MenuItem[] }
    setItems(data.items ?? [])
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

  useEffect(() => {
    if (!newPhoto) {
      setNewPhotoPreview(null)
      return
    }
    const url = URL.createObjectURL(newPhoto)
    setNewPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [newPhoto])

  async function uploadPhoto(itemId: number, file: File) {
    setUploadingId(itemId)
    setError(null)
    try {
      const compressed = await compressImageFile(file)
      const formData = new FormData()
      formData.append("photo", compressed)
      const res = await fetch(`/api/cook/menu/${itemId}/image`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not upload photo")
        return
      }
      await load()
    } finally {
      setUploadingId(null)
    }
  }

  async function removePhoto(itemId: number) {
    setUploadingId(itemId)
    setError(null)
    try {
      const res = await fetch(`/api/cook/menu/${itemId}/image`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(typeof data.error === "string" ? data.error : "Could not remove photo")
        return
      }
      await load()
    } finally {
      setUploadingId(null)
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const priceCents = Math.round(Number.parseFloat(price.replace(/[^0-9.]/g, "")) * 100)
      if (!Number.isFinite(priceCents) || priceCents < 50) {
        setError("Enter a valid price of at least $0.50")
        return
      }
      const res = await fetch("/api/cook/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          priceCents,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        item?: { id: number }
      }
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not add item")
        return
      }

      if (newPhoto && data.item?.id) {
        await uploadPhoto(data.item.id, newPhoto)
      }

      setName("")
      setDescription("")
      setPrice("")
      setNewPhoto(null)
      if (newPhotoInputRef.current) newPhotoInputRef.current.value = ""
      await load()
    } finally {
      setPending(false)
    }
  }

  async function toggleAvailable(item: MenuItem) {
    const res = await fetch(`/api/cook/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    })
    if (res.ok) await load()
  }

  async function removeItem(id: number) {
    const res = await fetch(`/api/cook/menu/${id}`, { method: "DELETE" })
    if (res.ok) await load()
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading menu…</p>

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Add menu item</CardTitle>
          <CardDescription>Customers order from this list on your kitchen page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void addItem(e)} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="menu-name">Dish name</Label>
              <Input id="menu-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="menu-desc">Description (optional)</Label>
              <Input id="menu-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-price">Price (USD)</Label>
              <Input
                id="menu-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="14.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-photo">Photo (optional)</Label>
              <Input
                id="menu-photo"
                ref={newPhotoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setNewPhoto(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP up to 2 MB.</p>
            </div>
            {newPhotoPreview ? (
              <div className="sm:col-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
                <img
                  src={newPhotoPreview}
                  alt="Preview of new menu item"
                  className="h-28 w-28 rounded-lg border border-border object-cover"
                />
              </div>
            ) : null}
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" disabled={pending} className="rounded-full">
                {pending ? "Adding…" : "Add item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Your menu</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet. Add your first dish above.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <MenuItemPhoto
                          item={item}
                          uploading={uploadingId === item.id}
                          onUpload={(file) => void uploadPhoto(item.id, file)}
                          onRemove={() => void removePhoto(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        {item.description ? (
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        ) : null}
                      </TableCell>
                      <TableCell>{item.priceLabel}</TableCell>
                      <TableCell>
                        <Switch checked={item.isAvailable} onCheckedChange={() => void toggleAvailable(item)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => void removeItem(item.id)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
