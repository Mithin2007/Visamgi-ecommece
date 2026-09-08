-- Phase 4: checkout idempotency, cart lifecycle, order snapshots and reservations.
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'CONVERTED');

ALTER TABLE "Cart" ADD COLUMN "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Cart" ADD COLUMN "convertedAt" TIMESTAMP(3);
CREATE INDEX "Cart_userId_status_idx" ON "Cart"("userId", "status");

ALTER TABLE "Order" ADD COLUMN "tax" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "currency" VARCHAR(3) NOT NULL DEFAULT 'INR';
ALTER TABLE "Order" ADD COLUMN "checkoutToken" TEXT;
CREATE UNIQUE INDEX "Order_checkoutToken_key" ON "Order"("checkoutToken");

ALTER TABLE "OrderItem" ADD COLUMN "variantNameSnapshot" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "variantAttributesSnapshot" JSONB;

CREATE TABLE "InventoryReservation" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT,
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InventoryReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "InventoryReservation_orderId_idx" ON "InventoryReservation"("orderId");
CREATE INDEX "InventoryReservation_productId_variantId_idx" ON "InventoryReservation"("productId", "variantId");

ALTER TYPE "InventoryReason" ADD VALUE 'RESERVATION';
