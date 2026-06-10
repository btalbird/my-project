import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import { requireCookUser } from "@/lib/cook-auth"
import { geocodeAddress } from "@/lib/geocode-nominatim"
import { prisma } from "@/lib/db"

const kitchenSelect = {
  id: true,
  name: true,
  image: true,
  cuisine: true,
  rating: true,
  deliveryTime: true,
  deliveryFee: true,
  promo: true,
  latitude: true,
  longitude: true,
  addressLine1: true,
  addressLine2: true,
  addressCity: true,
  addressState: true,
  addressPostalCode: true,
  isPublished: true,
  categoryId: true,
  category: { select: { id: true, name: true, slug: true } },
} as const

function parseKitchenBody(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim()
  const cuisine = String(body.cuisine ?? "").trim()
  const addressLine1 = String(body.addressLine1 ?? body.line1 ?? "").trim()
  const addressLine2 = body.addressLine2 !== undefined ? String(body.addressLine2).trim() : ""
  const addressCity = String(body.addressCity ?? body.city ?? "").trim()
  const addressState = String(body.addressState ?? body.state ?? "").trim()
  const addressPostalCode = String(body.addressPostalCode ?? body.postalCode ?? "").trim()
  const categoryId = body.categoryId != null ? Number(body.categoryId) : null
  const image = body.image !== undefined ? String(body.image).trim() : "🍽️"
  const deliveryTime = body.deliveryTime !== undefined ? String(body.deliveryTime).trim() : "30–45 min"
  const deliveryFee = body.deliveryFee !== undefined ? String(body.deliveryFee).trim() : "$2.99"
  const isPublished = body.isPublished !== undefined ? Boolean(body.isPublished) : true

  return {
    name,
    cuisine,
    addressLine1,
    addressLine2,
    addressCity,
    addressState,
    addressPostalCode,
    categoryId: Number.isFinite(categoryId) ? categoryId : null,
    image: image || "🍽️",
    deliveryTime: deliveryTime || "30–45 min",
    deliveryFee: deliveryFee || "$2.99",
    isPublished,
  }
}

function validateKitchenFields(fields: ReturnType<typeof parseKitchenBody>): string | null {
  if (!fields.name) return "Kitchen name is required."
  if (!fields.cuisine) return "Cuisine type is required."
  if (!fields.addressLine1 || !fields.addressCity || !fields.addressState || !fields.addressPostalCode) {
    return "Kitchen street address, city, state, and ZIP code are required."
  }
  return null
}

export async function GET() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const kitchen = await prisma.restaurant.findFirst({
    where: auth.user.role === "ADMIN" ? {} : { ownerId: auth.user.id },
    select: kitchenSelect,
    orderBy: { id: "asc" },
  })

  return NextResponse.json({ kitchen })
}

export async function POST(req: Request) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  if (auth.user.role !== "ADMIN") {
    const existing = await prisma.restaurant.findFirst({
      where: { ownerId: auth.user.id },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ error: "You already have a kitchen. Update it instead." }, { status: 409 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const fields = parseKitchenBody(body)
  const validationError = validateKitchenFields(fields)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const coords = await geocodeAddress({
    line1: fields.addressLine1,
    line2: fields.addressLine2 || undefined,
    city: fields.addressCity,
    state: fields.addressState,
    postalCode: fields.addressPostalCode,
  })

  if (!coords) {
    return NextResponse.json(
      { error: "We could not find that kitchen address. Check spelling and try again." },
      { status: 422 },
    )
  }

  if (fields.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: fields.categoryId } })
    if (!category) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 })
    }
  }

  try {
    const kitchen = await prisma.restaurant.create({
      data: {
        name: fields.name,
        image: fields.image,
        cuisine: fields.cuisine,
        rating: 5,
        deliveryTime: fields.deliveryTime,
        deliveryFee: fields.deliveryFee,
        isMehko: true,
        isDemo: false,
        isPublished: fields.isPublished,
        latitude: coords.lat,
        longitude: coords.lng,
        addressLine1: fields.addressLine1,
        addressLine2: fields.addressLine2 || null,
        addressCity: fields.addressCity,
        addressState: fields.addressState,
        addressPostalCode: fields.addressPostalCode,
        ownerId: auth.user.id,
        ...(fields.categoryId ? { categoryId: fields.categoryId } : {}),
      },
      select: kitchenSelect,
    })
    return NextResponse.json({ kitchen }, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "A kitchen with that name already exists." }, { status: 409 })
    }
    throw err
  }
}

export async function PATCH(req: Request) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const kitchen = await prisma.restaurant.findFirst({
    where: auth.user.role === "ADMIN" ? {} : { ownerId: auth.user.id },
    select: { id: true },
    orderBy: { id: "asc" },
  })

  if (!kitchen) {
    return NextResponse.json({ error: "Create your kitchen first." }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const fields = parseKitchenBody(body)
  const validationError = validateKitchenFields(fields)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const coords = await geocodeAddress({
    line1: fields.addressLine1,
    line2: fields.addressLine2 || undefined,
    city: fields.addressCity,
    state: fields.addressState,
    postalCode: fields.addressPostalCode,
  })

  if (!coords) {
    return NextResponse.json(
      { error: "We could not find that kitchen address. Check spelling and try again." },
      { status: 422 },
    )
  }

  if (fields.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: fields.categoryId } })
    if (!category) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 })
    }
  }

  try {
    const updated = await prisma.restaurant.update({
      where: { id: kitchen.id },
      data: {
        name: fields.name,
        image: fields.image,
        cuisine: fields.cuisine,
        deliveryTime: fields.deliveryTime,
        deliveryFee: fields.deliveryFee,
        isPublished: fields.isPublished,
        latitude: coords.lat,
        longitude: coords.lng,
        addressLine1: fields.addressLine1,
        addressLine2: fields.addressLine2 || null,
        addressCity: fields.addressCity,
        addressState: fields.addressState,
        addressPostalCode: fields.addressPostalCode,
        ...(fields.categoryId ? { categoryId: fields.categoryId } : { categoryId: null }),
      },
      select: kitchenSelect,
    })
    return NextResponse.json({ kitchen: updated })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "A kitchen with that name already exists." }, { status: 409 })
    }
    throw err
  }
}
