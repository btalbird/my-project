-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'COOK';

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "ownerId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "restaurantId" INTEGER;

-- CreateTable
CREATE TABLE "CookSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookSubscription_pkey" PRIMARY KEY ("id")
);

-- Backfill Order.restaurantId from items JSON restaurant name
UPDATE "Order" o
SET "restaurantId" = r.id
FROM "Restaurant" r
WHERE o."restaurantId" IS NULL
  AND o.items->>'restaurant' = r.name;

-- CreateIndex
CREATE INDEX "Restaurant_ownerId_idx" ON "Restaurant"("ownerId");

-- CreateIndex
CREATE INDEX "Order_restaurantId_idx" ON "Order"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "CookSubscription_userId_key" ON "CookSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CookSubscription_stripeCustomerId_key" ON "CookSubscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "CookSubscription_stripeSubscriptionId_key" ON "CookSubscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CookSubscription" ADD CONSTRAINT "CookSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
