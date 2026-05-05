import type { Metadata } from "next"
import Link from "next/link"
import { HeartHandshake, Leaf, Recycle, UtensilsCrossed } from "lucide-react"

import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Food donation & community | Munch",
  description:
    "How MEHKO same-day rules reduce waste, and how Munch partners with food banks and nonprofits to support neighbors.",
}

export default function FoodDonationPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/community/our-story" className="hover:text-foreground transition-colors">
              Community
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">Food donation</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Food donation &amp; same-day meals
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Community
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              A few things we want you to know about how MEHKO kitchens operate on Munch—and how we try to
              stand with everyone in the neighborhood, including when times are tight.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild className="rounded-full">
                <Link href="/restaurants">Browse meals</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/community/our-story">Our story</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-xl">
                  <UtensilsCrossed className="h-5 w-5 text-primary" aria-hidden />
                  Same-day preparation &amp; sale
                </CardTitle>
                <CardDescription>MEHKO-certified kitchens on our platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  All food made by MEHKO-certified kitchens must be <span className="font-medium text-foreground">prepared and sold the same day</span>.{" "}
                  <span className="font-medium text-foreground">Leftovers may not be sold</span>—that rule is part of
                  how home-kitchen programs keep meals safe and traceable for neighbors who order from you.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-xl">
                  <Recycle className="h-5 w-5 text-primary" aria-hidden />
                  Cutting waste, feeding neighbors
                </CardTitle>
                <CardDescription>Partnerships with food banks &amp; nonprofits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  In an effort to eliminate food waste, Munch has partnered with{" "}
                  <span className="font-medium text-foreground">city food banks and nonprofit organizations</span> so
                  that food can be donated to the <span className="font-medium text-foreground">local houseless community</span>{" "}
                  and others who need a reliable meal—not as an afterthought, but as part of how we think about a full
                  plate of community care.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-xl">
                  <HeartHandshake className="h-5 w-5 text-primary" aria-hidden />
                  Serving the whole community
                </CardTitle>
                <CardDescription>Trust, familiarity, and showing up</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  Munch is dedicated to serving <span className="font-medium text-foreground">all members of the community</span>
                  —including folks going through a rough patch, or who are less fortunate than others. That dedication to
                  serving the community <span className="font-medium text-foreground">holistically</span> is how we believe
                  strong connections, trust, and familiarity grow in the places we serve.
                </p>
                <p className="flex items-start gap-2 text-sm">
                  <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>
                    Details about donation windows, eligible items, and partner organizations will vary by city; we’ll
                    share more as programs roll out in your area.
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
