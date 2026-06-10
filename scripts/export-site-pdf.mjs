#!/usr/bin/env node
/**
 * Batch-export all public site pages to PDF with a CONFIDENTIAL header.
 *
 * Prerequisites:
 *   1. Dev server running: `pnpm dev` (default port 3002)
 *   2. Chrome available locally, or set PUPPETEER_EXECUTABLE_PATH
 *
 * Usage:
 *   node scripts/export-site-pdf.mjs
 *   PDF_BASE_URL=http://localhost:3002 node scripts/export-site-pdf.mjs
 *   PDF_EXPORT_DIR=./exports node scripts/export-site-pdf.mjs
 *
 * Output:
 *   exports/site-pdf/munch-site-full.pdf  — one shareable document (all pages merged)
 *   exports/site-pdf/*.pdf                — individual page PDFs
 *   exports/site-pdf/munch-site-pdf.zip   — ZIP of individual PDFs
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import JSZip from "jszip"
import { PDFDocument } from "pdf-lib"
import puppeteer from "puppeteer-core"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const CONFIDENTIAL_HEADER = `
  <div style="width:100%;text-align:center;font-size:14px;font-weight:700;color:#dc2626;font-family:sans-serif;letter-spacing:0.08em;">
    CONFIDENTIAL
  </div>`

const PDF_MARGINS = {
  top: "72px",
  bottom: "48px",
  left: "24px",
  right: "24px",
}

const STATIC_EXPORT_PATHS = [
  "/",
  "/restaurants",
  "/cart",
  "/delivery",
  "/download",
  "/help",
  "/signin",
  "/signup",
  "/for-cooks/become-a-cook",
  "/for-cooks/bring-itk-to-your-neighborhood",
  "/for-cooks/cook-dashboard",
  "/for-cooks/earnings",
  "/for-cooks/mehko-counties",
  "/for-cooks/recipe-guidelines",
  "/community/blog",
  "/community/community-events",
  "/community/food-donation",
  "/community/local-cooks",
  "/community/our-story",
  "/community/partners",
  "/support/accessibility",
  "/support/contact-us",
  "/support/food-safety",
  "/support/help-center",
  "/support/social",
  "/legal/cookies",
  "/legal/privacy",
  "/legal/terms",
  "/nutrition/allergen-info",
  "/nutrition/dietary-preferences",
  "/nutrition/guide",
  "/nutrition/meal-planning",
  "/promos/2",
  "/promos/3",
  "/promos/3/add-recipe",
]

function getBaseUrl() {
  const configured = process.env.PDF_BASE_URL?.trim()
  if (configured) return configured.replace(/\/$/, "")
  return "http://localhost:3002"
}

function pathToFilename(routePath) {
  if (routePath === "/") return "home.pdf"
  return `${routePath.slice(1).replace(/\//g, "-")}.pdf`
}

function buildPageUrl(routePath) {
  const base = getBaseUrl()
  const separator = routePath.includes("?") ? "&" : "?"
  return `${base}${routePath}${separator}print=1`
}

function resolveChromePath() {
  return (
    process.env.PUPPETEER_EXECUTABLE_PATH ??
    process.env.CHROME_PATH ??
    (process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : undefined)
  )
}

async function mergePdfBuffers(buffers) {
  const merged = await PDFDocument.create()
  for (const buffer of buffers) {
    const doc = await PDFDocument.load(buffer)
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    for (const page of pages) {
      merged.addPage(page)
    }
  }
  return Buffer.from(await merged.save())
}

async function fetchDynamicPaths() {
  const base = getBaseUrl()
  const [restaurantsRes, categoriesRes] = await Promise.all([
    fetch(`${base}/api/restaurants`),
    fetch(`${base}/api/categories`),
  ])

  const paths = []

  if (restaurantsRes.ok) {
    const restaurants = await restaurantsRes.json()
    if (Array.isArray(restaurants)) {
      for (const r of restaurants) {
        if (r?.id != null) paths.push(`/restaurants/${r.id}`)
      }
    }
  }

  if (categoriesRes.ok) {
    const categories = await categoriesRes.json()
    if (Array.isArray(categories)) {
      for (const c of categories) {
        if (c?.slug) paths.push(`/categories/${c.slug}`)
      }
    }
  }

  return paths
}

async function renderPageToPdf(page, routePath) {
  await page.goto(buildPageUrl(routePath), {
    waitUntil: "networkidle0",
    timeout: 60_000,
  })

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: CONFIDENTIAL_HEADER,
    footerTemplate: "<span></span>",
    margin: PDF_MARGINS,
  })

  return Buffer.from(pdf)
}

async function main() {
  const outDir = path.resolve(ROOT, process.env.PDF_EXPORT_DIR ?? "exports/site-pdf")
  await mkdir(outDir, { recursive: true })

  const dynamicPaths = await fetchDynamicPaths()
  const allPaths = [...STATIC_EXPORT_PATHS, ...dynamicPaths]

  console.log(`Exporting ${allPaths.length} pages from ${getBaseUrl()} → ${outDir}`)

  const executablePath = resolveChromePath()
  if (!executablePath) {
    throw new Error(
      "Chrome not found. Install Google Chrome or set PUPPETEER_EXECUTABLE_PATH.",
    )
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  const page = await browser.newPage()
  const zip = new JSZip()
  const pdfBuffers = []

  try {
    for (const routePath of allPaths) {
      const filename = pathToFilename(routePath)
      process.stdout.write(`  ${routePath} … `)
      const pdf = await renderPageToPdf(page, routePath)
      pdfBuffers.push(pdf)
      await writeFile(path.join(outDir, filename), pdf)
      zip.file(filename, pdf)
      console.log("done")
    }
  } finally {
    await browser.close()
  }

  const fullPdfPath = path.join(outDir, "munch-site-full.pdf")
  process.stdout.write("Merging into one PDF … ")
  const fullPdf = await mergePdfBuffers(pdfBuffers)
  await writeFile(fullPdfPath, fullPdf)
  console.log("done")

  const archivePath = path.join(outDir, "munch-site-pdf.zip")
  const archive = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
  await writeFile(archivePath, archive)

  console.log(`\nWrote ${allPaths.length} PDFs, ${fullPdfPath}, and ${archivePath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
