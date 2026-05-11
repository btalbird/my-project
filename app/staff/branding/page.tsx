import { StaffBrandingEditor } from "@/components/staff-branding-editor"
import { getSessionUser, isAdminRole } from "@/lib/auth-user"

export default async function StaffBrandingPage() {
  const user = await getSessionUser()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Branding</h1>
        <p className="mt-1 text-muted-foreground">
          Colors, typography, and header identity. Save draft, then an admin publishes to the live site.
        </p>
      </div>
      <StaffBrandingEditor canPublish={!!user && isAdminRole(user.role)} />
    </div>
  )
}
