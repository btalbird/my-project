import Link from "next/link"

import { LEGAL_LAST_UPDATED, legalSections } from "@/lib/legal-content"

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated {LEGAL_LAST_UPDATED}</p>
      <div className="mt-8 space-y-8">
        {legalSections.cookies.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
        Munch uses Vercel Analytics in production to understand traffic in aggregate. By continuing to use the site you
        consent to essential cookies required for sign-in and checkout.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/legal/privacy" className="text-primary underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </main>
  )
}
