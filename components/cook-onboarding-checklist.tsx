"use client"

import { CheckCircle2, Circle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
  connectReady: boolean
  hasConnectAccount: boolean
  subscribed: boolean
  hasKitchen: boolean
  permitApproved: boolean
  permitStatus?: string | null
  permitExpiresAt?: string | null
  permitRenewalDue?: boolean
  hasMenuItems: boolean
  hasPaidOrder: boolean
  listingFeeLabel?: string | null
}

function Step({
  done,
  label,
  detail,
}: {
  done: boolean
  label: string
  detail?: string
}) {
  return (
    <li className="flex gap-3">
      {done ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      ) : (
        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      )}
      <div>
        <p className={cn("text-sm font-medium", done ? "text-foreground" : "text-muted-foreground")}>
          {label}
        </p>
        {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
      </div>
    </li>
  )
}

export function CookOnboardingChecklist({
  connectReady,
  hasConnectAccount,
  subscribed,
  hasKitchen,
  permitApproved,
  permitStatus,
  permitExpiresAt,
  permitRenewalDue,
  hasMenuItems,
  hasPaidOrder,
  listingFeeLabel,
}: Props) {
  const steps = [
    {
      done: connectReady,
      label: "Connect Stripe payouts",
      detail: connectReady
        ? "Ready to receive order payments"
        : hasConnectAccount
          ? "Finish Express onboarding"
          : "Link your bank account",
    },
    {
      done: subscribed,
      label: "Subscribe to kitchen listing",
      detail: subscribed
        ? "Listing active"
        : listingFeeLabel
          ? `${listingFeeLabel} billed monthly`
          : "Monthly listing fee",
    },
    {
      done: hasKitchen,
      label: "Set up your kitchen",
      detail: hasKitchen ? "Address and profile saved" : "Add permitted kitchen address",
    },
    {
      done: permitApproved && !permitRenewalDue,
      label: "Verify MEHKO permit",
      detail: permitApproved
        ? permitRenewalDue
          ? permitExpiresAt
            ? `Expires ${new Date(permitExpiresAt).toLocaleDateString()} — renew soon`
            : "Renewal required"
          : permitExpiresAt
            ? `Approved until ${new Date(permitExpiresAt).toLocaleDateString()}`
            : "Permit approved"
        : permitStatus === "pending_review"
          ? "Pending admin review"
          : permitStatus === "rejected"
            ? "Rejected — update and resubmit"
            : permitStatus === "expired"
              ? "Expired — upload renewed permit"
              : "Submit permit proof in the Permit tab",
    },
    {
      done: hasMenuItems,
      label: "Add menu items",
      detail: hasMenuItems ? "Customers can order from your menu" : "At least one dish with price",
    },
    {
      done: hasPaidOrder,
      label: "Receive your first order",
      detail: hasPaidOrder ? "You're live on Munch" : "Orders appear in the Orders tab",
    },
  ]

  const completed = steps.filter((s) => s.done).length

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Onboarding checklist</CardTitle>
        <CardDescription>
          {completed} of {steps.length} complete — finish these steps to go live.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">{steps.map((step) => <Step key={step.label} {...step} />)}</ul>
      </CardContent>
    </Card>
  )
}
