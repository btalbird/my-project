const MAX_WIDTH = 1200
const JPEG_QUALITY = 0.85

/** Resize large photos in the browser before upload to keep files small. */
export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_WIDTH / bitmap.width)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg"
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, JPEG_QUALITY)
  })
  if (!blob) return file

  const ext = outputType === "image/png" ? "png" : "jpg"
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + `.${ext}`, { type: outputType })
}
