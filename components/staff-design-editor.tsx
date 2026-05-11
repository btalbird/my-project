"use client"

import type { ContentStatus } from "@prisma/client"
import { Image as KonvaImage, Rect, Stage, Layer, Text as KonvaText, Transformer } from "react-konva"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import type Konva from "konva"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type DesignRecord = {
  id: string
  name: string
  status: ContentStatus
  draftJson: unknown
  publishedAssetId: string | null
}

type Props = {
  design: DesignRecord
  canPublish: boolean
}

type DesignLayer =
  | {
      id: string
      type: "rect"
      x: number
      y: number
      width: number
      height: number
      fill: string
      rotation?: number
    }
  | {
      id: string
      type: "text"
      x: number
      y: number
      text: string
      fontSize: number
      fill: string
      rotation?: number
    }
  | {
      id: string
      type: "image"
      x: number
      y: number
      width: number
      height: number
      src: string
      rotation?: number
    }

type DesignDraft = {
  version: 1
  canvas: { width: number; height: number; background: string }
  layers: DesignLayer[]
}

function isDraft(v: unknown): v is DesignDraft {
  if (!v || typeof v !== "object") return false
  const o = v as any
  return (
    o.version === 1 &&
    o.canvas &&
    typeof o.canvas.width === "number" &&
    typeof o.canvas.height === "number" &&
    typeof o.canvas.background === "string" &&
    Array.isArray(o.layers)
  )
}

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Image failed to load"))
    img.src = src
  })
}

