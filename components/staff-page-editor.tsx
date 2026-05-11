"use client"

import type { ContentStatus } from "@prisma/client"
import type { CmsBlock } from "@/components/cms-sections"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type PageRecord = {
  id: string
  title: string
  slug: string
  status: ContentStatus
  draftSections: unknown
  publishedVersionId: string | null
}

type Props = {
  page: PageRecord
  canPublish: boolean
}

function newBlockId() {
  return `blk_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
}

function normalizeBlocks(raw: unknown): CmsBlock[] {
  if (!Array.isArray(raw)) return []
  return raw as CmsBlock[]
}

export function StaffPageEditor({ page, canPublish }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(page.title)
  const [slug, setSlug] = useState(page.slug)
  const [sections, setSections] = useState<CmsBlock[]>(() => normalizeBlocks(page.draftSections))
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const statusLabel = useMemo(() => (page.status === "PUBLISHED" ? "Published" : "Draft"), [page.status])
  const publicPath = useMemo(() => `/${slug}`, [slug])

  async function onSave() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/staff/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, draftSections: sections }),
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

  async function onPublish() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/staff/pages/${page.id}/publish`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Publish failed")
        return
      }
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir
    if (j < 0 || j >= sections.length) return
    setSections((s) => {
      const next = [...s]
      const t = next[idx]!
      next[idx] = next[j]!
      next[j] = t
      return next
    })
  }

  function removeAt(idx: number) {
    setSections((s) => s.filter((_, i) => i !== idx))
  }

  function addHero() {
    setSections((s) => [
      ...s,
      {
        id: newBlockId(),
        type: "hero",
        heading: "Headline",
        subheading: "Supporting copy.",
        ctaText: "Learn more",
        ctaHref: "/help",
      },
    ])
  }

  function addImage() {
    setSections((s) => [
      ...s,
      { id: newBlockId(), type: "image", assetUrl: "", alt: "", caption: "" },
    ])
  }

  function addRich() {
    setSections((s) => [
      ...s,
      { id: newBlockId(), type: "richText", markdown: "## Section\n\nParagraph text." },
    ])
  }

  function updateBlock(idx: number, patch: Record<string, string | undefined>) {
    setSections((s) =>
      s.map((b, i) => (i === idx ? ({ ...b, ...patch } as CmsBlock) : b)),
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Page editor</CardTitle>
        <CardDescription>
          Status: {statusLabel}
          {page.publishedVersionId ? " · Published version exists" : ""}
          {slug === "home" ? " · This slug controls the top of `/` when published." : null}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            <p className="text-xs text-muted-foreground">Public path: {publicPath}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={addHero}>
            Add hero
          </Button>
          <Button type="button" variant="outline" onClick={addImage}>
            Add image
          </Button>
          <Button type="button" variant="outline" onClick={addRich}>
            Add text
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={publicPath} target="_blank">
              Open public URL
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Sections</p>
          {sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sections yet. Add a block above.</p>
          ) : (
            sections.map((b, idx) => (
              <Card key={b.id ?? idx} className="border bg-muted/30">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 py-3">
                  <CardTitle className="text-base capitalize">{b.type === "richText" ? "Text" : b.type}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => move(idx, -1)} disabled={idx === 0}>
                      Up
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => move(idx, 1)}
                      disabled={idx === sections.length - 1}
                    >
                      Down
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => removeAt(idx)}>
                      Remove
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {b.type === "hero" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Heading</Label>
                        <Input
                          value={b.heading ?? ""}
                          onChange={(e) => updateBlock(idx, { heading: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subheading</Label>
                        <Input
                          value={b.subheading ?? ""}
                          onChange={(e) => updateBlock(idx, { subheading: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Button label</Label>
                          <Input value={b.ctaText ?? ""} onChange={(e) => updateBlock(idx, { ctaText: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Button link</Label>
                          <Input value={b.ctaHref ?? ""} onChange={(e) => updateBlock(idx, { ctaHref: e.target.value })} />
                        </div>
                      </div>
                    </>
                  ) : null}
                  {b.type === "image" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={b.assetUrl ?? ""}
                          onChange={(e) => updateBlock(idx, { assetUrl: e.target.value })}
                          placeholder="https://…"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Alt text</Label>
                        <Input value={b.alt ?? ""} onChange={(e) => updateBlock(idx, { alt: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Caption (optional)</Label>
                        <Input value={b.caption ?? ""} onChange={(e) => updateBlock(idx, { caption: e.target.value })} />
                      </div>
                    </>
                  ) : null}
                  {b.type === "richText" ? (
                    <div className="space-y-2">
                      <Label>Text (markdown-lite: lines, or ## headings)</Label>
                      <Textarea
                        className="min-h-[120px] font-mono text-xs"
                        value={b.markdown ?? ""}
                        onChange={(e) => updateBlock(idx, { markdown: e.target.value })}
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3">
        <Button onClick={() => void onSave()} disabled={pending}>
          {pending ? "Saving…" : "Save draft"}
        </Button>
        {canPublish ? (
          <Button type="button" onClick={() => void onPublish()} disabled={pending}>
            {pending ? "Publishing…" : "Publish"}
          </Button>
        ) : null}
        <Button type="button" variant="outline" asChild>
          <Link href="/staff/pages">Back to pages</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
