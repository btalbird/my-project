import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import {
  getEnabledMehkoJurisdictions,
  getMehkoJurisdiction,
  inferMehkoJurisdiction,
} from "@/lib/mehko-jurisdictions"
import { refreshMehkoPermitForRestaurant } from "@/lib/mehko-permit-maintenance"
import {
  isPermitLive,
  isPermitRenewalDue,
  permitStatusLabel,
  runMehkoPermitAutoCheck,
} from "@/lib/mehko-permit-verify"

function serializePermit(
  permit: NonNullable<Awaited<ReturnType<typeof prisma.kitchenMehkoPermit.findUnique>>>,
) {
  const jurisdiction = getMehkoJurisdiction(permit.jurisdictionId)
  return {
    id: permit.id,
    restaurantId: permit.restaurantId,
    jurisdictionId: permit.jurisdictionId,
    jurisdictionName: jurisdiction?.name ?? permit.jurisdictionId,
    permitNumber: permit.permitNumber,
    issuingAgency: permit.issuingAgency,
    issuedAt: permit.issuedAt?.toISOString() ?? null,
    expiresAt: permit.expiresAt?.toISOString() ?? null,
    documentUrl: permit.documentUrl,
    status: permit.status,
    statusLabel: permitStatusLabel(permit.status),
    autoCheckPassed: permit.autoCheckPassed,
    autoCheckNotes: permit.autoCheckNotes,
    rejectionReason: permit.rejectionReason,
    submittedAt: permit.submittedAt?.toISOString() ?? null,
    reviewedAt: permit.reviewedAt?.toISOString() ?? null,
    isLive: isPermitLive(permit),
    renewalDue: isPermitRenewalDue(permit),
    officialUrl: jurisdiction?.officialUrl ?? null,
  }
}

export async function GET() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const kitchen = await prisma.restaurant.findFirst({
    where: auth.user.role === "ADMIN" ? {} : { ownerId: auth.user.id },
    orderBy: { id: "asc" },
    select: {
      id: true,
      addressCity: true,
      addressState: true,
      addressPostalCode: true,
      mehkoPermit: true,
    },
  })

  if (!kitchen) {
    return NextResponse.json({
      kitchen: null,
      permit: null,
      inferredJurisdiction: null,
      jurisdictions: getEnabledMehkoJurisdictions().map((j) => ({
        id: j.id,
        name: j.name,
        issuingAgencyDefault: j.issuingAgencyDefault,
        officialUrl: j.officialUrl,
      })),
    })
  }

  await refreshMehkoPermitForRestaurant(kitchen.id)

  const permit = await prisma.kitchenMehkoPermit.findUnique({
    where: { restaurantId: kitchen.id },
  })

  const inferred = inferMehkoJurisdiction(kitchen)

  return NextResponse.json({
    kitchen: {
      id: kitchen.id,
      addressCity: kitchen.addressCity,
      addressState: kitchen.addressState,
      addressPostalCode: kitchen.addressPostalCode,
    },
    permit: permit ? serializePermit(permit) : null,
    inferredJurisdiction: inferred
      ? {
          id: inferred.id,
          name: inferred.name,
          issuingAgencyDefault: inferred.issuingAgencyDefault,
          officialUrl: inferred.officialUrl,
        }
      : null,
    jurisdictions: getEnabledMehkoJurisdictions().map((j) => ({
      id: j.id,
      name: j.name,
      issuingAgencyDefault: j.issuingAgencyDefault,
      officialUrl: j.officialUrl,
    })),
  })
}

export async function PUT(req: Request) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const kitchen = await prisma.restaurant.findFirst({
    where: auth.user.role === "ADMIN" ? {} : { ownerId: auth.user.id },
    orderBy: { id: "asc" },
    select: {
      id: true,
      addressCity: true,
      addressState: true,
      addressPostalCode: true,
      mehkoPermit: true,
    },
  })

  if (!kitchen) {
    return NextResponse.json({ error: "Create your kitchen before submitting a permit." }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const jurisdictionId = String(body.jurisdictionId ?? "").trim()
  const permitNumber = String(body.permitNumber ?? "").trim()
  const issuingAgency = String(body.issuingAgency ?? "").trim()
  const issuedAtRaw = body.issuedAt != null ? String(body.issuedAt) : null
  const expiresAtRaw = body.expiresAt != null ? String(body.expiresAt) : null

  if (!jurisdictionId) {
    return NextResponse.json({ error: "Jurisdiction is required." }, { status: 400 })
  }

  const jurisdiction = getMehkoJurisdiction(jurisdictionId)
  if (!jurisdiction?.enabled) {
    return NextResponse.json({ error: "That jurisdiction is not available yet." }, { status: 400 })
  }

  const issuedAt = issuedAtRaw ? new Date(issuedAtRaw) : null
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null
  if (expiresAtRaw && (!expiresAt || Number.isNaN(expiresAt.getTime()))) {
    return NextResponse.json({ error: "Invalid expiration date." }, { status: 400 })
  }
  if (issuedAtRaw && issuedAt && Number.isNaN(issuedAt.getTime())) {
    return NextResponse.json({ error: "Invalid issue date." }, { status: 400 })
  }

  const existingDocumentUrl = kitchen.mehkoPermit?.documentUrl ?? null
  const documentUrl =
    body.documentUrl !== undefined ? String(body.documentUrl).trim() || null : existingDocumentUrl

  const permitInput = {
    jurisdictionId,
    permitNumber,
    issuingAgency: issuingAgency || jurisdiction.issuingAgencyDefault,
    issuedAt,
    expiresAt,
    documentUrl,
  }

  const autoCheck = runMehkoPermitAutoCheck(permitInput, kitchen)
  const now = new Date()
  const nextStatus = autoCheck.passed ? "pending_review" : "rejected"

  const permit = await prisma.kitchenMehkoPermit.upsert({
    where: { restaurantId: kitchen.id },
    create: {
      restaurantId: kitchen.id,
      ...permitInput,
      status: nextStatus,
      autoCheckPassed: autoCheck.passed,
      autoCheckNotes: autoCheck.notes,
      submittedAt: now,
      lastCheckedAt: now,
      rejectionReason: autoCheck.passed
        ? null
        : autoCheck.notes.filter((n) => !n.passed).map((n) => n.message).join(" "),
    },
    update: {
      ...permitInput,
      status: nextStatus,
      autoCheckPassed: autoCheck.passed,
      autoCheckNotes: autoCheck.notes,
      submittedAt: now,
      lastCheckedAt: now,
      reviewedAt: null,
      reviewedById: null,
      rejectionReason: autoCheck.passed
        ? null
        : autoCheck.notes.filter((n) => !n.passed).map((n) => n.message).join(" "),
    },
  })

  if (!autoCheck.passed) {
    await prisma.restaurant.update({
      where: { id: kitchen.id },
      data: { isPublished: false },
    })
  }

  return NextResponse.json({
    permit: serializePermit(permit),
    autoCheck,
  })
}
