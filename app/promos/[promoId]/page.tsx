import Link from "next/link"
import { CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react"

import { MEHKO_AUTHORIZED_CALIFORNIA_JURISDICTIONS, MEHKO_LA_COUNTY_PROGRAM_CAVEAT } from "@/lib/mehko-california-counties"
import { Promo3RecipesBrowse } from "@/components/promo3-personal-recipes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function MehkoInfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">MEHKO Certified</span>
          </nav>

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                What is MEHKO certification?
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Home kitchen permit
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              MEHKO stands for <span className="font-medium text-foreground">Microenterprise Home Kitchen Operation</span>
              . It’s a California program that can allow a home cook to prepare and sell meals from their primary
              residence. They must obtain a permit issued by the local city or county.
            </p>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Availability and exact rules vary by jurisdiction. CDPH notes that cities and counties have discretion to
              authorize MEHKOs, and you should verify with your local environmental health agency before applying.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link
                  href="https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/MicroenterpriseHomeKitchenOperations.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CDPH overview
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link
                  href="https://mehko.org/list-california-counties-mehko-accepting-applications/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Participating counties list
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <Card className="gap-4 border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                  Safety practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>These are the safety basics that make a home kitchen restaurant-ready.</p>
                <ul className="space-y-2">
                  {[
                    "Time & temperature control: keep cold foods cold and hot foods hot; cool and reheat safely.",
                    "Prevent cross-contamination: separate raw and ready-to-eat foods; sanitize between tasks.",
                    "Allergen control: label common allergens clearly; avoid cross-contact; keep ingredient lists handy.",
                    "Handwashing + illness policy: don’t cook when sick; maintain strict handwashing habits.",
                    "Cleaning & sanitizing schedule: food-contact surfaces, utensils, towels/sponges, and storage.",
                    "Safe sourcing + storage: maintain FIFO rotation; store chemicals away from food.",
                    "Traceability: keep simple logs of ingredients and batches so issues can be traced quickly.",
                    "Food safety training: Food Safety Manager certification and food handler cards.",
                    "Home kitchen evaluation/inspection.",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 gap-4 border-2 border-border">
            <CardHeader>
              <CardTitle>Where MEHKOs are currently authorized (California)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Based on the MEHKO community list (as of Aug 2025), these jurisdictions have authorized MEHKO programs.
                Always confirm with your local environmental health agency for the most current status.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MEHKO_AUTHORIZED_CALIFORNIA_JURISDICTIONS.map((name) => (
                  <div key={name} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                    {name}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{MEHKO_LA_COUNTY_PROGRAM_CAVEAT}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default async function PromoPage({ params }: { params: Promise<{ promoId: string }> }) {
  const { promoId } = await params

  if (promoId === "2") return <MehkoInfoPage />
  if (promoId === "3")
    return (
      <div className="min-h-screen bg-background">
        <Promo3RecipesBrowse />
      </div>
    )

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-foreground">Promo #{promoId}</h1>
      <p className="text-muted-foreground mt-2">More info about this promo (placeholder).</p>
    </main>
  )
}

