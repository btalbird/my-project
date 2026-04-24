export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>
}) {
  const { categorySlug } = await params
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-foreground">Category: {categorySlug}</h1>
      <p className="text-muted-foreground mt-2">
        This page will show restaurants filtered by category.
      </p>
    </main>
  )
}

