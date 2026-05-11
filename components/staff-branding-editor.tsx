"use client"

import type { BrandThemeV1 } from "@/lib/brand-theme"
import { defaultBrandThemeV1 } from "@/lib/brand-theme"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

type Props = {
  canPublish: boolean
}

export function StaffBrandingEditor({ canPublish }: Props) {
  const router = useRouter()
  const [theme, setTheme] = useState<BrandThemeV1>(defaultBrandThemeV1)
  const [published, setPublished] = useState<BrandThemeV1 | null>(null)
  const [status, setStatus] = useState<string>("DRAFT")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/staff/branding")
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (!cancelled) setError(typeof data.error === "string" ? data.error : "Load failed")
          return
        }
        if (!cancelled) {
          if (data.draft) setTheme(data.draft as BrandThemeV1)
          if (data.published) setPublished(data.published as BrandThemeV1)
          if (typeof data.status === "string") setStatus(data.status)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function patch<K extends keyof BrandThemeV1>(key: K, value: BrandThemeV1[K]) {
    setTheme((t) => ({ ...t, [key]: value }))
  }

  async function onSave() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch("/api/staff/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Save failed")
        return
      }
      setStatus("DRAFT")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  async function onPublish() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch("/api/staff/branding/publish", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Publish failed")
        return
      }
      setStatus("PUBLISHED")
      setPublished(theme)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading branding…</p>
  }

  const colorFields: Array<{ key: keyof BrandThemeV1; label: string }> = [
    { key: "primary", label: "Primary" },
    { key: "primaryForeground", label: "Primary foreground" },
    { key: "accent", label: "Accent" },
    { key: "accentForeground", label: "Accent foreground" },
    { key: "background", label: "Background" },
    { key: "foreground", label: "Foreground" },
    { key: "secondary", label: "Secondary" },
    { key: "secondaryForeground", label: "Secondary foreground" },
    { key: "muted", label: "Muted" },
    { key: "mutedForeground", label: "Muted foreground" },
    { key: "border", label: "Border" },
    { key: "card", label: "Card" },
    { key: "cardForeground", label: "Card foreground" },
  ]

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Site branding</CardTitle>
        <CardDescription>
          Live status: {status}
          {published ? " · Published theme exists" : " · No published theme yet (defaults from CSS)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="wordmark">Wordmark</Label>
            <Input id="wordmark" value={theme.wordmark} onChange={(e) => patch("wordmark", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={theme.tagline} onChange={(e) => patch("tagline", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="logoUrl">Logo image URL (optional)</Label>
            <Input
              id="logoUrl"
              value={theme.logoUrl ?? ""}
              onChange={(e) => patch("logoUrl", e.target.value || null)}
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label>Corner radius ({theme.radiusRem}rem)</Label>
          </div>
          <Slider
            value={[theme.radiusRem]}
            min={0}
            max={2}
            step={0.125}
            onValueChange={(v) => patch("radiusRem", v[0] ?? 0.625)}
          />
        </div>

        <div className="space-y-2 max-w-md">
          <Label>Body font</Label>
          <Select value={theme.fontPreset} onValueChange={(v) => patch("fontPreset", v as BrandThemeV1["fontPreset"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geist">Geist (default)</SelectItem>
              <SelectItem value="system">System UI</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Colors</p>
          <p className="text-xs text-muted-foreground mb-4">
            Use CSS color values: hex (#1a2b3c) or oklch(0.5 0.1 250).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {colorFields.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={String(theme[key])}
                  onChange={(e) => patch(key, e.target.value as never)}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Button onClick={() => void onSave()} disabled={pending}>
          {pending ? "Saving…" : "Save draft"}
        </Button>
        {canPublish ? (
          <Button type="button" onClick={() => void onPublish()} disabled={pending}>
            {pending ? "Publishing…" : "Publish to site"}
          </Button>
        ) : null}
        <Button type="button" variant="outline" asChild>
          <Link href="/staff">Back to staff</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
