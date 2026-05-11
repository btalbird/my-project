import Link from "next/link"

import { StaffDesignsCreateButton } from "@/components/staff-designs-create-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { prisma } from "@/lib/db"

export default async function StaffDesignsPage() {
  const designs = await prisma.designDocument.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, status: true, updatedAt: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Designs</h1>
          <p className="mt-1 text-muted-foreground">Create banners and graphics for the storefront.</p>
        </div>
        <StaffDesignsCreateButton />
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">All designs</CardTitle>
          <CardDescription>Drafts are editable; published exports are immutable.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                      No designs yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  designs.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="text-muted-foreground">{d.status}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/staff/designs/${d.id}`} className="text-primary underline-offset-4 hover:underline">
                          Open
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

