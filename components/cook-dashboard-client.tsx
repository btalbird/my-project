"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CreditCard, Loader2, TrendingUp, UtensilsCrossed, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CookKitchenSetupForm } from "@/components/cook-kitchen-setup-form"
import { CookOnboardingChecklist } from "@/components/cook-onboarding-checklist"
import { statusLabel, statusVariant } from "@/lib/order-format"

type CookMeResponse = {
  user: { id: string; email: string; name: string | null; role: string }
  restaurants: { id: number; name: string; cuisine: string; image: string }[]
  subscription: {
    status: string
    currentPeriodEnd: string | null
    hasBillingAccount: boolean
  } | null
  hasActiveSubscription: boolean
  connect: {
    hasAccount: boolean
    chargesEnabled: boolean
    payoutsEnabled: boolean
    detailsSubmitted: boolean
    readyForPayments: boolean
  }
  menuItemCount: number
  paidOrderCount: number
  mehkoPermit: {
    status: string
    expiresAt: string | null
    isLive: boolean
    renewalDue: boolean
    rejectionReason: string | null
  } | null
}

type CookOrder = {
  id: number
  status: string
  createdAt: string
  customer: { id: string; name: string | null; email: string }
  restaurant: string | null
  items: {
    lines?: { name: string; qty: number; price: string }[]
    total?: string
    deliveryWindow?: string
  }
}

type CookStats = {
  today: { orders: number; meals: number; gross: number }
  summary: { orders: number; meals: number; gross: number }
  days: { date: string; orders: number; meals: number; gross: number }[]
}

function subscriptionBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default"
    case "past_due":
      return "destructive"
    case "trialing":
      return "secondary"
    default:
      return "outline"
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDayLabel(dateKey: string) {
  const d = new Date(`${dateKey}T12:00:00`)
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
}

