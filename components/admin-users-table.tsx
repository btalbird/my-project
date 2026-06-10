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

export type AdminRestaurantOption = {
  id: number
  name: string
  ownerId: string | null
}

const roles: UserRole[] = ["MEMBER", "STAFF", "COOK", "ADMIN"]

const UNASSIGNED = "__none__"

function kitchenForUser(userId: string, restaurants: AdminRestaurantOption[]): number | null {
  const owned = restaurants.find((r) => r.ownerId === userId)
  return owned?.id ?? null
}

export function AdminUsersTable({
  users,
  currentUserId,
  restaurants,
}: {
  users: AdminUserRow[]
  currentUserId: string
  restaurants: AdminRestaurantOption[]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [kitchenByUser, setKitchenByUser] = useState<Record<string, number | null>>({})

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

  async function setKitchen(userId: string, restaurantId: number | null) {
    setError(null)
    setPendingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/kitchen`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Kitchen assignment failed")
        return
      }
      setKitchenByUser((prev) => ({ ...prev, [userId]: restaurantId }))
      router.refresh()
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Users</CardTitle>
        <CardDescription>
          Assign MEMBER (default), STAFF (content), COOK (kitchen portal), or ADMIN (full access).
          Cooks need a kitchen assigned before orders appear on their dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[180px]">Role</TableHead>
                <TableHead className="min-w-[220px]">Kitchen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const showKitchen = u.role === "COOK" || u.role === "ADMIN"
                const kitchenValue =
                  u.id in kitchenByUser ? kitchenByUser[u.id] : kitchenForUser(u.id, restaurants)
                return (
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
                    <TableCell>
                      {showKitchen ? (
                        <>
                          <Label htmlFor={`kitchen-${u.id}`} className="sr-only">
                            Kitchen for {u.email}
                          </Label>
                          <Select
                            value={
                              kitchenValue != null ? String(kitchenValue) : UNASSIGNED
                            }
                            disabled={pendingId === u.id}
                            onValueChange={(value) =>
                              void setKitchen(
                                u.id,
                                value === UNASSIGNED ? null : parseInt(value, 10),
                              )
                            }
                          >
                            <SelectTrigger id={`kitchen-${u.id}`} size="sm" className="w-full min-w-[180px]">
                              <SelectValue placeholder="Assign kitchen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                              {restaurants.map((r) => (
                                <SelectItem key={r.id} value={String(r.id)}>
                                  {r.name}
                                  {r.ownerId && r.ownerId !== u.id ? " (assigned)" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
