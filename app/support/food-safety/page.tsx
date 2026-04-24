import Link from "next/link"
import { CheckCircle2, ClipboardList, ExternalLink, ShieldCheck, Thermometer } from "lucide-react"

import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function FoodSafetyPage() {
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
            <span className="font-medium text-foreground">Food safety</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Food safety
              </h1>
              <Badge variant="secondary" className="rounded-full">
                MEHKO
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              All kitchens in our community operate under California’s Microenterprise Home Kitchen Operation (MEHKO)
              framework. Below is an overview of common MEHKO food-safety requirements and where to verify them with
              government sources.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild className="rounded-full">
                <Link href="/community/local-cooks">
                  View MEHKO-certified chefs
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/support/contact-us">Ask a food-safety question</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <Alert className="border-2 border-border">
              <AlertTitle>Important note</AlertTitle>
              <AlertDescription>
                This page is informational and not legal advice. MEHKO rules can be implemented differently by your local
                environmental health agency. If you need confirmation for your county/city, use the government links
                below.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-2 border-border">
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" aria-hidden />
                    <CardTitle className="text-base">Permits + SOPs</CardTitle>
                  </div>
                  <CardDescription>Permitted kitchens with documented practices.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="space-y-2">
                    {[
                      "A MEHKO must have a local health permit to operate.",
                      "Applicants submit standard operating procedures (SOPs) describing food handling and sanitation.",
                      "SOPs include how food will be held safely during pickup or delivery.",
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
                    <Thermometer className="h-5 w-5 text-accent" aria-hidden />
                    <CardTitle className="text-base">Temperature control</CardTitle>
                  </div>
                  <CardDescription>Safe hot/cold holding matters during handoff.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="space-y-2">
                    {[
                      "Kitchens plan how to keep foods at required holding temperatures during delivery or pending pickup.",
                      "Timing and staging may be constrained by food-safety requirements.",
                      "If you can’t receive an order immediately, contact support to coordinate options.",
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
                    <CardTitle className="text-base">Training + accountability</CardTitle>
                  </div>
                  <CardDescription>Food safety certifications and oversight.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="space-y-2">
                    {[
                      "MEHKO operators must pass an approved food safety certification exam.",
                      "Anyone helping with prep/service may need a food handler card (depending on role).",
                      "Local enforcement can inspect based on complaints and other valid reasons.",
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

            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle>Confirm the regulations (official sources)</CardTitle>
                <CardDescription>
                  Use these government resources to verify current MEHKO food-safety requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button asChild variant="outline" className="justify-start rounded-full">
                    <Link
                      href="https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/MicroenterpriseHomeKitchenOperations.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      CDPH MEHKO overview
                      <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start rounded-full">
                    <Link
                      href="https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/GeneralPermitRequirementsMEHKO.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      CDPH general permit requirements (MEHKO)
                      <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start rounded-full">
                    <Link
                      href="https://ucanr.edu/sites/default/files/2020-10/338122.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      CA Retail Food Code excerpt (MEHKO chapter PDF)
                      <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-start rounded-full">
                    <Link
                      href="https://www.cdph.ca.gov/Programs/CEH/DFDCS/CDPH%20Document%20Library/FDB/FoodSafetyProgram/MEHKO/EH%20Agency%20Food%20Safety%20Websites.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Local environmental health agency links (PDF)
                      <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Want to see permit numbers?</p>
                  <p>
                    Visit our MEHKO-certified chefs page to view each chef’s listed permit number and issuing agency.
                  </p>
                  <Button asChild className="rounded-full">
                    <Link href="/community/local-cooks">MEHKO-certified chefs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <section aria-label="Food safety FAQ">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">Food safety FAQ</h2>
                <p className="text-sm text-muted-foreground">Practical answers for everyday ordering.</p>
              </div>

              <div className="mt-4 rounded-xl border-2 border-border bg-card px-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value="allergens">
                    <AccordionTrigger>What if I have allergies?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Review ingredient notes and ask questions before ordering. Cross-contact can happen in any kitchen.
                      If you have severe allergies, contact support and we’ll help you confirm what’s possible for that kitchen.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="handoff">
                    <AccordionTrigger>What should I do if I can’t receive my order right away?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Contact support as soon as possible. Food safety requirements can limit how long food can be held before
                      handoff. We’ll coordinate the best option available for that order.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="delivery">
                    <AccordionTrigger>Who is allowed to deliver for a MEHKO kitchen?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Under the MEHKO chapter, delivery on behalf of the operation may be restricted to the permitted operation’s
                      employee or a family/household member (and drivers must be properly licensed). This can limit the delivery
                      methods available for certain kitchens.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

