type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/** Best-effort in-memory rate limiter (per serverless isolate). */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSec: 0 }
  }

  if (existing.count >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    return { allowed: false, retryAfterSec }
  }

  existing.count += 1
  buckets.set(key, existing)
  return { allowed: true, retryAfterSec: 0 }
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return req.headers.get("x-real-ip")?.trim() || "unknown"
}
