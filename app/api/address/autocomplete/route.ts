import { NextResponse } from "next/server"

import { searchAddressSuggestions } from "@/lib/address-suggestion"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get("q")?.trim() ?? ""

  if (q.length < 3) {
    return NextResponse.json({ suggestions: [] })
  }

  if (q.length > 200) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 })
  }

  try {
    const suggestions = await searchAddressSuggestions(q)
    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
