import { notFound } from "next/navigation"

import { StaffDesignEditor } from "@/components/staff-design-editor"
import { getSessionUser, isAdminRole } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

export default async function StaffDesignEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionUser()

  const design = await prisma.designDocument.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      draftJson: true,
      publishedAssetId: true,
    },
  })
  if (!design) notFound()

  return (
    <div className="space-y-6">
      <StaffDesignEditor design={design} canPublish={!!user && isAdminRole(user.role)} />
    </div>
  )
}

