import { LocalCooksPageClient } from "@/components/local-cooks-page-client"
import { NEIGHBORHOOD_CHEFS } from "@/lib/neighborhood-chefs"

export default function LocalCooksPage() {
  return (
    <div className="min-h-screen bg-background">
      <LocalCooksPageClient sampleChefs={NEIGHBORHOOD_CHEFS} />
    </div>
  )
}
