import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function StaffHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Staff portal</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Update how restaurants appear on the site: names, hero images, cuisine labels, ratings, delivery copy, and promos.
        </p>
      </div>
      <Button asChild>
        <Link href="/staff/restaurants">Edit restaurants</Link>
      </Button>
    </div>
  )
}
