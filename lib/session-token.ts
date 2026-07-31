const SESSION_VERSION = "v1"

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim()
  if (secret) return secret
  if (process.env.NODE_ENV !== "production") {
    return "dev-insecure-session-secret-change-me"
  }
  throw new Error("SESSION_SECRET is not configured")
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (str.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i]! ^ b[i]!
  }
  return result === 0
}

async function signUserId(userId: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${SESSION_VERSION}:${userId}`))
  return base64UrlEncode(new Uint8Array(signature))
}

/** Signed session cookie value: `v1.{userId}.{signature}` */
export async function createSessionToken(userId: string): Promise<string> {
  const sig = await signUserId(userId, getSessionSecret())
  return `${SESSION_VERSION}.${userId}.${sig}`
}

/** Returns user id when the cookie is valid (signed or legacy raw cuid). */
export async function parseSessionToken(value: string): Promise<string | null> {
  if (!value) return null

  if (!value.includes(".")) {
    if (value.length >= 20 && value.startsWith("c")) return value
    return null
  }

  const parts = value.split(".")
  if (parts.length !== 3 || parts[0] !== SESSION_VERSION) return null

  const userId = parts[1]
  const sig = parts[2]
  if (!userId || !sig) return null

  let secret: string
  try {
    secret = getSessionSecret()
  } catch {
    return null
  }

  const expected = await signUserId(userId, secret)
  try {
    const a = base64UrlDecode(sig)
    const b = base64UrlDecode(expected)
    if (!timingSafeEqual(a, b)) return null
  } catch {
    return null
  }

  return userId
}
