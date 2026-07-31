"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AdminPermitRow = {
  restaurantId: number
  kitchenName: string
  kitchenCity: string | null
  kitchenState: string | null
  cookEmail: string | null
  cookName: string | null
  jurisdictionName: string
  permitNumber: string | null
  expiresAt: string | null
  documentUrl: string | null
  status: string
  statusLabel: string
  rejectionReason: string | null
  submittedAt: string | null
}

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default"
    case "pending_review":
      return "secondary"
    case "rejected":
    case "expired":
      return "destructive"
    default:
      return "outline"
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function AdminMehkoPermitsTable() {
  const [permits, setPermits] = useState<AdminPermitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  async function loadPermits() {
    setError(null)
    const res = await fetch("/api/admin/mehko-permits")
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(typeof body.error === "string" ? body.error : "Failed to load permits")
    }
    const data = (await res.json()) as { permits: AdminPermitRow[] }
    setPermits(data.permits ?? [])
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadPermits()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function review(restaurantId: number, action: "approve" | "reject", rejectionReason?: string) {
    setPendingId(restaurantId)
    setError(null)
    try {
      const res = await fetch(`/api/admin/mehko-permits/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Review action failed")
        return
      }
      setRejectingId(null)
      setRejectReason("")
      await loadPermits()
    } finally {
      setPendingId(null)
    }
  }

  const pending = permits.filter((p) => p.status === "pending_review")
  const others = permits.filter((p) => p.status !== "pending_review")

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading permit queue…
      </div>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-xl">MEHKO permit review</CardTitle>
        <CardDescription>
          Approve or reject cook permit submissions. Approved kitchens are published automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No permits pending review.</p>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Pending review ({pending.length})</h3>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kitchen</TableHead>
                    <TableHead>Cook</TableHead>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Permit #</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((permit) => (
                    <TableRow key={permit.restaurantId}>
                      <TableCell>
                        <div className="font-medium">{permit.kitchenName}</div>
                        <div className="text-xs text-muted-foreground">
                          {[permit.kitchenCity, permit.kitchenState].filter(Boolean).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{permit.cookName ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{permit.cookEmail ?? "—"}</div>
                      </TableCell>
                      <TableCell>{permit.jurisdictionName}</TableCell>
                      <TableCell>{permit.permitNumber ?? "—"}</TableCell>
                      <TableCell>{formatDate(permit.expiresAt)}</TableCell>
                      <TableCell>{formatDate(permit.submittedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-2">
                          {permit.documentUrl ? (
                            <a
                              href={permit.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                            >
                              View document
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : null}
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={pendingId === permit.restaurantId}
                              onClick={() => void review(permit.restaurantId, "approve")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={pendingId === permit.restaurantId}
                              onClick={() => {
                                setRejectingId(permit.restaurantId)
                                setRejectReason("")
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                          {rejectingId === permit.restaurantId ? (
                            <div className="w-full max-w-xs space-y-2 text-left">
                              <Label htmlFor={`reject-${permit.restaurantId}`}>Rejection reason</Label>
                              <Input
                                id={`reject-${permit.restaurantId}`}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Explain what to fix"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={!rejectReason.trim() || pendingId === permit.restaurantId}
                                  onClick={() =>
                                    void review(permit.restaurantId, "reject", rejectReason.trim())
                                  }
                                >
                                  Confirm reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setRejectingId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {others.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Recently reviewed</h3>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kitchen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permit #</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Document</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {others.map((permit) => (
                    <TableRow key={permit.restaurantId}>
                      <TableCell>{permit.kitchenName}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(permit.status)}>{permit.statusLabel}</Badge>
                        {permit.rejectionReason ? (
                          <p className="mt-1 text-xs text-muted-foreground">{permit.rejectionReason}</p>
                        ) : null}
                      </TableCell>
                      <TableCell>{permit.permitNumber ?? "—"}</TableCell>
                      <TableCell>{formatDate(permit.expiresAt)}</TableCell>
                      <TableCell>
                        {permit.documentUrl ? (
                          <a
                            href={permit.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary underline-offset-4 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
