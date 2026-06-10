-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "addressLine1" TEXT,
ADD COLUMN "addressLine2" TEXT,
ADD COLUMN "addressCity" TEXT,
ADD COLUMN "addressState" TEXT,
ADD COLUMN "addressPostalCode" TEXT,
ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- Mark existing seeded kitchens as demo (all current rows predate cook self-service)
UPDATE "Restaurant" SET "isDemo" = true;
