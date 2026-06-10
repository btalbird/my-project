import { NextResponse } from "next/server"

import { authorizePdfExport } from "@/lib/pdf/auth"
import { renderPageToPdf } from "@/lib/pdf/generate"
import { isExportablePath, normalizeExportPath, pathToFilename } from "@/lib/pdf/routes"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(req: Request) {
  const denied = await authorizePdfExport(req)
  if (denied) return denied

  const url = new URL(req.url)
  const rawPath = url.searchParams.get("path")
  if (!rawPath) {
    return NextResponse.json({ error: "Missing path query parameter" }, { status: 400 })
  }

  let path: string
  try {
    path = normalizeExportPath(rawPath)
  } catch {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  if (!isExportablePath(path)) {
    return NextResponse.json({ error: "Path is not exportable" }, { status: 400 })
  }

  try {
    const pdf = await renderPageToPdf(path)
    const filename = url.searchParams.get("filename")?.trim() || pathToFilename(path)

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[api/pdf] render failed", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
