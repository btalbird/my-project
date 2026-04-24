import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, type: true },
  })

  const grouped = {
    cuisine: tags.filter((t) => t.type === "cuisine"),
    trait: tags.filter((t) => t.type === "trait"),
  }

  return NextResponse.json(grouped)
}

