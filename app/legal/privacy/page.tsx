import Link from "next/link"

import { LEGAL_LAST_UPDATED, legalSections } from "@/lib/legal-content"

function LegalPage({
  title,
  sections,
}: {
  title: string
  sections: { title: string; body: string }[]
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated {LEGAL_LAST_UPDATED}</p>
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        See also{" "}
        <Link href="/legal/terms" className="text-primary underline-offset-4 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/cookies" className="text-primary underline-offset-4 hover:underline">
          Cookies
        </Link>
        .
      </p>
    </main>
  )
}

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" sections={legalSections.privacy} />
}
