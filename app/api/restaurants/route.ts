import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const tagsParam = url.searchParams.get("tags") ?? ""
  const category = url.searchParams.get("category")?.trim() || null
  const q = url.searchParams.get("q")?.trim() || null
  const tagSlugs = tagsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const andClauses =
    tagSlugs.length > 0
      ? tagSlugs.map((slug) => ({
          tags: {
            some: {
              tag: { slug },
            },
          },
        }))
      : []

  const restaurants = await prisma.restaurant.findMany({
    where:
      andClauses.length || category || q
        ? {
            ...(category ? { category: { slug: category } } : {}),
            ...(q
              ? {
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { cuisine: { contains: q, mode: "insensitive" } },
                  ],
                }
              : {}),
            ...(andClauses.length ? { AND: andClauses } : {}),
          }
        : undefined,
    orderBy: { id: "asc" },
  })

  return NextResponse.json(restaurants)
}

