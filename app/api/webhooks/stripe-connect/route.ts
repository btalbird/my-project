import { prisma } from "@/lib/db"
import {
  retrieveV2ConnectedAccount,
  v2AccountToConnectStatus,
} from "@/lib/stripe-connect-v2"
import { syncCookConnectByV2AccountId } from "@/lib/cook-connect"
import { getConnectWebhookSecret, getStripe } from "@/lib/stripe"

export const runtime = "nodejs"

type ThinNotification = {
  id: string
  type?: string
  fetchEvent?: () => Promise<{ type?: string; data?: unknown }>
}

/**
 * Connect thin events (V2 account requirements / capability updates).
 *
 * Stripe Dashboard setup:
 * - Events from: Connected accounts
 * - Payload style: Thin
 * - Events: v2.core.account[requirements].updated,
 *   v2.core.account[configuration.merchant].capability_status_updated,
 *   v2.core.account[configuration.customer].capability_status_updated
 *
 * Local listener:
 * stripe listen --thin-events 'v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' --forward-thin-to http://localhost:3002/api/webhooks/stripe-connect
 */
export async function POST(req: Request) {
  let webhookSecret: string
  try {
    webhookSecret = getConnectWebhookSecret()
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Connect webhook not configured" },
      { status: 500 },
    )
  }

  const stripe = getStripe()
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 })
  }

  let notification: ThinNotification
  try {
    notification = stripe.parseEventNotification(body, signature, webhookSecret) as ThinNotification
  } catch {
    return Response.json({ error: "Invalid thin event signature" }, { status: 400 })
  }

  try {
    await prisma.stripeWebhookEvent.create({ data: { id: notification.id } })
  } catch {
    return Response.json({ received: true, duplicate: true })
  }

  const event = notification.fetchEvent ? await notification.fetchEvent() : null
  const eventType = event?.type ?? notification.type ?? ""

  switch (eventType) {
    case "v2.core.account[requirements].updated":
    case "v2.core.account[configuration.merchant].capability_status_updated":
    case "v2.core.account[configuration.customer].capability_status_updated":
    case "v2.core.account.updated": {
      const accountId = extractAccountId(event?.data)
      if (!accountId) break

      const account = await retrieveV2ConnectedAccount(stripe, accountId)
      const status = v2AccountToConnectStatus(account)
      await syncCookConnectByV2AccountId(accountId, status)
      break
    }
    default:
      break
  }

  return Response.json({ received: true, type: eventType })
}

function extractAccountId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null
  const record = data as Record<string, unknown>
  if (typeof record.id === "string" && record.id.startsWith("acct_")) return record.id
  if (typeof record.account === "string") return record.account
  return null
}
