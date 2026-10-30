-- Migration: swap_lifecycle_and_offers
-- Adds SwapStatus + SwapOfferStatus enums, updates Swap table,
-- adds SwapOffer and SwapAuditLog tables.
-- Converts Float monetary columns to Decimal(12,2).
-- Adds phoneSellingPriceId FK and snapshot/current financial columns to Swap.
-- Preserves all existing data.

-- 1. Create new enum types safely
DO $$ BEGIN
  CREATE TYPE "SwapStatus" AS ENUM (
    'SUBMITTED',
    'INSPECTION_SCHEDULED',
    'UNDER_INSPECTION',
    'AWAITING_CUSTOMER_APPROVAL',
    'APPROVED',
    'REJECTED',
    'FULFILMENT_IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SwapOfferStatus" AS ENUM (
    'ORIGINAL',
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'SUPERSEDED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Alter Swap table
--    a. Add status column (default SUBMITTED for existing rows)
ALTER TABLE "Swap" ADD COLUMN IF NOT EXISTS "status" "SwapStatus" NOT NULL DEFAULT 'SUBMITTED';

--    b. Add updatedAt column (back-fill with createdAt for existing rows)
ALTER TABLE "Swap" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
UPDATE "Swap" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
ALTER TABLE "Swap" ALTER COLUMN "updatedAt" SET NOT NULL;

--    c. Add phoneSellingPriceId (nullable to allow back-fill before adding FK)
ALTER TABLE "Swap" ADD COLUMN IF NOT EXISTS "phoneSellingPriceId" TEXT;

--    d. Add snapshot and current financial columns
ALTER TABLE "Swap" ADD COLUMN IF NOT EXISTS "snapshotBuyingPrice" DECIMAL(12,2);
UPDATE "Swap" s
SET "snapshotBuyingPrice" = pm."buyingPrice"
FROM "PhoneModel" pm
WHERE s."tradeInModelId" = pm.id
  AND s."snapshotBuyingPrice" IS NULL;
UPDATE "Swap" SET "snapshotBuyingPrice" = 0 WHERE "snapshotBuyingPrice" IS NULL;
ALTER TABLE "Swap" ALTER COLUMN "snapshotBuyingPrice" SET NOT NULL;

ALTER TABLE "Swap" ADD COLUMN IF NOT EXISTS "currentTradeInValue" DECIMAL(12,2);
UPDATE "Swap" SET "currentTradeInValue" = "tradeInValue"::DECIMAL(12,2) WHERE "currentTradeInValue" IS NULL;
ALTER TABLE "Swap" ALTER COLUMN "currentTradeInValue" SET NOT NULL;

ALTER TABLE "Swap" ADD COLUMN IF NOT EXISTS "currentUpgradePrice" DECIMAL(12,2);
UPDATE "Swap" SET "currentUpgradePrice" = "upgradePrice"::DECIMAL(12,2) WHERE "currentUpgradePrice" IS NULL;
ALTER TABLE "Swap" ALTER COLUMN "currentUpgradePrice" SET NOT NULL;

--    e. Convert existing Float monetary columns to Decimal(12,2)
ALTER TABLE "Swap"
  ALTER COLUMN "tradeInValue" TYPE DECIMAL(12,2) USING "tradeInValue"::DECIMAL(12,2),
  ALTER COLUMN "upgradePrice" TYPE DECIMAL(12,2) USING "upgradePrice"::DECIMAL(12,2),
  ALTER COLUMN "amountToPay" TYPE DECIMAL(12,2) USING "amountToPay"::DECIMAL(12,2);

--    f. Back-fill phoneSellingPriceId from existing PhoneSellingPrice records
UPDATE "Swap" s
SET "phoneSellingPriceId" = psp.id
FROM "PhoneSellingPrice" psp
JOIN "PhoneModel" pm ON psp."phoneModelId" = pm.id
WHERE s."upgradeCategoryId" = psp."categoryId"
  AND pm.model = s."upgradeModel"
  AND pm.storage = s."upgradeStorage"
  AND s."phoneSellingPriceId" IS NULL;

--    g. Add FK constraint if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Swap_phoneSellingPriceId_fkey') THEN
    ALTER TABLE "Swap"
      ADD CONSTRAINT "Swap_phoneSellingPriceId_fkey"
      FOREIGN KEY ("phoneSellingPriceId") REFERENCES "PhoneSellingPrice"(id)
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Convert PhoneModel.buyingPrice Float -> Decimal(12,2)
ALTER TABLE "PhoneModel"
  ALTER COLUMN "buyingPrice" TYPE DECIMAL(12,2) USING "buyingPrice"::DECIMAL(12,2);

-- 4. Convert PhoneSellingPrice.price Float -> Decimal(12,2)
ALTER TABLE "PhoneSellingPrice"
  ALTER COLUMN "price" TYPE DECIMAL(12,2) USING "price"::DECIMAL(12,2);

-- 5. Create SwapOffer table
CREATE TABLE IF NOT EXISTS "SwapOffer" (
  "id"                       TEXT NOT NULL,
  "swapId"                   TEXT NOT NULL,
  "tradeInValue"             DECIMAL(12,2) NOT NULL,
  "upgradePrice"             DECIMAL(12,2) NOT NULL,
  "amountToPay"              DECIMAL(12,2) NOT NULL,
  "reason"                   TEXT,
  "status"                   "SwapOfferStatus" NOT NULL DEFAULT 'ORIGINAL',
  "responseToken"            TEXT,
  "responseTokenExpiresAt"   TIMESTAMP(3),
  "sentAt"                   TIMESTAMP(3),
  "respondedAt"              TIMESTAMP(3),
  "createdAt"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SwapOffer_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SwapOffer_responseToken_key" UNIQUE ("responseToken"),
  CONSTRAINT "SwapOffer_swapId_fkey" FOREIGN KEY ("swapId")
    REFERENCES "Swap"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Create SwapAuditLog table
CREATE TABLE IF NOT EXISTS "SwapAuditLog" (
  "id"        TEXT NOT NULL,
  "swapId"    TEXT NOT NULL,
  "adminId"   TEXT,
  "action"    TEXT NOT NULL,
  "field"     TEXT,
  "oldValue"  TEXT,
  "newValue"  TEXT,
  "reason"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SwapAuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SwapAuditLog_swapId_fkey" FOREIGN KEY ("swapId")
    REFERENCES "Swap"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Back-fill ORIGINAL SwapOffer records for all existing swaps
INSERT INTO "SwapOffer" (
  "id", "swapId", "tradeInValue", "upgradePrice", "amountToPay",
  "reason", "status", "createdAt"
)
SELECT
  CONCAT('offer_', id),
  id,
  "tradeInValue",
  "upgradePrice",
  "amountToPay",
  NULL,
  'ORIGINAL',
  "createdAt"
FROM "Swap"
ON CONFLICT ("id") DO NOTHING;

-- 8. Back-fill SUBMITTED audit entries for all existing swaps
INSERT INTO "SwapAuditLog" (
  "id", "swapId", "adminId", "action", "createdAt"
)
SELECT
  CONCAT('audit_init_', id),
  id,
  NULL,
  'SWAP_SUBMITTED',
  "createdAt"
FROM "Swap"
ON CONFLICT ("id") DO NOTHING;
