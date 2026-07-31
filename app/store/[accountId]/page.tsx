import { Suspense } from "react"

import { StorePageClient } from "@/components/store-page-client"

export default async function StorePage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  const { accountId } = await params

  return (
    <Suspense fallback={<p className="p-10 text-muted-foreground">Loading storefront…</p>}>
      <StorePageClient accountId={accountId} />
    </Suspense>
  )
}
