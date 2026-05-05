function stripOuterQuotes(s: string): string {
  const t = s.trim()
  if (t.length >= 2) {
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      return t.slice(1, -1).trim()
    }
  }
  return t
}

/** Parse `ADMIN_EMAILS` — commas, semicolons, or newlines; trims; strips common quote mistakes from Vercel UI. */
export function parseAdminAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? ""
  const cleaned = stripOuterQuotes(raw)
  if (!cleaned) return []
  return cleaned
    .split(/[,;\n\r]+/u)
    .map((e) => stripOuterQuotes(e).toLowerCase())
    .filter(Boolean)
}

/** Emails in `ADMIN_EMAILS` are promoted to ADMIN on successful login or signup (bootstrap). */
export function isEmailInAdminAllowlist(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return false
  return parseAdminAllowlist().includes(normalized)
}
