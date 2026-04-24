import { redirect } from "next/navigation"

/** @deprecated Use /community/food-donation — kept so old links still resolve. */
export default function BlogPage() {
  redirect("/community/food-donation")
}
