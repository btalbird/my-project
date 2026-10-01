import { Suspense } from "react"

import { RestaurantsPageClient } from "@/components/restaurants-page-client"

export default async function RestaurantsPage() {
  return (
    <Suspense>
      <RestaurantsPageClient />
    </Suspense>
  )
}

