import type { KitchenMehkoPermit, MehkoPermitStatus, Restaurant } from "@prisma/client"

import {
  getMehkoJurisdiction,
  jurisdictionMatchesKitchen,
  type KitchenAddressForJurisdiction,
} from "@/lib/mehko-jurisdictions"

export type MehkoAutoCheckNote = {
  code: string
  message: string
  passed: boolean
}

export type MehkoAutoCheckResult = {
  passed: boolean
  notes: MehkoAutoCheckNote[]
}

type PermitInput = Pick<
  KitchenMehkoPermit,
  | "jurisdictionId"
  | "permitNumber"
  | "issuingAgency"
  | "issuedAt"
  | "expiresAt"
  | "documentUrl"
>

type KitchenInput = Pick<
  Restaurant,
  "addressCity" | "addressState" | "addressPostalCode"
>

export function isPermitLive(
  permit: Pick<KitchenMehkoPermit, "status" | "expiresAt"> | null | undefined,
  now = new Date(),
): boolean {
  if (!permit || permit.status !== "approved") return false
  if (!permit.expiresAt) return false
  return permit.expiresAt > now
}

export function isPermitRenewalDue(
  permit: Pick<KitchenMehkoPermit, "status" | "expiresAt" | "jurisdictionId"> | null | undefined,
  now = new Date(),
): boolean {
  if (!permit?.expiresAt) return false
  if (permit.status === "expired" || permit.status === "renewal_required") return true
  const jurisdiction = getMehkoJurisdiction(permit.jurisdictionId)
  const reminderDays = jurisdiction?.renewalReminderDays ?? 30
  const reminderDate = new Date(permit.expiresAt)
  reminderDate.setDate(reminderDate.getDate() - reminderDays)
  return now >= reminderDate
}

export function runMehkoPermitAutoCheck(
  permit: PermitInput,
  kitchen: KitchenInput,
  now = new Date(),
): MehkoAutoCheckResult {
  const notes: MehkoAutoCheckNote[] = []

  const jurisdiction = getMehkoJurisdiction(permit.jurisdictionId)
  if (!jurisdiction) {
    notes.push({
      code: "jurisdiction_unknown",
      message: "Selected jurisdiction is not supported.",
      passed: false,
    })
  } else if (!jurisdiction.enabled) {
    notes.push({
      code: "jurisdiction_disabled",
      message: `${jurisdiction.name} verification is not open yet.`,
      passed: false,
    })
  } else {
    notes.push({
      code: "jurisdiction_enabled",
      message: `Jurisdiction: ${jurisdiction.name}`,
      passed: true,
    })
  }

  const address: KitchenAddressForJurisdiction = {
    addressCity: kitchen.addressCity,
    addressState: kitchen.addressState,
    addressPostalCode: kitchen.addressPostalCode,
  }

  const state = kitchen.addressState?.trim().toUpperCase()
  const isCalifornia =
    state === "CA" || kitchen.addressState?.trim().toLowerCase() === "california"
  notes.push({
    code: "kitchen_in_california",
    message: isCalifornia
      ? "Kitchen address is in California."
      : "Kitchen address must be in California.",
    passed: isCalifornia,
  })

  if (jurisdiction) {
    const matches = jurisdictionMatchesKitchen(permit.jurisdictionId, address)
    notes.push({
      code: "jurisdiction_address_match",
      message: matches
        ? `Kitchen address matches ${jurisdiction.name}.`
        : `Kitchen address does not match ${jurisdiction.name}. Update your kitchen address or jurisdiction.`,
      passed: matches,
    })
  }

  const permitNumber = permit.permitNumber?.trim() ?? ""
  notes.push({
    code: "permit_number_present",
    message: permitNumber ? "Permit number provided." : "Permit number is required.",
    passed: permitNumber.length > 0,
  })

  if (jurisdiction?.permitNumberPattern && permitNumber) {
    const patternOk = jurisdiction.permitNumberPattern.test(permitNumber)
    notes.push({
      code: "permit_number_format",
      message: patternOk
        ? "Permit number format looks valid."
        : "Permit number format does not match this jurisdiction.",
      passed: patternOk,
    })
  }

  const issuingAgency = permit.issuingAgency?.trim() ?? ""
  notes.push({
    code: "issuing_agency_present",
    message: issuingAgency ? "Issuing agency provided." : "Issuing agency is required.",
    passed: issuingAgency.length > 0,
  })

  notes.push({
    code: "document_present",
    message: permit.documentUrl
      ? "Permit document uploaded."
      : "Upload a photo or PDF of your permit.",
    passed: Boolean(permit.documentUrl),
  })

  if (!permit.expiresAt) {
    notes.push({
      code: "expiration_present",
      message: "Permit expiration date is required.",
      passed: false,
    })
  } else {
    const notExpired = permit.expiresAt > now
    notes.push({
      code: "expiration_future",
      message: notExpired
        ? "Permit expiration date is in the future."
        : "Permit expiration date must be in the future.",
      passed: notExpired,
    })
  }

  if (permit.issuedAt && permit.expiresAt && permit.issuedAt > permit.expiresAt) {
    notes.push({
      code: "issued_before_expiration",
      message: "Issue date must be before expiration date.",
      passed: false,
    })
  }

  const passed = notes.every((n) => n.passed)
  return { passed, notes }
}

export function permitStatusLabel(status: MehkoPermitStatus): string {
  switch (status) {
    case "not_started":
      return "Not submitted"
    case "pending_review":
      return "Pending review"
    case "approved":
      return "Approved"
    case "rejected":
      return "Rejected"
    case "expired":
      return "Expired"
    case "renewal_required":
      return "Renewal required"
    default:
      return status
  }
}
