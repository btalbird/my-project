"use client"

import { useCallback, useEffect, useState } from "react"
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
import { statusLabel, statusVariant } from "@/lib/order-format"

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

const NEXT_STATUS: Record<string, { status: string; label: string } | null> = {
  preparing: { status: "ready", label: "Mark ready" },
  ready: { status: "completed", label: "Complete" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function CookOrdersClient() {
  const [orders, setOrders] = useState<CookOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch("/api/cook/orders?limit=50")
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(typeof data.error === "string" ? data.error : "Failed to load orders")
    }
    const data = (await res.json()) as { orders: CookOrder[] }
    setOrders(data.orders ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await load()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    const interval = window.setInterval(() => void load(), 30_000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [load])

  async function updateStatus(orderId: number, status: string) {
    setPendingId(orderId)
    try {
      const res = await fetch(`/api/cook/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not update order")
        return
      }
      toast.success(`Order marked ${status}`)
      await load()
    } finally {
      setPendingId(null)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading orders…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Orders</h1>
        <p className="mt-2 text-muted-foreground">Live queue refreshes every 30 seconds.</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Order queue</CardTitle>
          <CardDescription>New → Preparing → Ready → Completed</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No paid orders yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const next = NEXT_STATUS[order.status]
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.customer.name ?? "Guest"}</div>
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
                        <TableCell className="whitespace-nowrap">{order.items.total ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {next ? (
                            <Button
                              size="sm"
                              className="rounded-full"
                              disabled={pendingId === order.id}
                              onClick={() => void updateStatus(order.id, next.status)}
                            >
                              {next.label}
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
