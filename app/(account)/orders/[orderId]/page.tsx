import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import type { Order } from "@prisma/client"
import { ArrowLeft, MapPin } from "lucide-react"

import { prisma } from "@/lib/db"
import { parseItems, statusLabel, statusVariant } from "@/lib/order-format"
import { getSessionUserId } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

async function loadOrder(orderId: string, sessionUserId: string): Promise<Order | null> {
  const numericId = Number(orderId)
  if (!Number.isFinite(numericId)) return null

  try {
    const row = await prisma.order.findFirst({
      where: { id: numericId, userId: sessionUserId },
    })
    if (row) return row
  } catch {
    return null
  }

  return null
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const sessionUserId = await getSessionUserId()
  if (!sessionUserId) redirect("/signin?next=/orders")

  const { orderId } = await params
  const order = await loadOrder(orderId, sessionUserId)
  if (!order) notFound()

  const payload = parseItems(order.items)
  const placed = order.createdAt.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6 gap-1 text-muted-foreground hover:text-foreground">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to orders
          </Link>
        </Button>

        <Card className="border-2 border-border">
          <CardHeader className="space-y-2 border-b border-border bg-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order receipt</p>
                <CardTitle className="font-serif text-2xl">Order #{order.id}</CardTitle>
                <p className="text-sm text-muted-foreground">{placed}</p>
              </div>
              <Badge variant={statusVariant(order.status)} className="capitalize">
                {statusLabel(order.status)}
              </Badge>
            </div>
            {payload.restaurant ? (
              <p className="text-lg font-semibold text-foreground">{payload.restaurant}</p>
            ) : null}
            {payload.deliveryWindow ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                {payload.deliveryWindow}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-sm font-semibold text-foreground">Items</h2>
            {payload.lines?.length ? (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {payload.lines.map((line, i) => (
                  <li key={i} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                    <span>
                      <span className="font-medium text-foreground">{line.name}</span>
                      {line.qty > 1 ? (
                        <span className="text-muted-foreground"> × {line.qty}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{line.price}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No items listed.</p>
            )}
            <div className="flex justify-between border-t border-border pt-4 text-base">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold tabular-nums text-foreground">{payload.total ?? "—"}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 border-t border-border bg-muted/20">
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/help">Help with this order</Link>
            </Button>
            {order.status === "cancelled" ? (
              <Button className="rounded-full" disabled>
                Reorder
              </Button>
            ) : (
              <Button className="rounded-full" asChild>
                <Link href="/restaurants">Reorder</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
