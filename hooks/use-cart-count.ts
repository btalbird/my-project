"use client"

import { useEffect, useState } from "react"

import { CART_UPDATED_EVENT, getCartItemCount } from "@/lib/cart-storage"

export function useCartCount(userId: string | null | undefined) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!userId) {
      setCount(0)
      return
    }

    const update = () => setCount(getCartItemCount(userId))
    update()
    window.addEventListener(CART_UPDATED_EVENT, update)
    return () => window.removeEventListener(CART_UPDATED_EVENT, update)
  }, [userId])

  return count
}
