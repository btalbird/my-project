import JSZip from "jszip"
import { NextResponse } from "next/server"

import { authorizePdfExport } from "@/lib/pdf/auth"
import { renderPagesToPdf } from "@/lib/pdf/generate"
import { getAllExportPaths, pathToFilename } from "@/lib/pdf/routes"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 25

export async function GET(req: Request) {
  const denied = await authorizePdfExport(req)
  if (denied) return denied

  const url = new URL(req.url)
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? "0") || 0)
  const limitParam = Number(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT))
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isFinite(limitParam) ? limitParam : DEFAULT_LIMIT))

  try {
    const allPaths = await getAllExportPaths()
    const slice = allPaths.slice(offset, offset + limit)

    if (slice.length === 0) {
      return NextResponse.json({ error: "No paths in requested range" }, { status: 400 })
    }

    const rendered = await renderPagesToPdf(slice)
    const zip = new JSZip()

    for (const { path, pdf } of rendered) {
      zip.file(pathToFilename(path), pdf)
    }

    const archive = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
    const total = allPaths.length
    const nextOffset = offset + slice.length
    const hasMore = nextOffset < total

    return new NextResponse(new Uint8Array(archive), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="munch-site-pdf-${offset}-${nextOffset - 1}.zip"`,
        "Cache-Control": "no-store",
        "X-Pdf-Export-Offset": String(offset),
        "X-Pdf-Export-Limit": String(limit),
        "X-Pdf-Export-Count": String(slice.length),
        "X-Pdf-Export-Total": String(total),
        "X-Pdf-Export-Next-Offset": hasMore ? String(nextOffset) : "",
      },
    })
  } catch (error) {
    console.error("[api/pdf/site] batch export failed", error)
    return NextResponse.json({ error: "Failed to generate site PDF export" }, { status: 500 })
  }
}
