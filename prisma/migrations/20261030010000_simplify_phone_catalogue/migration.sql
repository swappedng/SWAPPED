-- Keep the catalogue relational while removing values duplicated from PhoneModel.
ALTER TABLE "PhoneModel" RENAME COLUMN "basePrice" TO "buyingPrice";
ALTER TABLE "PhoneModel" DROP COLUMN "value";

UPDATE "PhoneSaleCategory"
SET "key" = 'premium-used', "label" = 'Premium Used'
WHERE "key" = 'uk-used';
UPDATE "PhoneSaleCategory"
SET "key" = 'brand-new', "label" = 'Brand New'
WHERE "key" = 'sealed-never-opened';
UPDATE "PhoneSaleCategory"
SET "key" = 'open-box', "label" = 'Open Box'
WHERE "key" = 'opened-never-used';

ALTER TABLE "PhoneSellingPrice" ADD COLUMN "phoneModelId" TEXT;
UPDATE "PhoneSellingPrice" AS price
SET "phoneModelId" = phone."id"
FROM "PhoneModel" AS phone
WHERE price."model" = phone."model" AND price."storage" = phone."storage";
ALTER TABLE "PhoneSellingPrice" ALTER COLUMN "phoneModelId" SET NOT NULL;
ALTER TABLE "PhoneSellingPrice"
  ADD CONSTRAINT "PhoneSellingPrice_phoneModelId_fkey"
  FOREIGN KEY ("phoneModelId") REFERENCES "PhoneModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "PhoneSellingPrice_categoryId_model_storage_key";
ALTER TABLE "PhoneSellingPrice" DROP COLUMN "model", DROP COLUMN "storage";
CREATE UNIQUE INDEX "PhoneSellingPrice_categoryId_phoneModelId_key"
  ON "PhoneSellingPrice"("categoryId", "phoneModelId");
