import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, MapPin } from "lucide-react"

import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  MEHKO_AUTHORIZED_CALIFORNIA_JURISDICTIONS,
  MEHKO_LA_COUNTY_PROGRAM_CAVEAT,
  MEHKO_ORG_CA_COUNTIES_URL,
  MEHKO_RELATED_LEGISLATION_WATCHLIST,
} from "@/lib/mehko-california-counties"

const CDPH_MEHKO =
  "https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/MicroenterpriseHomeKitchenOperations.aspx"

export const metadata: Metadata = {
  title: "California MEHKO counties & legislation watchlist | Munch",
  description:
    "California jurisdictions where MEHKO-style home kitchen programs have been reported, plus examples of MEHKO-related legislation in other states—always verify with official sources.",
}

export default function MehkoCountiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/for-cooks/become-a-cook" className="hover:text-foreground transition-colors">
              For cooks
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">MEHKO counties</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                California counties &amp; MEHKO adoption
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Home kitchens
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              Below is the same roll call we maintain alongside the MEHKO community list for California. Cities and
              counties turn programs on, pause them, or change rules—always confirm with the environmental health agency
              that actually issues your permit.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link href={CDPH_MEHKO} target="_blank" rel="noopener noreferrer">
                  CDPH MEHKO overview
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={MEHKO_ORG_CA_COUNTIES_URL} target="_blank" rel="noopener noreferrer">
                  MEHKO.org county list
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/promos/2">What is MEHKO?</Link>
              </Button>
            </div>
          </div>

          <Card className="mt-10 border-2 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <MapPin className="h-5 w-5 text-primary" aria-hidden />
                Jurisdictions reported as authorizing MEHKO programs
              </CardTitle>
              <CardDescription>
                Based on the community-maintained list (same snapshot as our MEHKO overview as of Aug 2025). This is not
                a permit guarantee for your address—call your local office.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MEHKO_AUTHORIZED_CALIFORNIA_JURISDICTIONS.map((name) => (
                  <div
                    key={name}
                    className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm font-medium text-foreground"
                  >
                    {name}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{MEHKO_LA_COUNTY_PROGRAM_CAVEAT}</p>
            </CardContent>
          </Card>

          <Card className="mt-6 border-2 border-border bg-card/60">
            <CardHeader>
              <CardTitle className="font-serif text-xl">California: ordinances still in motion</CardTitle>
              <CardDescription>County supervisors, city councils, and local environmental health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Even inside California, new counties or cities can vote in MEHKO ordinances—or pause intake—after this
                page is published. Watch your board of supervisors agendas, city council packets, and the{" "}
                <Link href={MEHKO_ORG_CA_COUNTIES_URL} className="font-medium text-primary underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">
                  MEHKO.org participating-counties list
                </Link>{" "}
                for the freshest picture before you invest in equipment or menus.
              </p>
            </CardContent>
          </Card>

          <Separator className="my-10" />

          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground">Other states — MEHKO-style bills to watch</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Outside California, laws use different names and scopes (sometimes “microenterprise home kitchens,”
              sometimes broader cottage-food updates). The rows below link to{" "}
              <span className="font-medium text-foreground">official sources</span> we know of—not endorsements and not
              legal advice. Status can change with every legislative session.
            </p>

            <div className="mt-6 grid gap-4">
              {MEHKO_RELATED_LEGISLATION_WATCHLIST.map((item) => (
                <Card key={item.url} className="border-2 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item.jurisdiction}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href={item.url} target="_blank" rel="noopener noreferrer">
                        View official bill / source
                        <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Don’t see your state? Search your legislature’s site for “microenterprise home kitchen,” “MEHKO,” or
              “cottage food” and read the enrolled or introduced text directly.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
