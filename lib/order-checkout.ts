import { z } from "zod"

export const CheckoutLineSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.string().min(1),
})

export const CheckoutBodySchema = z.object({
  restaurant: z.string().min(1),
  lines: z.array(CheckoutLineSchema).min(1),
  total: z.string().min(1),
  deliveryWindow: z.string().optional(),
})

export type CheckoutLine = z.infer<typeof CheckoutLineSchema>
export type CheckoutBody = z.infer<typeof CheckoutBodySchema>
