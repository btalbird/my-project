import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import {
  isAllowedMehkoPermitDocumentType,
  persistMehkoPermitDocument,
} from "@/lib/mehko-permit-document-server"

const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: Request) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const kitchen = await prisma.restaurant.findFirst({
    where: auth.user.role === "ADMIN" ? {} : { ownerId: auth.user.id },
    orderBy: { id: "asc" },
    select: { id: true },
  })

  if (!kitchen) {
    return NextResponse.json({ error: "Create your kitchen first." }, { status: 404 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 })
  }

  const file = formData.get("document")
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a permit document to upload." }, { status: 400 })
  }
  if (!isAllowedMehkoPermitDocumentType(file.type)) {
    return NextResponse.json(
      { error: "Document must be a JPEG, PNG, WebP image, or PDF." },
      { status: 400 },
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Document must be 5 MB or smaller." }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const documentUrl = await persistMehkoPermitDocument(kitchen.id, bytes, file.type)

  return NextResponse.json({ documentUrl })
}
