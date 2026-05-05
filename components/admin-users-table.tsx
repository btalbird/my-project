"use client"

import type { UserRole } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type AdminUserRow = {
  id: string
  email: string
  name: string | null
  role: UserRole
}

const roles: UserRole[] = ["MEMBER", "STAFF", "ADMIN"]

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[]
  currentUserId: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function setRole(userId: string, role: UserRole) {
    setError(null)
    setPendingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Update failed")
        return
      }
      router.refresh()
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Users</CardTitle>
        <CardDescription>Assign MEMBER (default), STAFF (content), or ADMIN (full access).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[200px]">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.email}
                    {u.id === currentUserId ? (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.name ?? "—"}</TableCell>
                  <TableCell>
                    <Label htmlFor={`role-${u.id}`} className="sr-only">
                      Role for {u.email}
                    </Label>
                    <Select
                      value={u.role}
                      disabled={pendingId === u.id}
                      onValueChange={(value) => void setRole(u.id, value as UserRole)}
                    >
                      <SelectTrigger id={`role-${u.id}`} size="sm" className="w-full min-w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