export function StaffDesignEditor({ design, canPublish }: Props) {
  const router = useRouter()
  const [name, setName] = useState(design.name)
  const [draft, setDraft] = useState<DesignDraft>(() => {
    if (isDraft(design.draftJson)) return design.draftJson
    return {
      version: 1 as const,
      canvas: { width: 1200, height: 628, background: "#ffffff" },
      layers: [],
    }
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const statusLabel = useMemo(() => (design.status === "PUBLISHED" ? "Published" : "Draft"), [design.status])

  useEffect(() => {
    const tr = transformerRef.current
    const stage = stageRef.current
    if (!tr || !stage) return

    if (!selectedId) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }

    const node = stage.findOne(`#${selectedId}`)
    if (!node) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }

    tr.nodes([node as any])
    tr.getLayer()?.batchDraw()
  }, [selectedId, draft.layers.length])

  const draftJsonText = useMemo(() => JSON.stringify(draft, null, 2), [draft])

  async function onSave() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/staff/designs/${design.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, draftJson: draft }),
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

  function updateLayer(id: string, patch: Partial<DesignLayer>) {
    setDraft((d) => ({
      ...d,
      layers: d.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as any) : l)),
    }))
  }

  function onLayerTransformEnd(node: Konva.Node) {
    const id = node.id()
    const layer = draft.layers.find((l) => l.id === id)
    if (!layer) return

    if (layer.type === "text") {
      updateLayer(id, { x: node.x(), y: node.y(), rotation: node.rotation() })
      return
    }

    const k = node as Konva.Rect
    const scaleX = k.scaleX()
    const scaleY = k.scaleY()
    k.scaleX(1)
    k.scaleY(1)

    updateLayer(id, {
      x: k.x(),
      y: k.y(),
      width: Math.max(4, k.width() * scaleX),
      height: Math.max(4, k.height() * scaleY),
      rotation: k.rotation(),
    } as any)
  }

  async function onAddImage() {
    const src = window.prompt("Image URL")
    if (!src) return
    setError(null)
    try {
      const img = await loadImage(src)
      const w = Math.min(600, img.naturalWidth || 600)
      const h = Math.round((w / Math.max(1, img.naturalWidth || w)) * (img.naturalHeight || 400))
      const layer: DesignLayer = {
        id: newId("img"),
        type: "image",
        src,
        x: 40,
        y: 40,
        width: w,
        height: h,
      }
      setDraft((d) => ({ ...d, layers: [...d.layers, layer] }))
      setSelectedId(layer.id)
    } catch {
      setError("Could not load image")
    }
  }

  async function onPublish() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/staff/designs/${design.id}/publish`, { method: "POST" })
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

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Design editor</CardTitle>
        <CardDescription>
          Status: {statusLabel}
          {design.publishedAssetId ? " · Export ready" : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const layer: DesignLayer = {
                    id: newId("rect"),
                    type: "rect",
                    x: 80,
                    y: 80,
                    width: 320,
                    height: 180,
                    fill: "#111827",
                  }
                  setDraft((d) => ({ ...d, layers: [...d.layers, layer] }))
                  setSelectedId(layer.id)
                }}
              >
                Add rectangle
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const layer: DesignLayer = {
                    id: newId("text"),
                    type: "text",
                    x: 110,
                    y: 110,
                    text: "Headline",
                    fontSize: 48,
                    fill: "#111827",
                  }
                  setDraft((d) => ({ ...d, layers: [...d.layers, layer] }))
                  setSelectedId(layer.id)
                }}
              >
                Add text
              </Button>
              <Button type="button" variant="outline" onClick={() => void onAddImage()}>
                Add image
              </Button>
            </div>

            <div className="overflow-hidden rounded-md border bg-background">
              <Stage
                ref={stageRef}
                width={draft.canvas.width}
                height={draft.canvas.height}
                className="max-w-full"
                onMouseDown={(e) => {
                  const clickedOnEmpty = e.target === e.target.getStage()
                  if (clickedOnEmpty) setSelectedId(null)
                }}
              >
                <Layer>
                  <Rect
                    x={0}
                    y={0}
                    width={draft.canvas.width}
                    height={draft.canvas.height}
                    fill={draft.canvas.background}
                    listening={false}
                  />

                  {draft.layers.map((l) => {
                    const common = {
                      id: l.id,
                      key: l.id,
                      x: l.x,
                      y: l.y,
                      rotation: l.rotation ?? 0,
                      onClick: () => setSelectedId(l.id),
                      onTap: () => setSelectedId(l.id),
                      draggable: true,
                      onDragEnd: (e: any) => updateLayer(l.id, { x: e.target.x(), y: e.target.y() } as any),
                      onTransformEnd: (e: any) => onLayerTransformEnd(e.target),
                    }

                    if (l.type === "rect") {
                      return <Rect {...common} width={l.width} height={l.height} fill={l.fill} />
                    }
                    if (l.type === "text") {
                      return <KonvaText {...common} text={l.text} fontSize={l.fontSize} fill={l.fill} />
                    }
                    return <DesignImage {...common} width={l.width} height={l.height} src={l.src} />
                  })}

                  <Transformer
                    ref={transformerRef}
                    rotateEnabled
                    enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                  />
                </Layer>
              </Stage>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <p className="text-sm font-medium">Layers</p>
              <div className="mt-3 space-y-2">
                {draft.layers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add a rectangle, text, or image to start.</p>
                ) : (
                  draft.layers
                    .slice()
                    .reverse()
                    .map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setSelectedId(l.id)}
                        className={[
                          "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm",
                          selectedId === l.id ? "border-primary" : "border-border/60 hover:border-border",
                        ].join(" ")}
                      >
                        <span className="font-medium">
                          {l.type === "rect" ? "Rectangle" : l.type === "text" ? "Text" : "Image"}
                        </span>
                        <span className="text-xs text-muted-foreground">{l.id.slice(0, 8)}</span>
                      </button>
                    ))
                )}
              </div>
            </div>

            <div className="rounded-md border p-4">
              <p className="text-sm font-medium">Draft JSON (debug)</p>
              <Textarea value={draftJsonText} readOnly className="mt-3 min-h-[240px] font-mono text-xs" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3">
        <Button onClick={() => void onSave()} disabled={pending}>
          {pending ? "Saving…" : "Save draft"}
        </Button>
        {canPublish ? (
          <Button type="button" variant="default" onClick={() => void onPublish()} disabled={pending}>
            {pending ? "Publishing…" : "Publish"}
          </Button>
        ) : null}
        <Button type="button" variant="outline" asChild>
          <Link href="/staff/designs">Back to designs</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function DesignImage({
  src,
  ...props
}: {
  src: string
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  draggable: boolean
  onClick: () => void
  onTap: () => void
  onDragEnd: (e: any) => void
  onTransformEnd: (e: any) => void
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    let cancelled = false
    setImage(null)
    loadImage(src)
      .then((img) => {
        if (!cancelled) setImage(img)
      })
      .catch(() => {
        if (!cancelled) setImage(null)
      })
    return () => {
      cancelled = true
    }
  }, [src])

  return <KonvaImage image={image ?? undefined} {...props} />
}

