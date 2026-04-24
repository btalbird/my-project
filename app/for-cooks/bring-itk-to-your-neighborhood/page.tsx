import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, Sprout } from "lucide-react"

import { Footer } from "@/components/footer"
import { BRING_ITK_EXPANSION_WATCHLIST } from "@/lib/bring-itk-expansion-watch"
import { MEHKO_ORG_CA_COUNTIES_URL } from "@/lib/mehko-california-counties"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Bring ITK to your neighborhood | In The Kitchen",
  description:
    "How MEHKO-style home kitchen programs are expanding, and where to watch local legislation—with official links so you can learn more and get involved.",
}

const levelLabel: Record<(typeof BRING_ITK_EXPANSION_WATCHLIST)[number]["level"], string> = {
  state: "State",
  county: "County",
  city: "City",
}

export default function BringItkToYourNeighborhoodPage() {
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
            <span className="font-medium text-foreground">Bring ITK to your neighborhood</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Bring In The Kitchen to your neighborhood
              </h1>
              <Badge variant="secondary" className="rounded-full">
                MEHKO is spreading
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              MEHKO-style home kitchen laws started in California, but the idea—neighbors cooking for neighbors, with
              real permits and inspections—is gaining attention nationwide. New counties, cities, and states open
              programs every year while others are still deciding. We built this page so you can see{" "}
              <span className="font-medium text-foreground">where conversations are happening</span> and jump straight to{" "}
              <span className="font-medium text-foreground">official sources</span> when you want to learn more or help
              good policy move forward where you live.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link href={MEHKO_ORG_CA_COUNTIES_URL} target="_blank" rel="noopener noreferrer">
                  MEHKO.org — California county status
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/for-cooks/mehko-counties">California county list (on ITK)</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/promos/2">What is MEHKO?</Link>
              </Button>
            </div>
          </div>

          <Card className="mt-10 border-2 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <Sprout className="h-5 w-5 text-primary" aria-hidden />
                Why it feels like things are moving fast
              </CardTitle>
              <CardDescription>Permits, pilots, and press all hit different timelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                A county can vote in a pilot today, open applications next quarter, or pause while environmental health
                builds forms. A state may introduce a bill one session and carry it over the next. That rhythm can feel
                chaotic—but it also means there are more openings than ever for neighbors who want safe, legal home
                kitchens and for platforms like In The Kitchen that are willing to invest alongside you.
              </p>
              <p>
                Nothing here is legal advice. Always read the ordinance or bill text, then talk with your local
                environmental health department before you cook for the public.
              </p>
            </CardContent>
          </Card>

          <Separator className="my-10" />

          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground">Where to watch &amp; how to help</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              The table below is intentionally small and <span className="font-medium text-foreground">easy to edit</span>
              : our team updates the list in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">lib/bring-itk-expansion-watch.ts</code>
              . Each row links to an <span className="font-medium text-foreground">official government or legislature</span>{" "}
              site so you can read primary sources, find hearings, and see what comment periods look like in your area.
            </p>

            <ul className="mt-6 space-y-4">
              {BRING_ITK_EXPANSION_WATCHLIST.map((row) => (
                <li key={row.id}>
                  <Card className="border-2 border-border">
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full capitalize">
                          {levelLabel[row.level]}
                        </Badge>
                        <CardTitle className="font-serif text-lg">{row.jurisdiction}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <p className="text-muted-foreground">{row.status}</p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">How you can help:</span> {row.howToHelp}
                      </p>
                      <Button asChild variant="secondary" className="rounded-full">
                        <Link href={row.officialUrl} target="_blank" rel="noopener noreferrer">
                          {row.officialLinkLabel}
                          <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground">
              Missing your region? Email us through{" "}
              <Link href="/support/contact-us?topic=partnerships" className="font-medium text-primary underline-offset-4 hover:underline">
                Contact us (Partnerships)
              </Link>{" "}
              with a link to an official agenda, staff report, or bill text and we&apos;ll review it for the next update.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
