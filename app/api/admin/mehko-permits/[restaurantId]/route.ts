import { NextResponse } from "next/server"
import { z } from "zod"

import { getSessionUser, isAdminRole } from "@/lib/auth-user"
import { prisma } from "@/lib/db"
import { approveMehkoPermit, rejectMehkoPermit } from "@/lib/mehko-permit-maintenance"
import { getMehkoJurisdiction } from "@/lib/mehko-jurisdictions"
import { permitStatusLabel } from "@/lib/mehko-permit-verify"

const bodySchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  const admin = await getSessionUser()
  if (!admin || !isAdminRole(admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { restaurantId: restaurantIdRaw } = await params
  const restaurantId = Number.parseInt(restaurantIdRaw, 10)
  if (!Number.isFinite(restaurantId)) {
    return NextResponse.json({ error: "Invalid restaurant id" }, { status: 400 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const existing = await prisma.kitchenMehkoPermit.findUnique({
    where: { restaurantId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Permit not found" }, { status: 404 })
  }

  if (body.action === "approve") {
    if (existing.status !== "pending_review") {
      return NextResponse.json({ error: "Only pending permits can be approved." }, { status: 400 })
    }
    if (!existing.autoCheckPassed) {
      return NextResponse.json({ error: "Auto-check did not pass for this permit." }, { status: 400 })
    }
    const permit = await approveMehkoPermit(restaurantId, admin.id)
    const jurisdiction = getMehkoJurisdiction(permit.jurisdictionId)
    return NextResponse.json({
      permit: {
        restaurantId: permit.restaurantId,
        status: permit.status,
        statusLabel: permitStatusLabel(permit.status),
        jurisdictionName: jurisdiction?.name ?? permit.jurisdictionId,
        expiresAt: permit.expiresAt?.toISOString() ?? null,
      },
    })
  }

  const reason = body.rejectionReason?.trim()
  if (!reason) {
    return NextResponse.json({ error: "Rejection reason is required." }, { status: 400 })
  }

  const permit = await rejectMehkoPermit(restaurantId, admin.id, reason)
  const jurisdiction = getMehkoJurisdiction(permit.jurisdictionId)
  return NextResponse.json({
    permit: {
      restaurantId: permit.restaurantId,
      status: permit.status,
      statusLabel: permitStatusLabel(permit.status),
      jurisdictionName: jurisdiction?.name ?? permit.jurisdictionId,
      rejectionReason: permit.rejectionReason,
    },
  })
}
