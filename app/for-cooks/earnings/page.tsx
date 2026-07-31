import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="mt-2 text-muted-foreground">
          Payouts and tax documents are managed through your Stripe Express dashboard.
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Payouts</CardTitle>
          <CardDescription>
            Food order payments are deposited to your connected bank account on Stripe&apos;s payout
            schedule (typically 2–7 business days in the US).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Open the Cook Dashboard and scroll to <strong>Stripe Payouts</strong>. You can connect your
            account once onboarding is complete. You&apos;ll see balance, transfers, and payout history
            there.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/for-cooks/cook-dashboard">Go to Cook Dashboard</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Platform fees</CardTitle>
          <CardDescription>
            Munch may retain a small platform fee on each order (shown at checkout). Your listing
            subscription is billed separately each month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Daily gross sales on the dashboard are based on paid customer orders before Stripe and
            platform fees. For net earnings, use your Stripe dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
