import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
])

export function isAllowedMehkoPermitDocumentType(contentType: string): boolean {
  return ALLOWED_TYPES.has(contentType)
}

function documentExtension(contentType: string): string {
  if (contentType === "image/png") return "png"
  if (contentType === "image/webp") return "webp"
  if (contentType === "application/pdf") return "pdf"
  return "jpg"
}

export async function persistMehkoPermitDocument(
  restaurantId: number,
  bytes: Buffer,
  contentType: string,
): Promise<string> {
  const ext = documentExtension(contentType)
  const filename = `permit-${Date.now()}.${ext}`
  const relativePath = `/uploads/mehko-permits/${restaurantId}/${filename}`

  if (!process.env.VERCEL) {
    const dir = path.join(process.cwd(), "public", "uploads", "mehko-permits", String(restaurantId))
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), bytes)
    return relativePath
  }

  const base64 = bytes.toString("base64")
  return `data:${contentType};base64,${base64}`
}
