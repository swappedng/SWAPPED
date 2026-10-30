-- Keep the catalogue relational while removing values duplicated from PhoneModel.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'PhoneModel' AND column_name = 'basePrice'
  ) THEN
    ALTER TABLE "PhoneModel" RENAME COLUMN "basePrice" TO "buyingPrice";
  END IF;
END $$;

ALTER TABLE "PhoneModel" DROP COLUMN IF EXISTS "value";

UPDATE "PhoneSaleCategory"
SET "key" = 'premium-used', "label" = 'Premium Used'
WHERE "key" = 'uk-used';
UPDATE "PhoneSaleCategory"
SET "key" = 'brand-new', "label" = 'Brand New'
WHERE "key" = 'sealed-never-opened';
UPDATE "PhoneSaleCategory"
SET "key" = 'open-box', "label" = 'Open Box'
WHERE "key" = 'opened-never-used';

ALTER TABLE "PhoneSellingPrice" ADD COLUMN IF NOT EXISTS "phoneModelId" TEXT;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'PhoneSellingPrice' AND column_name = 'model'
  ) THEN
    UPDATE "PhoneSellingPrice" AS price
    SET "phoneModelId" = phone."id"
    FROM "PhoneModel" AS phone
    WHERE price."model" = phone."model" AND price."storage" = phone."storage"
      AND price."phoneModelId" IS NULL;
  END IF;
END $$;

ALTER TABLE "PhoneSellingPrice" ALTER COLUMN "phoneModelId" SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PhoneSellingPrice_phoneModelId_fkey') THEN
    ALTER TABLE "PhoneSellingPrice"
      ADD CONSTRAINT "PhoneSellingPrice_phoneModelId_fkey"
      FOREIGN KEY ("phoneModelId") REFERENCES "PhoneModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DROP INDEX IF EXISTS "PhoneSellingPrice_categoryId_model_storage_key";
ALTER TABLE "PhoneSellingPrice" DROP COLUMN IF EXISTS "model", DROP COLUMN IF EXISTS "storage";
DROP INDEX IF EXISTS "PhoneSellingPrice_categoryId_phoneModelId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "PhoneSellingPrice_categoryId_phoneModelId_key"
  ON "PhoneSellingPrice"("categoryId", "phoneModelId");
