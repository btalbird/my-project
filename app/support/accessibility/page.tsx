import Link from "next/link"
import { CheckCircle2, HandHeart, MapPin, MessageSquareText, ShieldCheck } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/support/help-center" className="hover:text-foreground transition-colors">
              Help Center
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">Accessibility</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Accessibility
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Support
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              We want ordering, pickup, and delivery to be usable for everyone—including people with physical,
              developmental, or mental accessibility needs. If you need an accommodation, tell us what works best for you.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild className="rounded-full">
                <Link href="/support/contact-us">Request an accommodation</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/support/help-center">Browse Help Center</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <Alert className="border-2 border-border">
              <AlertTitle>Fastest way to help</AlertTitle>
              <AlertDescription>
                If your request is about a specific order, include your order number and your preferred contact method
                (text/email/call). We’ll coordinate with the kitchen or courier when possible.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-2 border-border">
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <HandHeart className="h-5 w-5 text-primary" aria-hidden />
                    <CardTitle className="text-base">Flexible handoff</CardTitle>
                  </div>
                  <CardDescription>Options for mobility, sensory, or anxiety needs.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="space-y-2">
                    {[
                      "Contactless delivery or quiet handoff.",
                      "Curbside pickup where available.",
                      "Extra time at the door/pickup point.",
                      "Clear, step-by-step delivery notes.",
                    ].map((t) => (
                      <li key={t} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-border">
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-accent" aria-hidden />
                    <CardTitle className="text-base">Communication preferences</CardTitle>
                  </div>
                  <CardDescription>We’ll use what’s easiest for you.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="space-y-2">
                    {[
                      "Text-only updates.",
                      "Email-only support.",
                      "Phone calls only if requested.",
                      "Simple language and concise confirmations.",
                    ].map((t) => (
                      <li key={t} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-border">
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-foreground" aria-hidden />
                    <CardTitle className="text-base">Safety & clarity</CardTitle>
                  </div>
                  <CardDescription>Especially important for allergies and cognitive load.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="space-y-2">
                    {[
                      "Allergen notes and ingredient questions before ordering.",
                      "Confirming the exact drop-off location (gate, lobby, porch).",
                      "Minimizing substitutions when possible.",
                      "Label checks at pickup.",
                    ].map((t) => (
                      <li key={t} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle>MEHKO-aware delivery and pickup notes</CardTitle>
                <CardDescription>
                  Many kitchens on the platform may operate under California MEHKO rules. Requirements can also vary by
                  county/city permit—so we treat these as constraints when arranging accommodations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Under California’s MEHKO chapter (Retail Food Code excerpt), kitchens submit standard operating
                  procedures that include{" "}
                  <span className="font-medium text-foreground">
                    how food is maintained at required holding temperatures pending pickup or during delivery
                  </span>
                  . This can affect how long a handoff can be delayed or how a drop-off is staged.
                </p>
                <p>
                  The statute also includes rules about{" "}
                  <span className="font-medium text-foreground">who may deliver food on behalf of a MEHKO</span>{" "}
                  (for example, delivery may need to be performed by the operation or household/employee under the permit).
                  If an accommodation requires a special handoff method, we may need to coordinate with the permitted
                  operator to stay compliant.
                </p>
                <p className="text-xs text-muted-foreground">
                  This page is not legal advice. For the most current MEHKO requirements in your area, check your local
                  environmental health agency and the California Department of Public Health guidance.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link
                      href="https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/MicroenterpriseHomeKitchenOperations.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      CDPH MEHKO overview
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/support/contact-us">Ask support</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <section aria-label="Accessibility FAQ">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">Accessibility FAQ</h2>
                <p className="text-sm text-muted-foreground">What we can usually do, and what we need from you.</p>
              </div>

              <div className="mt-4 rounded-xl border-2 border-border bg-card px-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value="notes">
                    <AccordionTrigger>What should I put in delivery notes for accessibility?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Keep it short and specific. Example: “Text only. Please leave at door. Knock once and step back.
                      If gate is locked, call.” If you need extra time, add: “Please wait up to 3 minutes.”
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="pickup">
                    <AccordionTrigger id="pickup">Can you offer curbside pickup?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Where the kitchen location and permit allow it, we can coordinate a curbside or low-contact handoff.
                      Contact support before ordering (or right after) so we can arrange it.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="timing">
                    <AccordionTrigger id="timing">Can a courier wait longer at drop-off?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Often yes, within reason. Food safety requirements and other deliveries can limit how long someone can
                      wait. Tell us what you need and we’ll confirm what’s possible for that order.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="communication">
                    <AccordionTrigger>Can I request text-only communication?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Yes. Include “text only” in your notes and in your message to support. We’ll follow your preference
                      whenever possible.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border-2 border-border bg-card px-6 py-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Prefer a specific pickup/drop-off spot?</p>
                    <p className="text-sm text-muted-foreground">
                      Tell us the exact location (lobby desk, side gate, porch chair) and your preferred handoff style.
                    </p>
                  </div>
                </div>
                <Button asChild className="rounded-full">
                  <Link href="/support/contact-us">Contact support</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

