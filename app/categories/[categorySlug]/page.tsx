import { CategoryPageClient } from "@/components/category-page-client"
import { prisma } from "@/lib/db"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>
}) {
  const { categorySlug } = await params
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { name: true },
  })
  const categoryName = category?.name ?? categorySlug.replace(/-/g, " ")

  return (
    <div className="min-h-screen bg-background">
      <CategoryPageClient categorySlug={categorySlug} categoryName={categoryName} />
    </div>
  )
}
