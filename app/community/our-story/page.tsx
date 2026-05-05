import Link from "next/link"
import { HeartHandshake, Leaf, ShieldCheck, UtensilsCrossed } from "lucide-react"

import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">Our story</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Our story
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Munch
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              We’re building a friendlier way to eat well: homemade food from people you trust, prepared with care, and
              delivered with community at the center.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild className="rounded-full">
                <Link href="/restaurants">Browse meals</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/community/local-cooks">Meet local cooks</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle>Why we started</CardTitle>
                <CardDescription>A simple idea: make great food feel personal again.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  Takeout is convenient, but it can be impersonal. Grocery shopping is healthier, but it takes time.
                  Somewhere in between is the thing most of us want: a meal that tastes like it was made for you.
                </p>
                <p>
                  Munch exists to help neighbors share what they already do best—cook—while giving everyone an
                  easier way to discover new dishes, support small cooks, and build real connections.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-2 border-border">
                <CardHeader className="gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <UtensilsCrossed className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <CardTitle>Made with care</CardTitle>
                  </div>
                  <CardDescription>Better food starts with better intent.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Thoughtful portions, clear ingredients, and recipes people are proud to share.</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border">
                <CardHeader className="gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-accent" aria-hidden />
                    </div>
                    <CardTitle>Trust & transparency</CardTitle>
                  </div>
                  <CardDescription>Know what you’re eating—and who made it.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Clear descriptions, helpful labels, and simple info that makes choosing easy.</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border">
                <CardHeader className="gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                      <HeartHandshake className="h-5 w-5 text-rose-600" aria-hidden />
                    </div>
                    <CardTitle>Community first</CardTitle>
                  </div>
                  <CardDescription>Support cooks, strengthen neighborhoods.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>When you order local, you keep talent and opportunity close to home.</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle>How it works</CardTitle>
                <CardDescription>Three steps to a better weeknight.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      k: "1",
                      title: "Discover",
                      body: "Browse meals from local cooks and kitchens near you.",
                      icon: Leaf,
                    },
                    {
                      k: "2",
                      title: "Order",
                      body: "Pick what sounds good, add notes, and choose a delivery window.",
                      icon: UtensilsCrossed,
                    },
                    {
                      k: "3",
                      title: "Enjoy",
                      body: "Eat well and come back for favorites—or try something new.",
                      icon: HeartHandshake,
                    },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-border bg-card px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-9 w-9 rounded-full border border-border bg-secondary/30 flex items-center justify-center">
                          <s.icon className="h-4 w-4 text-foreground" aria-hidden />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">{s.title}</p>
                          <p className="text-sm text-muted-foreground">{s.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Want to cook for your community? Start small and grow at your pace.
                  </p>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/for-cooks/become-a-cook">Become a cook</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

