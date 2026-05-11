import { put } from "@vercel/blob"
import { Resvg } from "@resvg/resvg-js"
import { NextResponse } from "next/server"

import { getSessionUser, isAdminRole } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

type Draft = {
  version: 1
  canvas: { width: number; height: number; background: string }
  layers: Array<any>
}

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const contentType = res.headers.get("content-type") ?? "application/octet-stream"
  const buf = Buffer.from(await res.arrayBuffer())
  return `data:${contentType};base64,${buf.toString("base64")}`
}

async function draftToSvg(draft: Draft): Promise<string> {
  const { width, height, background } = draft.canvas

  const parts: string[] = []
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  )
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="${escapeXml(background)}" />`)

  for (const layer of draft.layers ?? []) {
    if (!layer || typeof layer !== "object") continue

    if (layer.type === "rect") {
      const x = Number(layer.x ?? 0)
      const y = Number(layer.y ?? 0)
      const w = Number(layer.width ?? 0)
      const h = Number(layer.height ?? 0)
      const fill = typeof layer.fill === "string" ? layer.fill : "#000000"
      const rotation = Number(layer.rotation ?? 0)
      if (rotation) {
        const cx = x + w / 2
        const cy = y + h / 2
        parts.push(
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${escapeXml(fill)}" transform="rotate(${rotation} ${cx} ${cy})" />`,
        )
      } else {
        parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${escapeXml(fill)}" />`)
      }
      continue
    }

    if (layer.type === "text") {
      const x = Number(layer.x ?? 0)
      const y = Number(layer.y ?? 0)
      const text = typeof layer.text === "string" ? layer.text : ""
      const fontSize = Number(layer.fontSize ?? 32)
      const fill = typeof layer.fill === "string" ? layer.fill : "#000000"
      const rotation = Number(layer.rotation ?? 0)

      // Konva's text y is top-aligned; SVG uses baseline. Approximate with +fontSize.
      const yBaseline = y + fontSize
      if (rotation) {
        parts.push(
          `<text x="${x}" y="${yBaseline}" font-size="${fontSize}" fill="${escapeXml(fill)}" transform="rotate(${rotation} ${x} ${yBaseline})">${escapeXml(
            text,
          )}</text>`,
        )
      } else {
        parts.push(
          `<text x="${x}" y="${yBaseline}" font-size="${fontSize}" fill="${escapeXml(fill)}">${escapeXml(text)}</text>`,
        )
      }
      continue
    }

    if (layer.type === "image") {
      const x = Number(layer.x ?? 0)
      const y = Number(layer.y ?? 0)
      const w = Number(layer.width ?? 0)
      const h = Number(layer.height ?? 0)
      const src = typeof layer.src === "string" ? layer.src : ""
      const rotation = Number(layer.rotation ?? 0)
      if (!src) continue

      const href = src.startsWith("data:") ? src : await fetchAsDataUrl(src)
      if (rotation) {
        const cx = x + w / 2
        const cy = y + h / 2
        parts.push(
          `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${escapeXml(
            href,
          )}" transform="rotate(${rotation} ${cx} ${cy})" />`,
        )
      } else {
        parts.push(`<image x="${x}" y="${y}" width="${w}" height="${h}" href="${escapeXml(href)}" />`)
      }
      continue
    }
  }

  parts.push("</svg>")
  return parts.join("")
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 })
  }

  const { id } = await params
  const design = await prisma.designDocument.findUnique({
    where: { id },
    select: { id: true, name: true, draftJson: true, publishedAssetId: true },
  })
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const draft = design.draftJson as Draft
  if (!draft?.canvas?.width || !draft?.canvas?.height) {
    return NextResponse.json({ error: "Design draft is invalid" }, { status: 400 })
  }

  const svg = await draftToSvg(draft)
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: draft.canvas.width },
    background: draft.canvas.background,
  })
  const png = resvg.render().asPng()

  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-")
  const pathname = `designs/${design.id}/${timestamp}.png`

  const blob = await put(pathname, png, {
    access: "public",
    contentType: "image/png",
    addRandomSuffix: false,
  })

  const asset = await prisma.asset.create({
    data: {
      kind: "DESIGN_EXPORT_PNG",
      url: blob.url,
      contentType: "image/png",
      width: draft.canvas.width,
      height: draft.canvas.height,
      storageProvider: "vercel_blob",
      storageKey: blob.pathname,
      createdById: user.id,
    },
    select: { id: true, url: true },
  })

  const updated = await prisma.designDocument.update({
    where: { id: design.id },
    data: {
      status: "PUBLISHED",
      publishedAssetId: asset.id,
    },
    select: { id: true, status: true, publishedAssetId: true },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "design.publish",
      entityType: "DesignDocument",
      entityId: design.id,
      metadata: { assetId: asset.id, assetUrl: asset.url, name: design.name },
    },
  })

  return NextResponse.json({ ok: true, design: updated, asset })
}

