import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { MemberPortalClient } from "@/components/member-portal-client"
import { Footer } from "@/components/footer"
import { getSessionUserId } from "@/lib/session"

export const metadata: Metadata = {
  title: "Member portal | Munch",
  description: "Save your delivery address and browse MEHKO home kitchens near you.",
}

export default async function MemberPortalPage() {
  const sessionUserId = await getSessionUserId()
  if (!sessionUserId) redirect("/signin?next=/member")

  return (
    <div className="min-h-screen bg-background">
      <main className="border-b border-border">
        <MemberPortalClient />
      </main>
      <Footer />
    </div>
  )
}
