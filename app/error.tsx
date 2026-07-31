"use client"

import { useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-serif text-3xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-3 text-muted-foreground">
        We hit an unexpected error. Try again, or return home if the problem continues.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()} className="rounded-full">
          Try again
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  )
}
