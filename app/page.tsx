import { HeroBanner } from "@/components/hero-banner"
import { Categories } from "@/components/categories"
import { PromoSection } from "@/components/promo-section"
import { RestaurantGrid } from "@/components/restaurant-grid"
import { AppDownload } from "@/components/app-download"
import { Footer } from "@/components/footer"
import { CmsSections, type CmsBlock } from "@/components/cms-sections"
import { prisma } from "@/lib/db"

export default async function HomePage() {
  const cmsHome = await prisma.page.findUnique({
    where: { slug: "home" },
    select: {
      title: true,
      status: true,
      publishedVersionId: true,
      publishedVersion: { select: { sections: true } },
    },
  })

  const useCms =
    cmsHome &&
    cmsHome.status === "PUBLISHED" &&
    cmsHome.publishedVersionId &&
    cmsHome.publishedVersion

  if (useCms) {
    const blocksRaw = cmsHome.publishedVersion!.sections
    const blocks: CmsBlock[] = Array.isArray(blocksRaw) ? (blocksRaw as CmsBlock[]) : []
    return (
      <div className="min-h-screen bg-background">
        <main>
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <header className="mb-8 space-y-2">
              <h1 className="font-serif text-4xl font-bold tracking-tight">{cmsHome.title}</h1>
            </header>
            <CmsSections blocks={blocks} className="space-y-8" />
          </div>
          <RestaurantGrid
            title="Community Kitchens Near You"
            subtitle="Homemade meals from your neighbors, made with local ingredients"
          />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroBanner />
        <Categories />
        <PromoSection />
        <RestaurantGrid
          title="Community Kitchens Near You"
          subtitle="Homemade meals from your neighbors, made with local ingredients"
        />
        <AppDownload />
      </main>
      <Footer />
    </div>
  )
}
