import { PDFDocument } from "pdf-lib"

export async function mergePdfBuffers(buffers: Buffer[]): Promise<Buffer> {
  if (buffers.length === 0) {
    throw new Error("No PDFs to merge")
  }

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
