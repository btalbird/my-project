import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-serif text-3xl font-bold text-foreground">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        We couldn&apos;t find that page. It may have moved or the link is incorrect.
      </p>
      <Button asChild className="mt-8 rounded-full">
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  )
}
