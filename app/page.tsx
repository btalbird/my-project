import { HeroBanner } from "@/components/hero-banner"
import { Categories } from "@/components/categories"
import { PromoSection } from "@/components/promo-section"
import { RestaurantGrid } from "@/components/restaurant-grid"
import { AppDownload } from "@/components/app-download"
import { Footer } from "@/components/footer"

export default function HomePage() {
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
