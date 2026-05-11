import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function StaffHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Staff portal</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Update how the storefront looks and reads: listings, pages, and design assets.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/staff/restaurants">Edit restaurants</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/staff/designs">Design assets</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/staff/pages">Site pages</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/staff/branding">Branding</Link>
        </Button>
      </div>
    </div>
  )
}
