import type { Browser } from "puppeteer-core"

import { launchBrowser } from "@/lib/pdf/browser"
import { CONFIDENTIAL_HEADER, PDF_FOOTER, PDF_MARGINS } from "@/lib/pdf/confidential-header"

const PRINT_QUERY = "print=1"

export function getPdfBaseUrl(): string {
  const configured = process.env.PDF_BASE_URL?.trim()
  if (configured) return configured.replace(/\/$/, "")

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, "")}`

  const port = process.env.PORT ?? "3002"
  return `http://localhost:${port}`
}

function buildPageUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const base = getPdfBaseUrl()
  const separator = normalized.includes("?") ? "&" : "?"
  return `${base}${normalized}${separator}${PRINT_QUERY}`
}

export async function renderPageToPdf(path: string, browser?: Browser): Promise<Buffer> {
  const ownsBrowser = !browser
  const activeBrowser = browser ?? (await launchBrowser())

  try {
    const page = await activeBrowser.newPage()
    await page.goto(buildPageUrl(path), {
      waitUntil: "networkidle0",
      timeout: 60_000,
    })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: CONFIDENTIAL_HEADER,
      footerTemplate: PDF_FOOTER,
      margin: PDF_MARGINS,
    })

    await page.close()
    return Buffer.from(pdf)
  } finally {
    if (ownsBrowser) {
      await activeBrowser.close()
    }
  }
}

export async function renderPagesToPdf(
  paths: string[],
): Promise<Array<{ path: string; pdf: Buffer }>> {
  const browser = await launchBrowser()
  const results: Array<{ path: string; pdf: Buffer }> = []

  try {
    for (const path of paths) {
      const pdf = await renderPageToPdf(path, browser)
      results.push({ path, pdf })
    }
  } finally {
    await browser.close()
  }

  return results
}
