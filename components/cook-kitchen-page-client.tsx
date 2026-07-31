"use client"

import { useRouter } from "next/navigation"

import { CookKitchenSetupForm } from "@/components/cook-kitchen-setup-form"

export function CookKitchenPageClient() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Kitchen</h1>
        <p className="mt-2 text-muted-foreground">Update your listing, address, and visibility.</p>
      </div>
      <CookKitchenSetupForm
        onSaved={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
