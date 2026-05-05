import type { Metadata } from "next"
import Link from "next/link"
import { HandCoins, Leaf, UsersRound } from "lucide-react"

import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Community-led spaces | Munch",
  description:
    "How Munch partners with neighborhood leaders, reinvests 5% of local profits into community projects, and how to reach out to partner.",
}

const PARTNER_EXAMPLES = [
  "Third spaces where neighbors can gather, learn, and belong",
  "Child care access and family-support programs",
  "Getting essentials to the houseless community",
  "Small courses and seminars hosted by trusted local leaders",
] as const

export default function CommunityLedSpacesPage() {
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
            <span className="font-medium text-foreground">Community-led spaces</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Community-led spaces
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Local leaders
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              Munch partners with <span className="font-medium text-foreground">local community leaders</span>{" "}
              in each neighborhood you help us serve. We want the money you spend to flow back into your community—in
              as many honest, practical ways as we can.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild className="rounded-full">
                <Link href="/support/contact-us?topic=partnerships">Partner with us</Link>
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
                  <UsersRound className="h-5 w-5 text-primary" aria-hidden />
                  Neighbors leading the work
                </CardTitle>
                <CardDescription>Who we look for in each area</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Every neighborhood has people who already show up: organizers, mutual-aid crews, faith communities,
                  educators, and small nonprofits. We aim to work <span className="font-medium text-foreground">with</span>{" "}
                  those leaders—not over them—so projects reflect what your community actually needs.
                </p>
                <Button asChild variant="secondary" className="rounded-full">
                  <Link href="/community/partners">Meet our partners</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-xl">
                  <HandCoins className="h-5 w-5 text-primary" aria-hidden />
                  5% back to your neighborhood
                </CardTitle>
                <CardDescription>Profit sharing by area served</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Five percent of profits</span> from each neighborhood or
                  area we serve is donated to trusted community leaders and their projects. The goal is simple: when you
                  order through Munch, part of what you spend helps fund the fabric of the place you live—not
                  somewhere abstract.
                </p>
                <p className="text-sm">
                  Exact timing, accounting, and partner selection will follow a clear program as we grow; we&apos;ll
                  publish more detail as partnerships go live in each region.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-xl">
                  <Leaf className="h-5 w-5 text-primary" aria-hidden />
                  What community projects can look like
                </CardTitle>
                <CardDescription>Examples, not an exhaustive list</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-4">
                  We partner with community members and leaders who are already building things like:
                </p>
                <ul className="space-y-2">
                  {PARTNER_EXAMPLES.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-border bg-card/60">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Know someone who should talk to us?</CardTitle>
                <CardDescription>We&apos;d love a warm introduction.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  If you know someone who may want to partner with us in your community—someone rooted locally, with a
                  track record of showing up—please use our contact form and tell us a bit about them (with their
                  permission, of course).
                </p>
                <Button asChild className="rounded-full">
                  <Link href="/support/contact-us?topic=partnerships">Open the contact form</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
