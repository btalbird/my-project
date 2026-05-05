-- AlterTable: Restaurant — MEHKO flag + map coordinates
ALTER TABLE "Restaurant" ADD COLUMN "isMehko" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Restaurant" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Restaurant" ADD COLUMN "longitude" DOUBLE PRECISION;

CREATE INDEX "Restaurant_isMehko_idx" ON "Restaurant"("isMehko");

-- AlterTable: User — delivery home + search radius
ALTER TABLE "User" ADD COLUMN "deliveryLine1" TEXT;
ALTER TABLE "User" ADD COLUMN "deliveryLine2" TEXT;
ALTER TABLE "User" ADD COLUMN "deliveryCity" TEXT;
ALTER TABLE "User" ADD COLUMN "deliveryState" TEXT;
ALTER TABLE "User" ADD COLUMN "deliveryPostalCode" TEXT;
ALTER TABLE "User" ADD COLUMN "deliveryLat" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "deliveryLng" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "kitchenSearchRadiusMiles" DOUBLE PRECISION NOT NULL DEFAULT 10;
