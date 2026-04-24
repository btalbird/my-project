import Link from "next/link"
import { CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const CDPH_MEHKO =
  "https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/MicroenterpriseHomeKitchenOperations.aspx"
const MEHKO_COUNTIES = "https://mehko.org/list-california-counties-mehko-accepting-applications/"
const MEHKO_HOME = "https://mehko.org/"

const STEPS = [
  {
    title: "Confirm your city or county participates",
    body: "MEHKO is adopted locally—not every jurisdiction runs a program. Check whether your county or city environmental health department issues MEHKO permits and what they call the application (sometimes “home kitchen,” “MEHKO,” or similar).",
  },
  {
    title: "Read state and local requirements",
    body: "California publishes statewide framework information through CDPH; your local agency adds permit conditions, fees, menus, labeling, and inspection steps. Read both before you invest in equipment or menus.",
  },
  {
    title: "Complete food-safety prerequisites (if required)",
    body: "Many jurisdictions expect a certified food manager, food handler training, or both. Requirements vary—follow your permit office’s checklist rather than a generic online course unless they name one.",
  },
  {
    title: "Prepare your application packet",
    body: "Typical items include a menu, standard operating procedures, allergen labeling plans, and sometimes a home kitchen diagram. Your environmental health department will tell you exactly what to submit.",
  },
  {
    title: "Apply and schedule inspection / plan review",
    body: "Submit through the channel your agency specifies (online portal, email, or in person). Be ready to revise your plan based on reviewer feedback and to pass an on-site inspection when scheduled.",
  },
  {
    title: "Operate within MEHKO limits after approval",
    body: "Permits usually cap weekly sales, restrict certain foods, and require clear labeling and safe time/temperature controls. Operating outside your permit can mean suspension or enforcement—stay within what you were approved to do.",
  },
] as const

export function BecomeACookMehkoGuide() {
  return (
    <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">Become a cook</span>
        </nav>

        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Become a MEHKO-certified home cook in California
            </h1>
            <Badge variant="secondary" className="rounded-full">
              California · MEHKO
            </Badge>
          </div>
          <p className="max-w-3xl text-lg text-muted-foreground">
            A practical overview for cooks who want to sell qualifying meals from a permitted home kitchen—not legal
            advice. Always confirm requirements with your local environmental health agency.
          </p>
        </div>

        <Alert className="mt-8 border-2 border-border">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          <AlertTitle>Disclaimer</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            In The Kitchen is not a government agency. Rules, fees, menus, and enforcement differ by city and county.
            Nothing here replaces your permit office or an attorney. Verify every step with the agency that issues your
            permit.
          </AlertDescription>
        </Alert>

        <section className="mt-10 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-foreground">What is MEHKO?</h2>
          <p className="max-w-3xl text-muted-foreground">
            MEHKO stands for{" "}
            <span className="font-medium text-foreground">Microenterprise Home Kitchen Operation</span>. It’s a
            California framework that can allow a home cook to prepare and sell meals from their primary residence. A
            permit is issued by your <span className="font-medium text-foreground">local city or county</span>{" "}
            environmental health department—not by In The Kitchen.
          </p>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Availability and exact rules vary by jurisdiction. CDPH notes that cities and counties have discretion to
            authorize MEHKOs; confirm status and application steps with your local agency before you rely on any summary.
          </p>
        </section>

        <Separator className="my-10" />

        <section>
          <h2 className="font-serif text-2xl font-bold text-foreground">How to become permitted (high-level)</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Order and names of steps depend on your jurisdiction. Use this as a checklist to discuss with environmental
            health—not a guarantee of approval or timeline.
          </p>

          <ol className="mt-8 space-y-6">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Card className="border-2 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-start gap-3 text-lg font-semibold">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>{step.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
                    <p>{step.body}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <Card className="mt-10 border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-xl">
              <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
              Official links (permits and information)
            </CardTitle>
            <CardDescription>
              Statewide CDPH guidance, a community-maintained county list, and MEHKO.org for additional context. How you
              apply and pay fees is always determined by your local environmental health department.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={CDPH_MEHKO} target="_blank" rel="noopener noreferrer">
                CDPH — Microenterprise Home Kitchen Operations
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={MEHKO_COUNTIES} target="_blank" rel="noopener noreferrer">
                List of California counties (MEHKO.org)
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={MEHKO_HOME} target="_blank" rel="noopener noreferrer">
                MEHKO.org home
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6 border-2 border-border bg-card/60">
          <CardHeader>
            <CardTitle className="font-serif text-xl">On In The Kitchen</CardTitle>
            <CardDescription>More reading elsewhere on the site.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/promos/2">What is MEHKO certification? (overview)</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/for-cooks/recipe-guidelines">Recipe guidelines</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/support/food-safety">Food safety hub</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
