import { notFound } from "next/navigation"

import { CmsSections, type CmsBlock } from "@/components/cms-sections"
import { prisma } from "@/lib/db"

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const page = await prisma.page.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedVersionId: true,
      publishedVersion: {
        select: { id: true, version: true, sections: true },
      },
    },
  })

  if (!page || page.status !== "PUBLISHED" || !page.publishedVersionId || !page.publishedVersion) notFound()

  const blocksRaw = page.publishedVersion.sections
  const blocks: CmsBlock[] = Array.isArray(blocksRaw) ? (blocksRaw as CmsBlock[]) : []

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="font-serif text-4xl font-bold tracking-tight">{page.title}</h1>
        </header>

        <CmsSections blocks={blocks} className="space-y-8" />
      </div>
    </main>
  )
}
