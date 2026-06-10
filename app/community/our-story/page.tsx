import type { Metadata } from "next"
import Link from "next/link"
import {
  ChefHat,
  CircleDollarSign,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UtensilsCrossed,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  aboutMunchIntro,
  getInvolvedLinks,
  missionStatement,
  values,
  type AboutMunchInvolveIcon,
  type AboutMunchValueIcon,
} from "@/lib/content/about-munch"

export const metadata: Metadata = {
  title: "About Munch | Munch",
  description:
    "Our mission, values, and ways to get involved—whether you want to order from local home kitchens or cook for your neighborhood.",
}

const valueIcons: Record<AboutMunchValueIcon, LucideIcon> = {
  transparency: ShieldCheck,
  wealth: CircleDollarSign,
  community: Users,
  voice: MessageCircle,
}

const involveIcons: Record<AboutMunchInvolveIcon, LucideIcon> = {
  utensils: UtensilsCrossed,
  chef: ChefHat,
  map: MapPin,
}

export default function AboutMunchPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">About Munch</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                About Munch
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Community
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">{aboutMunchIntro}</p>
          </div>

          <div className="mt-10 grid gap-8">
            <section aria-labelledby="mission-heading">
              <h2 id="mission-heading" className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Our mission
              </h2>
              <Card className="mt-4 border-2 border-border">
                <CardHeader>
                  <CardDescription>Mission statement</CardDescription>
                  <CardTitle className="font-serif text-xl">Why we exist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  {missionStatement.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="values-heading">
              <h2 id="values-heading" className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Our values
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                What guides how we build Munch and how we show up for cooks and neighbors.
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {values.map((value) => {
                  const Icon = valueIcons[value.icon]
                  return (
                    <Card key={value.title} className="border-2 border-border">
                      <CardHeader className="gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" aria-hidden />
                          </div>
                          <CardTitle className="font-serif text-lg">{value.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>{value.description}</p>
                        {value.linkHref && value.linkLabel ? (
                          <Button asChild variant="outline" size="sm" className="rounded-full">
                            <Link href={value.linkHref}>{value.linkLabel}</Link>
                          </Button>
                        ) : null}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>

            <section aria-labelledby="involved-heading">
              <h2 id="involved-heading" className="font-serif text-2xl font-bold tracking-tight text-foreground">
                How to get involved
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Whether you want a great weeknight meal or to cook for your community, start here.
              </p>
              <div className="mt-4 grid gap-6">
                {getInvolvedLinks.map((item) => {
                  const Icon = involveIcons[item.icon]
                  return (
                    <Card key={item.href} className="border-2 border-border">
                      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-accent/15">
                            <Icon className="h-5 w-5 text-accent-foreground" aria-hidden />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="font-serif text-xl">{item.title}</CardTitle>
                            <CardDescription className="text-base text-muted-foreground">
                              {item.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Button asChild className="mt-2 shrink-0 rounded-full sm:mt-0">
                          <Link href={item.href}>{item.ctaLabel}</Link>
                        </Button>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
