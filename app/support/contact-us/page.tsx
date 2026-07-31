"use client"

import * as React from "react"
import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Facebook, Instagram, Mail, MessageSquareText, Phone, Send, Twitter } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

type Topic =
  | "order_issue"
  | "delivery_pickup"
  | "refund_billing"
  | "account"
  | "food_safety"
  | "partnerships"
  | "other"

const TOPIC_LABELS: Record<Topic, string> = {
  order_issue: "Order issue (missing/incorrect items)",
  delivery_pickup: "Delivery or pickup question",
  refund_billing: "Refunds & billing",
  account: "Account help",
  food_safety: "Food safety / allergens",
  partnerships: "Partnerships / press",
  other: "Other",
}

function isTopic(value: string | null): value is Topic {
  return value !== null && Object.prototype.hasOwnProperty.call(TOPIC_LABELS, value)
}

function ContactUsPageInner() {
  const searchParams = useSearchParams()
  const [submitted, setSubmitted] = React.useState(false)
  const [topic, setTopic] = React.useState<Topic>("order_issue")
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    orderNumber: "",
    message: "",
  })

  React.useEffect(() => {
    const fromQuery = searchParams.get("topic")
    if (isTopic(fromQuery)) setTopic(fromQuery)
  }, [searchParams])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setForm({ name: "", email: "", orderNumber: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/support/help-center" className="hover:text-foreground transition-colors">
              Help Center
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">Contact us</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Contact us
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Support
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              Tell us what’s going on and we’ll help. For order issues, include your order number for the fastest resolution.
            </p>

            {submitted ? (
              <Alert className="border-2 border-border">
                <AlertTitle>Message sent</AlertTitle>
                <AlertDescription>
                  Thanks for reaching out. We’ll follow up by email as soon as we can.
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle>Send a message</CardTitle>
                <CardDescription>We typically respond within 1–2 business days.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Name</Label>
                      <Input
                        id="contact-name"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Topic</Label>
                      <Select value={topic} onValueChange={(v) => setTopic(v as Topic)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TOPIC_LABELS).map(([k, label]) => (
                            <SelectItem key={k} value={k}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-order">Order number (optional)</Label>
                      <Input
                        id="contact-order"
                        value={form.orderNumber}
                        onChange={(e) => setForm((p) => ({ ...p, orderNumber: e.target.value }))}
                        placeholder="e.g. 10482"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Share what happened and how we can help..."
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      By submitting, you agree we can contact you at the email provided.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" className="rounded-full">
                      <Send className="mr-2 h-4 w-4" aria-hidden />
                      Submit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setSubmitted(false)
                        setTopic("order_issue")
                        setForm({ name: "", email: "", orderNumber: "", message: "" })
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>Other ways to reach us</CardTitle>
                  <CardDescription>Choose what’s easiest for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-muted-foreground">support@munch.example</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <p className="text-muted-foreground">(555) 555-0123</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquareText className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="font-medium text-foreground">Live chat</p>
                      <p className="text-muted-foreground">Available in-app during business hours.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>Connect with us</CardTitle>
                  <CardDescription>Follow for updates, new cooks, and community highlights.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <Button asChild variant="outline" className="justify-start rounded-full">
                      <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <Instagram className="mr-2 h-4 w-4" aria-hidden />
                        Instagram
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start rounded-full">
                      <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <Facebook className="mr-2 h-4 w-4" aria-hidden />
                        Facebook
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start rounded-full">
                      <Link href="https://x.com" target="_blank" rel="noopener noreferrer">
                        <Twitter className="mr-2 h-4 w-4" aria-hidden />
                        X (Twitter)
                      </Link>
                    </Button>
                  </div>

                  <Separator />

                  <p className="text-xs text-muted-foreground">
                    For account-specific issues, please contact support directly so we can verify details.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>Common questions</CardTitle>
                  <CardDescription>Quick links before you submit.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="refunds">
                      <AccordionTrigger>Refunds and billing</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        If you’re missing an item, received the wrong item, or had a late delivery, contact us with your order number.
                        Refunds usually return to your original payment method within 3–10 business days.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="safety">
                      <AccordionTrigger>Food safety and allergens</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Ingredient notes help, but cross-contact is possible in any kitchen. If you have severe allergies, contact support before ordering.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ContactUsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
            <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
              Loading…
            </div>
          </main>
        </div>
      }
    >
      <ContactUsPageInner />
    </Suspense>
  )
}

