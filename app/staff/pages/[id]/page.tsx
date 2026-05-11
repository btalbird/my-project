import { notFound } from "next/navigation"

import { StaffPageEditor } from "@/components/staff-page-editor"
import { getSessionUser, isAdminRole } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

export default async function StaffPageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionUser()

  const page = await prisma.page.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, status: true, draftSections: true, publishedVersionId: true },
  })
  if (!page) notFound()

  return (
    <div className="space-y-6">
      <StaffPageEditor page={page} canPublish={!!user && isAdminRole(user.role)} />
    </div>
  )
}

