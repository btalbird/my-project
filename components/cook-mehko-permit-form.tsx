"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertTriangle, ExternalLink, FileCheck, Loader2, Upload } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Jurisdiction = {
  id: string
  name: string
  issuingAgencyDefault: string
  officialUrl: string
}

type Permit = {
  id: string
  restaurantId: number
  jurisdictionId: string
  jurisdictionName: string
  permitNumber: string | null
  issuingAgency: string | null
  issuedAt: string | null
  expiresAt: string | null
  documentUrl: string | null
  status: string
  statusLabel: string
  autoCheckPassed: boolean
  autoCheckNotes: { code: string; message: string; passed: boolean }[] | null
  rejectionReason: string | null
  isLive: boolean
  renewalDue: boolean
  officialUrl: string | null
}

type PermitResponse = {
  kitchen: { id: number } | null
  permit: Permit | null
  inferredJurisdiction: Jurisdiction | null
  jurisdictions: Jurisdiction[]
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
    case "renewal_required":
      return "outline"
    default:
      return "outline"
  }
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return ""
  return iso.slice(0, 10)
}

export function CookMehkoPermitForm() {
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [uploadPending, setUploadPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [data, setData] = useState<PermitResponse | null>(null)

  const [jurisdictionId, setJurisdictionId] = useState("")
  const [permitNumber, setPermitNumber] = useState("")
  const [issuingAgency, setIssuingAgency] = useState("")
  const [issuedAt, setIssuedAt] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  async function loadPermit() {
    setError(null)
    const res = await fetch("/api/cook/mehko-permit")
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(typeof body.error === "string" ? body.error : "Failed to load permit")
    }
    const json = (await res.json()) as PermitResponse
    setData(json)

    const inferred = json.inferredJurisdiction?.id ?? json.jurisdictions[0]?.id ?? ""
    const permit = json.permit
    setJurisdictionId(permit?.jurisdictionId ?? inferred)
    setPermitNumber(permit?.permitNumber ?? "")
    setIssuingAgency(
      permit?.issuingAgency ??
        json.inferredJurisdiction?.issuingAgencyDefault ??
        json.jurisdictions[0]?.issuingAgencyDefault ??
        "",
    )
    setIssuedAt(toDateInputValue(permit?.issuedAt ?? null))
    setExpiresAt(toDateInputValue(permit?.expiresAt ?? null))
    setDocumentUrl(permit?.documentUrl ?? null)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadPermit()
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

  useEffect(() => {
    const jurisdiction = data?.jurisdictions.find((j) => j.id === jurisdictionId)
    if (jurisdiction && !issuingAgency) {
      setIssuingAgency(jurisdiction.issuingAgencyDefault)
    }
  }, [jurisdictionId, data?.jurisdictions, issuingAgency])

  async function uploadDocument(file: File) {
    setUploadPending(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set("document", file)
      const res = await fetch("/api/cook/mehko-permit/document", {
        method: "POST",
        body: formData,
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Upload failed")
        return
      }
      if (typeof body.documentUrl === "string") {
        setDocumentUrl(body.documentUrl)
      }
    } finally {
      setUploadPending(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/cook/mehko-permit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jurisdictionId,
          permitNumber,
          issuingAgency,
          issuedAt: issuedAt || null,
          expiresAt,
          documentUrl,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Could not submit permit")
        return
      }
      await loadPermit()
      const permit = body.permit as Permit | undefined
      if (permit?.status === "pending_review") {
        setSuccess("Permit submitted for review. We will notify you once an admin approves it.")
      } else if (permit?.status === "rejected") {
        setError(permit.rejectionReason ?? "Auto-check failed. Fix the issues below and resubmit.")
      }
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading permit details…
      </div>
    )
  }

  if (!data?.kitchen) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Kitchen required</CardTitle>
          <CardDescription>
            Add your permitted kitchen address before submitting MEHKO permit verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-full">
            <Link href="/for-cooks/kitchen">Set up kitchen</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const permit = data.permit
  const canEdit = !permit || ["not_started", "rejected", "expired", "renewal_required"].includes(permit.status)
  const officialUrl =
    data.jurisdictions.find((j) => j.id === jurisdictionId)?.officialUrl ??
    data.inferredJurisdiction?.officialUrl

  return (
    <div className="space-y-6">
      {permit ? (
        <Card className="border-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Permit status
              </CardTitle>
              <Badge variant={statusBadgeVariant(permit.status)}>{permit.statusLabel}</Badge>
            </div>
            <CardDescription>
              {permit.status === "approved" && permit.expiresAt
                ? `Approved until ${new Date(permit.expiresAt).toLocaleDateString()}`
                : permit.status === "pending_review"
                  ? "An admin will review your uploaded proof shortly."
                  : permit.status === "rejected"
                    ? "Fix the issues below and resubmit."
                    : "Submit your MEHKO permit to go live on Munch."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {permit.renewalDue && permit.status !== "pending_review" ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Your permit expires soon or has expired. Upload an updated document and expiration
                  date to stay live.
                </p>
              </div>
            ) : null}
            {permit.rejectionReason ? (
              <p className="text-sm text-destructive">{permit.rejectionReason}</p>
            ) : null}
            {permit.autoCheckNotes && permit.status === "rejected" ? (
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {permit.autoCheckNotes
                  .filter((n) => !n.passed)
                  .map((n) => (
                    <li key={n.code}>{n.message}</li>
                  ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!data.inferredJurisdiction ? (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Jurisdiction not supported yet</CardTitle>
            <CardDescription>
              MEHKO permit verification is in beta for Long Beach kitchens. Update your kitchen
              address or check back when your city is added.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="font-serif text-xl">
              {canEdit ? "Submit permit verification" : "Permit on file"}
            </CardTitle>
            <CardDescription>
              {data.inferredJurisdiction
                ? `Detected jurisdiction: ${data.inferredJurisdiction.name}`
                : "Select your issuing jurisdiction."}
              {officialUrl ? (
                <>
                  {" "}
                  <a
                    href={officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                  >
                    Official permit info
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void submit(e)} className="space-y-4">
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {success ? <p className="text-sm text-primary">{success}</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select
                    value={jurisdictionId}
                    onValueChange={setJurisdictionId}
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="jurisdiction">
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.jurisdictions.map((j) => (
                        <SelectItem key={j.id} value={j.id}>
                          {j.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permit-number">Permit number</Label>
                  <Input
                    id="permit-number"
                    value={permitNumber}
                    onChange={(e) => setPermitNumber(e.target.value)}
                    disabled={!canEdit}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuing-agency">Issuing agency</Label>
                  <Input
                    id="issuing-agency"
                    value={issuingAgency}
                    onChange={(e) => setIssuingAgency(e.target.value)}
                    disabled={!canEdit}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issued-at">Issue date (optional)</Label>
                  <Input
                    id="issued-at"
                    type="date"
                    value={issuedAt}
                    onChange={(e) => setIssuedAt(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires-at">Expiration date</Label>
                  <Input
                    id="expires-at"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    disabled={!canEdit}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Permit document (PDF or image)</Label>
                  {documentUrl ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        View uploaded document
                      </a>
                      {canEdit ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadPending}
                          onClick={() => document.getElementById("permit-doc")?.click()}
                        >
                          Replace
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                  {canEdit ? (
                    <>
                      <Input
                        id="permit-doc"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className={documentUrl ? "sr-only" : undefined}
                        disabled={uploadPending}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void uploadDocument(file)
                        }}
                      />
                      {!documentUrl ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadPending}
                          onClick={() => document.getElementById("permit-doc")?.click()}
                        >
                          {uploadPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Upload document
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>

              {canEdit ? (
                <Button type="submit" disabled={pending || uploadPending || !documentUrl} className="rounded-full">
                  {pending ? "Submitting…" : permit ? "Resubmit for review" : "Submit for review"}
                </Button>
              ) : permit?.status === "pending_review" ? (
                <p className="text-sm text-muted-foreground">
                  Your submission is locked while under review.
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
