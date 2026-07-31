import { NextResponse } from "next/server"

import { getCookListingFee } from "@/lib/cook-listing-fee"

export async function GET() {
  const fee = await getCookListingFee()
  return NextResponse.json({ fee })
}
