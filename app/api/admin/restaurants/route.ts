import { getSessionUser, isAdminRole } from "@/lib/auth-user"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const admin = await getSessionUser()
  if (!admin || !isAdminRole(admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      name: true,
      ownerId: true,
      isDemo: true,
      isPublished: true,
      latitude: true,
      longitude: true,
      addressCity: true,
      addressState: true,
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ restaurants })
}
