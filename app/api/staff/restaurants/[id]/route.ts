import { NextResponse } from "next/server"
import { z } from "zod"

import { canAccessStaffPortal, getSessionUser } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

const patchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    image: z.string().min(1).max(2000).optional(),
    cuisine: z.string().min(1).max(200).optional(),
    rating: z.number().min(0).max(5).optional(),
    deliveryTime: z.string().min(1).max(100).optional(),
    deliveryFee: z.string().min(1).max(100).optional(),
    promo: z.union([z.string().max(500), z.null()]).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "No fields to update" })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user || !canAccessStaffPortal(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const restaurantId = Number(id)
  if (!Number.isFinite(restaurantId)) {
    return NextResponse.json({ error: "Invalid restaurant id" }, { status: 400 })
  }

  let body: z.infer<typeof patchSchema>
  try {
    const json = await req.json()
    body = patchSchema.parse(json)
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const existing = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: body,
    })
    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Name already in use" }, { status: 409 })
    }
    throw err
  }
}
