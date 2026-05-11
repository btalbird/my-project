"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function StaffDesignsCreateButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch("/api/staff/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Create failed")
        return
      }
      const id = String(data.id ?? "")
      if (!id) {
        setError("Create failed")
        return
      }
      router.push(`/staff/designs/${id}`)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => void onClick()} disabled={pending}>
        {pending ? "Creating…" : "New design"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

