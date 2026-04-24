import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { Resvg } from "@resvg/resvg-js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, "..")
const inputPath = path.join(repoRoot, "public", "neighbor-handoff.svg")
const outputPath = path.join(repoRoot, "public", "neighbor-handoff.png")

const svg = await readFile(inputPath, "utf8")

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  background: "rgba(0,0,0,0)",
})

const pngData = resvg.render().asPng()
await writeFile(outputPath, pngData)

console.log(`Wrote ${path.relative(repoRoot, outputPath)}`)

