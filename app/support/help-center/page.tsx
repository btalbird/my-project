import Link from "next/link"
import { Clock, CreditCard, HelpCircle, MapPin, Package, Phone, Search, ShieldCheck } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const TOPICS = [
  {
    title: "Orders & delivery",
    description: "Track orders, update delivery notes, and understand statuses.",
    icon: Package,
    href: "/support/contact-us",
  },
  {
    title: "Pickup & handoff",
    description: "Where to meet, how pickup works, and what to do if plans change.",
    icon: MapPin,
    href: "/support/help-center#pickup",
  },
  {
    title: "Timing & scheduling",
    description: "Delivery windows, prep times, and delays.",
    icon: Clock,
    href: "/support/help-center#timing",
  },
  {
    title: "Payments & refunds",
    description: "Charges, receipts, cancellations, and refunds.",
    icon: CreditCard,
    href: "/support/help-center#refunds",
  },
  {
    title: "Food safety",
    description: "Allergens, storage, and safe handling.",
    icon: ShieldCheck,
    href: "/support/food-safety",
  },
  {
    title: "Account help",
    description: "Sign in, orders, and profile troubleshooting.",
    icon: HelpCircle,
    href: "/help",
  },
] as const

const FAQS = [
  {
    id: "track",
    q: "How do I track my order?",
    a: "Open your Orders page to see the latest status. If your order is delayed, you’ll see an updated estimate. If something looks off, contact support and include your order number.",
  },
  {
    id: "edit-notes",
    q: "Can I change delivery instructions after ordering?",
    a: "If the kitchen hasn’t started preparing your order yet, you can often update notes (gate codes, drop-off preference, phone number). If prep has already started, contact support and we’ll do our best to help.",
  },
  {
    id: "missing-item",
    q: "My order is missing an item. What should I do?",
    a: "Check the order details to confirm what was included. Then contact support with a quick note about what’s missing. We’ll make it right—typically via a refund or credit, depending on the situation.",
  },
  {
    id: "late",
    q: "My delivery is late—what counts as “late”?",
    a: "If you’re past your quoted delivery window, it’s considered late. Sometimes traffic or kitchen prep can shift timing. If you’re outside the window, contact support and we’ll investigate.",
  },
  {
    id: "cancel",
    q: "Can I cancel an order?",
    a: "You can cancel before preparation starts. Once a kitchen begins cooking, cancellations may not be possible. If you need help, contact support as soon as you can and we’ll check what’s possible for your order.",
  },
  {
    id: "refund",
    q: "How do refunds work?",
    a: "Refunds go back to the original payment method. Processing time depends on your bank (often 3–10 business days). If you don’t see it after that window, contact support with your order number.",
  },
  {
    id: "allergens",
    q: "How do you handle allergens?",
    a: "We encourage clear ingredient listings and allergen notes, but cross-contact can happen in any kitchen. If you have severe allergies, review ingredient notes and contact the kitchen or support before ordering.",
  },
] as const

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">Help Center</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Help Center
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Support
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              Find quick answers about delivery, pickup, payments, and common issues. If you need help with an order,
              we’re here.
            </p>

            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  placeholder="Search help articles (e.g. refunds, late delivery, pickup)"
                  className="pl-9"
                  aria-label="Search help center"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full">
                  <Link href="/support/contact-us">
                    <Phone className="mr-2 h-4 w-4" aria-hidden />
                    Contact support
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/orders">
                    <Package className="mr-2 h-4 w-4" aria-hidden />
                    View orders
                  </Link>
                </Button>
              </div>
            </div>

            <Alert className="border-2 border-border">
              <AlertTitle>Need help with a specific order?</AlertTitle>
              <AlertDescription>
                Include your order number and what happened (late delivery, missing item, wrong address, etc.). The more
                detail you share, the faster we can resolve it.
              </AlertDescription>
            </Alert>
          </div>

          <div className="mt-10 grid gap-6">
            <section aria-label="Popular topics">
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">Popular topics</h2>
                  <p className="text-sm text-muted-foreground">Start here for common questions.</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TOPICS.map((t) => (
                  <Card key={t.title} className="border-2 border-border">
                    <CardHeader className="gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-2xl bg-secondary/40 border border-border flex items-center justify-center">
                          <t.icon className="h-5 w-5 text-foreground" aria-hidden />
                        </div>
                        <CardTitle className="text-base">{t.title}</CardTitle>
                      </div>
                      <CardDescription>{t.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href={t.href}>Learn more</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            <section aria-label="Frequently asked questions">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">Frequently asked questions</h2>
                <p className="text-sm text-muted-foreground">
                  Quick answers for delivery, pickup, and payment questions.
                </p>
              </div>

              <div className="mt-4 rounded-xl border-2 border-border bg-card px-6">
                <Accordion type="single" collapsible>
                  {FAQS.map((f) => (
                    <AccordionItem key={f.id} value={f.id}>
                      <AccordionTrigger>{f.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>

            <Separator />

            <section aria-label="Contact options" className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>Contact support</CardTitle>
                  <CardDescription>Reach us for order issues, account help, or refunds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    For the fastest help, include your order number and a short description of what happened.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild className="rounded-full">
                      <Link href="/support/contact-us">Contact us</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/support/accessibility">Accessibility</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>Pickup tips</CardTitle>
                  <CardDescription>Helpful guidelines for smooth handoffs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>
                      <span className="font-medium text-foreground">Be on time:</span> arrive during your pickup window.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Bring a bag:</span> especially for multiple items or drinks.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Check labels:</span> confirm items before you leave.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Food safety:</span> refrigerate promptly if you won’t eat right away.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

