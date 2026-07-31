-- CreateEnum
CREATE TYPE "MehkoPermitStatus" AS ENUM ('not_started', 'pending_review', 'approved', 'rejected', 'expired', 'renewal_required');

-- CreateTable
CREATE TABLE "KitchenMehkoPermit" (
    "id" TEXT NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "permitNumber" TEXT,
    "issuingAgency" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "documentUrl" TEXT,
    "status" "MehkoPermitStatus" NOT NULL DEFAULT 'not_started',
    "autoCheckPassed" BOOLEAN NOT NULL DEFAULT false,
    "autoCheckNotes" JSONB,
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KitchenMehkoPermit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KitchenMehkoPermit_restaurantId_key" ON "KitchenMehkoPermit"("restaurantId");

-- CreateIndex
CREATE INDEX "KitchenMehkoPermit_status_idx" ON "KitchenMehkoPermit"("status");

-- CreateIndex
CREATE INDEX "KitchenMehkoPermit_expiresAt_idx" ON "KitchenMehkoPermit"("expiresAt");

-- AddForeignKey
ALTER TABLE "KitchenMehkoPermit" ADD CONSTRAINT "KitchenMehkoPermit_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenMehkoPermit" ADD CONSTRAINT "KitchenMehkoPermit_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
