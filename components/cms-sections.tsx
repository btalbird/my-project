import Image from "next/image"

import { Card } from "@/components/ui/card"

export type CmsBlock =
  | { id?: string; type: "hero"; heading?: string; subheading?: string; ctaText?: string; ctaHref?: string }
  | { id?: string; type: "image"; assetUrl?: string; alt?: string; caption?: string }
  | { id?: string; type: "richText"; markdown?: string }

function renderMarkdownLite(md: string) {
  const lines = md.split(/\r?\n/u)
  const out: Array<{ type: "h2" | "p"; text: string }> = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith("## ")) out.push({ type: "h2", text: line.slice(3) })
    else out.push({ type: "p", text: line })
  }
  return out
}

type Props = {
  blocks: CmsBlock[]
  /** When true, omit per-block keys that collide with outer layout */
  className?: string
}

export function CmsSections({ blocks, className }: Props) {
  return (
    <div className={className}>
      {blocks.map((b, idx) => {
        const key = b.id ?? `${b.type}-${idx}`
        if (b.type === "hero") {
          return (
            <Card key={key} className="border-2 p-6 sm:p-10">
              <div className="space-y-3">
                <h2 className="font-serif text-3xl font-bold tracking-tight">{b.heading ?? "Headline"}</h2>
                {b.subheading ? <p className="max-w-2xl text-muted-foreground">{b.subheading}</p> : null}
                {b.ctaText && b.ctaHref ? (
                  <a
                    href={b.ctaHref}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  >
                    {b.ctaText}
                  </a>
                ) : null}
              </div>
            </Card>
          )
        }

        if (b.type === "image") {
          const url = b.assetUrl?.trim() ?? ""
          if (!url) return null
          return (
            <div key={key} className="space-y-3">
              <div className="overflow-hidden rounded-xl border">
                <Image src={url} alt={b.alt ?? ""} width={1200} height={675} className="h-auto w-full" />
              </div>
              {b.caption ? <p className="text-sm text-muted-foreground">{b.caption}</p> : null}
            </div>
          )
        }

        if (b.type === "richText") {
          const md = b.markdown ?? ""
          const chunks = renderMarkdownLite(md)
          return (
            <Card key={key} className="border-2 p-6">
              <div className="space-y-3">
                {chunks.map((c, i) =>
                  c.type === "h2" ? (
                    <h2 key={i} className="font-serif text-2xl font-bold tracking-tight">
                      {c.text}
                    </h2>
                  ) : (
                    <p key={i} className="text-muted-foreground">
                      {c.text}
                    </p>
                  ),
                )}
              </div>
            </Card>
          )
        }

        return null
      })}
    </div>
  )
}
