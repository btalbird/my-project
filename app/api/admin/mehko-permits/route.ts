import { NextResponse } from "next/server"

import { getSessionUser, isAdminRole } from "@/lib/auth-user"
import { prisma } from "@/lib/db"
import { getMehkoJurisdiction } from "@/lib/mehko-jurisdictions"
import { refreshExpiredMehkoPermits } from "@/lib/mehko-permit-maintenance"
import { permitStatusLabel } from "@/lib/mehko-permit-verify"

export async function GET() {
  const admin = await getSessionUser()
  if (!admin || !isAdminRole(admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await refreshExpiredMehkoPermits()

  const permits = await prisma.kitchenMehkoPermit.findMany({
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          addressCity: true,
          addressState: true,
          owner: { select: { id: true, email: true, name: true } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
  })

  return NextResponse.json({
    permits: permits.map((permit) => {
      const jurisdiction = getMehkoJurisdiction(permit.jurisdictionId)
      return {
        restaurantId: permit.restaurantId,
        kitchenName: permit.restaurant.name,
        kitchenCity: permit.restaurant.addressCity,
        kitchenState: permit.restaurant.addressState,
        cookEmail: permit.restaurant.owner?.email ?? null,
        cookName: permit.restaurant.owner?.name ?? null,
        jurisdictionId: permit.jurisdictionId,
        jurisdictionName: jurisdiction?.name ?? permit.jurisdictionId,
        permitNumber: permit.permitNumber,
        issuingAgency: permit.issuingAgency,
        expiresAt: permit.expiresAt?.toISOString() ?? null,
        documentUrl: permit.documentUrl,
        status: permit.status,
        statusLabel: permitStatusLabel(permit.status),
        autoCheckPassed: permit.autoCheckPassed,
        autoCheckNotes: permit.autoCheckNotes,
        rejectionReason: permit.rejectionReason,
        submittedAt: permit.submittedAt?.toISOString() ?? null,
        reviewedAt: permit.reviewedAt?.toISOString() ?? null,
      }
    }),
  })
}
