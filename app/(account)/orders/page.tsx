import Link from "next/link"
import { redirect } from "next/navigation"
import type { Order } from "@prisma/client"
import { Package, ChevronRight, MapPin } from "lucide-react"

import { prisma } from "@/lib/db"
import {
  isOrderStatusFilter,
  parseItems,
  statusLabel,
  statusVariant,
  type OrderStatusFilter,
} from "@/lib/order-format"
import { getSessionUserId } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const FILTER_TABS: { value: OrderStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "delivered", label: "Delivered" },
  { value: "in_transit", label: "On the way" },
  { value: "preparing", label: "Preparing" },
  { value: "cancelled", label: "Cancelled" },
]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sessionUserId = await getSessionUserId()
  if (!sessionUserId) redirect("/signin?next=/orders")

  const sp = await searchParams
  const statusFilter: OrderStatusFilter = isOrderStatusFilter(sp.status) ? sp.status : "all"

  let orders: Order[] = []

  try {
    orders = await prisma.order.findMany({
      where: { userId: sessionUserId },
      orderBy: { createdAt: "desc" },
    })
  } catch {
    // DB unavailable
  }

  const filtered =
    statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)

  function hrefForStatus(v: OrderStatusFilter) {
    const u = new URLSearchParams()
    if (v !== "all") u.set("status", v)
    const q = u.toString()
    return q ? `/orders?${q}` : "/orders"
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">My orders</span>
          </nav>
          <h1 className="mt-3 font-serif text-3xl font-bold text-foreground">My orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track deliveries and reorder from your favorite community kitchens.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTER_TABS.map((t) => (
            <Link
              key={t.value}
              href={hrefForStatus(t.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                statusFilter === t.value
                  ? "border-primary/40 bg-primary/10 font-medium text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {orders.length === 0 ? (
          <Card className="border-2 border-dashed border-border">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <Package className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">No orders yet</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  When you place an order, it will show up here with status updates and receipts.
                </p>
              </div>
              <Button asChild>
                <Link href="/restaurants">Browse restaurants</Link>
              </Button>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-2 border-border">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No orders in this category.{" "}
              <Link href="/orders" className="font-medium text-primary hover:underline">
                View all
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {filtered.map((order) => {
              const payload = parseItems(order.items)
              const placed = order.createdAt.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })

              return (
                <li key={order.id}>
                  <Card className="overflow-hidden border-2 border-border transition-shadow hover:shadow-md">
                    <CardHeader className="space-y-3 border-b border-border bg-card pb-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Order #{order.id}
                          </p>
                          <p className="text-sm text-muted-foreground">Placed {placed}</p>
                          {payload.restaurant ? (
                            <p className="truncate text-base font-semibold text-foreground">{payload.restaurant}</p>
                          ) : null}
                          {payload.deliveryWindow ? (
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              {payload.deliveryWindow}
                            </p>
                          ) : null}
                        </div>
                        <Badge variant={statusVariant(order.status)} className="shrink-0 capitalize">
                          {statusLabel(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {payload.lines?.length ? (
                        <ul className="divide-y divide-border rounded-lg border border-border bg-secondary/30">
                          {payload.lines.slice(0, 4).map((line, i) => (
                            <li
                              key={`${order.id}-${i}`}
                              className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm first:rounded-t-lg last:rounded-b-lg"
                            >
                              <span className="text-foreground">
                                <span className="font-medium">{line.name}</span>
                                {line.qty > 1 ? (
                                  <span className="text-muted-foreground"> × {line.qty}</span>
                                ) : null}
                              </span>
                              <span className="shrink-0 tabular-nums text-muted-foreground">{line.price}</span>
                            </li>
                          ))}
                          {payload.lines.length > 4 ? (
                            <li className="px-3 py-2 text-center text-xs text-muted-foreground">
                              +{payload.lines.length - 4} more on receipt
                            </li>
                          ) : null}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No line items on file.</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-6 py-4">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Total </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {payload.total ?? "—"}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild className="rounded-full">
                          <Link href={`/orders/${order.id}`}>View order</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="rounded-full">
                          <Link href="/help">Help</Link>
                        </Button>
                        {order.status === "cancelled" ? (
                          <Button variant="default" size="sm" className="rounded-full" disabled>
                            Reorder
                          </Button>
                        ) : (
                          <Button variant="default" size="sm" className="rounded-full" asChild>
                            <Link href="/restaurants">
                              Reorder
                              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
