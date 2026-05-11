import Link from "next/link"

import { StaffPagesCreateButton } from "@/components/staff-pages-create-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { prisma } from "@/lib/db"

export default async function StaffPagesIndexPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, status: true, updatedAt: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Pages</h1>
          <p className="mt-1 text-muted-foreground">Draft, preview, and publish site content.</p>
        </div>
        <StaffPagesCreateButton />
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">All pages</CardTitle>
          <CardDescription>Published pages are public; drafts stay internal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No pages yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell className="text-muted-foreground">/{p.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{p.status}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/staff/pages/${p.id}`} className="text-primary underline-offset-4 hover:underline">
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

