import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { getSessionUserId } from "@/lib/session"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ userId: null, email: null, name: null })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ userId: null, email: null, name: null })
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
  } catch {
    return NextResponse.json({ userId: null, email: null, name: null })
  }
}
