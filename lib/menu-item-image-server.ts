import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { menuImageExtension } from "@/lib/menu-item-image"

export async function persistMenuItemImage(
  restaurantId: number,
  menuItemId: number,
  bytes: Buffer,
  contentType: string,
): Promise<string> {
  const ext = menuImageExtension(contentType)
  const filename = `${menuItemId}-${Date.now()}.${ext}`
  const relativePath = `/uploads/menu/${restaurantId}/${filename}`

  if (!process.env.VERCEL) {
    const dir = path.join(process.cwd(), "public", "uploads", "menu", String(restaurantId))
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), bytes)
    return relativePath
  }

  const base64 = bytes.toString("base64")
  return `data:${contentType};base64,${base64}`
}
