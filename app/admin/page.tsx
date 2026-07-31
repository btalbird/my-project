import { getSessionUser } from "@/lib/auth-user"
import { prisma } from "@/lib/db"
import { AdminUsersTable } from "@/components/admin-users-table"
import { AdminMehkoPermitsTable } from "@/components/admin-mehko-permits-table"

export default async function AdminPage() {
  const me = await getSessionUser()
  if (!me) return null

  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: { id: true, email: true, name: true, role: true },
  })

  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, name: true, ownerId: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Admin</h1>
        <p className="mt-1 text-muted-foreground">Signed in as {me.email}</p>
      </div>
      <AdminMehkoPermitsTable />
      <AdminUsersTable users={users} currentUserId={me.id} restaurants={restaurants} />
    </div>
  )
}
