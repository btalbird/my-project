import { Suspense } from "react"

import { CartPageClient } from "@/components/cart-page-client"

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-10 text-muted-foreground">Loading cart…</main>
      }
    >
      <CartPageClient />
    </Suspense>
  )
}