export function CookDashboardClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<CookMeResponse | null>(null)
  const [orders, setOrders] = useState<CookOrder[]>([])
  const [stats, setStats] = useState<CookStats | null>(null)
  const [listingFeeLabel, setListingFeeLabel] = useState<string | null>(null)
  const [connectLive, setConnectLive] = useState<{
    readyToProcessPayments: boolean
    onboardingComplete: boolean
    requirementsStatus: string | null
    storefrontPath: string | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [billingPending, setBillingPending] = useState(false)
  const [connectPending, setConnectPending] = useState(false)

  const subscribedFlash = searchParams.get("subscribed")
  const connectFlash = searchParams.get("connect")

  useEffect(() => {
    if (subscribedFlash === "1") {
      toast.success("Thanks for subscribing! Your listing activates once payment is confirmed.")
      router.replace("/for-cooks/cook-dashboard")
    } else if (subscribedFlash === "0") {
      toast.message("Checkout cancelled. Subscribe anytime to activate your listing.")
      router.replace("/for-cooks/cook-dashboard")
    } else if (connectFlash === "return") {
      toast.success("Stripe Connect setup saved. Payouts unlock once Stripe verifies your account.")
      router.replace("/for-cooks/cook-dashboard")
    } else if (connectFlash === "refresh") {
      toast.message("Stripe link expired. Click Continue Stripe setup to resume.")
      router.replace("/for-cooks/cook-dashboard")
    }
  }, [subscribedFlash, connectFlash, router])

  const loadDashboard = useCallback(async () => {
    setError(null)
    const meRes = await fetch("/api/cook/me")
    if (!meRes.ok) {
      const data = await meRes.json().catch(() => ({}))
      throw new Error(typeof data.error === "string" ? data.error : "Failed to load profile")
    }
    const meData = (await meRes.json()) as CookMeResponse
    setMe(meData)

    if (meData.hasActiveSubscription && meData.restaurants.length > 0) {
      const [ordersRes, statsRes] = await Promise.all([
        fetch("/api/cook/orders?limit=25"),
        fetch("/api/cook/stats?days=7"),
      ])
      if (ordersRes.ok) {
        const ordersData = (await ordersRes.json()) as { orders: CookOrder[] }
        setOrders(ordersData.orders ?? [])
      }
      if (statsRes.ok) {
        setStats((await statsRes.json()) as CookStats)
      }
    } else {
      setOrders([])
      setStats(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadDashboard()
        const feeRes = await fetch("/api/cooks/listing-fee")
        if (!cancelled && feeRes.ok) {
          const feeData = (await feeRes.json()) as { label?: string }
          if (typeof feeData.label === "string") setListingFeeLabel(feeData.label)
        }
        const connectRes = await fetch("/api/cook/connect/status")
        if (!cancelled && connectRes.ok) {
          const connectData = (await connectRes.json()) as {
            readyToProcessPayments?: boolean
            onboardingComplete?: boolean
            requirementsStatus?: string | null
            storefrontPath?: string | null
          }
          setConnectLive({
            readyToProcessPayments: Boolean(connectData.readyToProcessPayments),
            onboardingComplete: Boolean(connectData.onboardingComplete),
            requirementsStatus: connectData.requirementsStatus ?? null,
            storefrontPath: connectData.storefrontPath ?? null,
          })
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadDashboard, connectFlash])

  async function startCheckout() {
    setBillingPending(true)
    setError(null)
    try {
      const res = await fetch("/api/cook/billing/checkout", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Checkout failed")
        return
      }
      if (typeof data.url === "string") {
        window.location.href = data.url
      }
    } finally {
      setBillingPending(false)
    }
  }

  async function openPortal() {
    setBillingPending(true)
    setError(null)
    try {
      const res = await fetch("/api/cook/billing/portal", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Billing portal failed")
        return
      }
      if (typeof data.url === "string") {
        window.location.href = data.url
      }
    } finally {
      setBillingPending(false)
    }
  }

  async function startConnectOnboarding() {
    setConnectPending(true)
    setError(null)
    try {
      const res = await fetch("/api/cook/connect/onboard", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Stripe Connect setup failed")
        return
      }
      if (typeof data.url === "string") {
        window.location.href = data.url
      }
    } finally {
      setConnectPending(false)
    }
  }

  async function openConnectDashboard() {
    setConnectPending(true)
    setError(null)
    try {
      const res = await fetch("/api/cook/connect/dashboard", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not open Stripe dashboard")
        return
      }
      if (typeof data.url === "string") {
        window.location.href = data.url
      }
    } finally {
      setConnectPending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading cook dashboard…
      </div>
    )
  }

  if (!me) {
    return <p className="text-destructive py-10">{error ?? "Unable to load dashboard."}</p>
  }

  const subStatus = me.subscription?.status ?? "none"
  const kitchenName = me.restaurants[0]?.name

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Cook Dashboard</h1>
        <p className="text-muted-foreground max-w-2xl">
          Manage your Munch kitchen listing, subscription, and orders
          {kitchenName ? ` for ${kitchenName}` : ""}.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {me.mehkoPermit?.renewalDue ? (
        <Card className="border-2 border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
          <CardContent className="py-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Your MEHKO permit needs renewal
              {me.mehkoPermit.expiresAt
                ? ` by ${new Date(me.mehkoPermit.expiresAt).toLocaleDateString()}`
                : ""}
              .{" "}
              <Link href="/for-cooks/permit" className="font-medium underline underline-offset-4">
                Update your permit
              </Link>{" "}
              to stay visible to customers.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {me.mehkoPermit?.status === "rejected" && me.mehkoPermit.rejectionReason ? (
        <Card className="border-2 border-destructive/30">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">
              Permit rejected: {me.mehkoPermit.rejectionReason}{" "}
              <Link href="/for-cooks/permit" className="font-medium underline underline-offset-4">
                Resubmit permit
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : null}

      <CookOnboardingChecklist
        connectReady={connectLive?.readyToProcessPayments ?? me.connect.readyForPayments}
        hasConnectAccount={me.connect.hasAccount}
        subscribed={me.hasActiveSubscription}
        hasKitchen={me.restaurants.length > 0}
        permitApproved={me.mehkoPermit?.isLive ?? false}
        permitStatus={me.mehkoPermit?.status}
        permitExpiresAt={me.mehkoPermit?.expiresAt}
        permitRenewalDue={me.mehkoPermit?.renewalDue}
        hasMenuItems={me.menuItemCount > 0}
        hasPaidOrder={me.paidOrderCount > 0}
        listingFeeLabel={listingFeeLabel}
      />

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Stripe Payouts
          </CardTitle>
          <CardDescription>
            Onboard to collect payments. Status is fetched live from Stripe on each visit.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <Badge
              variant={
                (connectLive?.readyToProcessPayments ?? me.connect.readyForPayments)
                  ? "default"
                  : me.connect.hasAccount
                    ? "secondary"
                    : "outline"
              }
            >
              {(connectLive?.readyToProcessPayments ?? me.connect.readyForPayments)
                ? "Ready for orders"
                : me.connect.hasAccount
                  ? "Setup incomplete"
                  : "Not connected"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {(connectLive?.readyToProcessPayments ?? me.connect.readyForPayments)
                ? "Customers can pay for meals from your kitchen at checkout."
                : "Click below to start Stripe-hosted onboarding."}
            </p>
            {connectLive?.requirementsStatus ? (
              <p className="text-xs text-muted-foreground">
                Requirements: {connectLive.requirementsStatus.replace(/_/g, " ")}
              </p>
            ) : null}
            {connectLive?.storefrontPath ? (
              <p className="text-xs">
                <Link href={connectLive.storefrontPath} className="text-primary underline-offset-4 hover:underline">
                  Sample Stripe storefront
                </Link>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {(connectLive?.readyToProcessPayments ?? me.connect.readyForPayments) ? (
              <Button variant="outline" disabled={connectPending} onClick={() => void openConnectDashboard()}>
                Stripe payout dashboard
              </Button>
            ) : null}
            <Button disabled={connectPending} onClick={() => void startConnectOnboarding()}>
              {connectPending
                ? "Redirecting…"
                : me.connect.hasAccount
                  ? "Continue Stripe setup"
                  : "Onboard to collect payments"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Kitchen listing subscription
          </CardTitle>
          <CardDescription>
            Monthly listing fee to appear on Munch and access order tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <Badge variant={subscriptionBadgeVariant(subStatus)}>
              {subStatus === "none" ? "Not subscribed" : subStatus.replace(/_/g, " ")}
            </Badge>
            {me.subscription?.currentPeriodEnd ? (
              <p className="text-sm text-muted-foreground">
                Current period ends{" "}
                {new Date(me.subscription.currentPeriodEnd).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {me.hasActiveSubscription && me.subscription?.hasBillingAccount ? (
              <Button variant="outline" disabled={billingPending} onClick={() => void openPortal()}>
                Manage billing
              </Button>
            ) : null}
            {!me.hasActiveSubscription ? (
              <Button
                disabled={billingPending || !me.connect.hasAccount}
                onClick={() => void startCheckout()}
              >
                {billingPending
                  ? "Redirecting…"
                  : listingFeeLabel
                    ? `Subscribe (${listingFeeLabel})`
                    : "Subscribe monthly"}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {me.restaurants.length === 0 ? (
        <CookKitchenSetupForm onSaved={() => void loadDashboard()} />
      ) : (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Kitchen listing</CardTitle>
            <CardDescription>
              {kitchenName} is on file. Update address, cuisine, or publish settings anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/for-cooks/kitchen">Edit kitchen</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!me.hasActiveSubscription ? (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Order tracking locked</CardTitle>
            <CardDescription>
              Subscribe to activate your listing and unlock daily sales stats and customer orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled={billingPending} onClick={() => void startCheckout()}>
              Subscribe to unlock
            </Button>
          </CardContent>
        </Card>
      ) : me.restaurants.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Today&apos;s orders</CardDescription>
                <CardTitle className="text-3xl font-serif">{stats?.today.orders ?? 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  Meals sold today
                </CardDescription>
                <CardTitle className="text-3xl font-serif">{stats?.today.meals ?? 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Gross today
                </CardDescription>
                <CardTitle className="text-3xl font-serif">
                  ${(stats?.today.gross ?? 0).toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {stats && stats.days.length > 0 ? (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Last 7 days</CardTitle>
                <CardDescription>
                  {stats.summary.orders} orders · {stats.summary.meals} meals · $
                  {stats.summary.gross.toFixed(2)} gross
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Meals</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...stats.days].reverse().map((day) => (
                        <TableRow key={day.date}>
                          <TableCell>{formatDayLabel(day.date)}</TableCell>
                          <TableCell className="text-right">{day.orders}</TableCell>
                          <TableCell className="text-right">{day.meals}</TableCell>
                          <TableCell className="text-right">${day.gross.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="font-serif text-xl">Recent orders</CardTitle>
                <CardDescription>Customer names and dishes for your kitchen.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-full shrink-0">
                <Link href="/for-cooks/orders">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No orders yet for your kitchen.</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {order.customer.name ?? "Guest"}
                            </div>
                            <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <ul className="text-sm space-y-0.5">
                              {(order.items.lines ?? []).map((line, i) => (
                                <li key={`${order.id}-${i}`}>
                                  {line.qty}× {line.name}
                                </li>
                              ))}
                            </ul>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {order.items.total ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(order.status)}>
                              {statusLabel(order.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      <p className="text-sm text-muted-foreground">
        <Link href="/for-cooks/recipe-guidelines" className="text-primary underline-offset-4 hover:underline">
          Recipe guidelines
        </Link>
        {" · "}
        <Link href="/for-cooks/become-a-cook" className="text-primary underline-offset-4 hover:underline">
          MEHKO permit guide
        </Link>
      </p>
    </div>
  )
}
