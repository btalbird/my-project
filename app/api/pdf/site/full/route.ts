import { NextResponse } from "next/server"

import { authorizePdfExport } from "@/lib/pdf/auth"
import { renderPagesToPdf } from "@/lib/pdf/generate"
import { mergePdfBuffers } from "@/lib/pdf/merge"
import { getAllExportPaths } from "@/lib/pdf/routes"

export const dynamic = "force-dynamic"
export const maxDuration = 300

/**
 * Renders every exportable public page and returns one merged PDF.
 * For large sites, prefer `pnpm pdf:export` locally to avoid serverless timeouts.
 */
export async function GET(req: Request) {
  const denied = await authorizePdfExport(req)
  if (denied) return denied

  try {
    const paths = await getAllExportPaths()
    const rendered = await renderPagesToPdf(paths)
    const merged = await mergePdfBuffers(rendered.map((r) => r.pdf))

    return new NextResponse(new Uint8Array(merged), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="munch-site-full.pdf"',
        "Cache-Control": "no-store",
        "X-Pdf-Export-Page-Count": String(paths.length),
      },
    })
  } catch (error) {
    console.error("[api/pdf/site/full] merged export failed", error)
    return NextResponse.json({ error: "Failed to generate full site PDF" }, { status: 500 })
  }
}
