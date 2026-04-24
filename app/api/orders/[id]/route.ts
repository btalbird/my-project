import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionUserId } from "@/lib/session"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const sessionUserId = await getSessionUserId()
  if (!sessionUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await ctx.params
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: { id: numericId, userId: sessionUserId },
  })

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(order)
}
