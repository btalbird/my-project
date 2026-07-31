const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_BYTES = 2 * 1024 * 1024

export function isAllowedMenuImageType(contentType: string): boolean {
  return ALLOWED_TYPES.has(contentType)
}

export function menuImageExtension(contentType: string): string {
  if (contentType === "image/png") return "png"
  if (contentType === "image/webp") return "webp"
  return "jpg"
}

export function validateMenuImageFile(file: File): string | null {
  if (!isAllowedMenuImageType(file.type)) {
    return "Photo must be a JPEG, PNG, or WebP image."
  }
  if (file.size > MAX_BYTES) {
    return "Photo must be 2 MB or smaller."
  }
  return null
}

export function menuItemVisual(
  imageUrl: string | null | undefined,
  image: string | null | undefined,
): { kind: "photo"; src: string } | { kind: "emoji"; emoji: string } | { kind: "none" } {
  const url = imageUrl?.trim()
  if (url) return { kind: "photo", src: url }
  const emoji = image?.trim()
  if (emoji) return { kind: "emoji", emoji }
  return { kind: "none" }
}
