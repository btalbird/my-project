export type OrderLine = { name: string; qty: number; price: string }

export type OrderItemsPayload = {
  restaurant?: string
  deliveryWindow?: string
  lines?: OrderLine[]
  total?: string
}

export const ORDER_STATUS_FILTERS = ["all", "delivered", "in_transit", "preparing", "cancelled"] as const
export type OrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number]

export function isOrderStatusFilter(v: string | undefined): v is OrderStatusFilter {
  return v !== undefined && (ORDER_STATUS_FILTERS as readonly string[]).includes(v)
}

export function parseItems(raw: unknown): OrderItemsPayload {
  if (!raw || typeof raw !== "object") return {}
  const o = raw as Record<string, unknown>
  const lines = Array.isArray(o.lines)
    ? o.lines
        .filter((x): x is OrderLine => {
          if (!x || typeof x !== "object") return false
          const l = x as Record<string, unknown>
          return typeof l.name === "string" && typeof l.qty === "number" && typeof l.price === "string"
        })
        .map((l) => ({
          name: l.name,
          qty: l.qty,
          price: l.price,
        }))
    : []
  return {
    restaurant: typeof o.restaurant === "string" ? o.restaurant : undefined,
    deliveryWindow: typeof o.deliveryWindow === "string" ? o.deliveryWindow : undefined,
    total: typeof o.total === "string" ? o.total : undefined,
    lines,
  }
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    delivered: "Delivered",
    in_transit: "On the way",
    preparing: "Preparing",
    cancelled: "Cancelled",
  }
  return map[status] ?? status.replace(/_/g, " ")
}

export function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "delivered":
      return "secondary"
    case "in_transit":
      return "default"
    case "preparing":
      return "outline"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}
