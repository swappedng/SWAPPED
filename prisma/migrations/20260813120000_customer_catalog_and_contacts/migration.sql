ALTER TABLE "Swap" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
ALTER TABLE "Swap" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;

CREATE TABLE IF NOT EXISTS "PhoneSaleCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PhoneSaleCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PhoneSaleCategory_key_key" ON "PhoneSaleCategory"("key");

CREATE TABLE IF NOT EXISTS "PhoneSellingPrice" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PhoneSellingPrice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PhoneSellingPrice_categoryId_model_storage_key" ON "PhoneSellingPrice"("categoryId", "model", "storage");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PhoneSellingPrice_categoryId_fkey') THEN
    ALTER TABLE "PhoneSellingPrice" ADD CONSTRAINT "PhoneSellingPrice_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PhoneSaleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "PhoneSaleCategory" ("id", "key", "label", "description", "order", "updatedAt") VALUES
  ('uk-used', 'uk-used', 'UK Used Phone', 'Pre-owned phones in excellent working condition.', 1, CURRENT_TIMESTAMP),
  ('sealed-never-opened', 'sealed-never-opened', 'Sealed, Never Opened', 'Brand new phones in their original sealed packaging.', 2, CURRENT_TIMESTAMP),
  ('opened-never-used', 'opened-never-used', 'Opened, Never Used', 'New phones that have been unboxed but have not been used.', 3, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "PhoneSellingPrice" ("id", "categoryId", "model", "storage", "price", "updatedAt") VALUES
  ('ukx64', 'uk-used', 'iPhone X', '64GB', 135000, CURRENT_TIMESTAMP),
  ('ukx256', 'uk-used', 'iPhone X', '256GB', 155000, CURRENT_TIMESTAMP),
  ('ukxs64', 'uk-used', 'iPhone XS', '64GB', 160000, CURRENT_TIMESTAMP),
  ('ukxs256', 'uk-used', 'iPhone XS', '256GB', 180000, CURRENT_TIMESTAMP),
  ('ukxr64', 'uk-used', 'iPhone XR', '64GB', 155000, CURRENT_TIMESTAMP),
  ('ukxr128', 'uk-used', 'iPhone XR', '128GB', 180000, CURRENT_TIMESTAMP),
  ('ukxsm64', 'uk-used', 'iPhone XS Max', '64GB', 200000, CURRENT_TIMESTAMP),
  ('ukxsm256', 'uk-used', 'iPhone XS Max', '256GB', 225000, CURRENT_TIMESTAMP),
  ('uk1164', 'uk-used', 'iPhone 11', '64GB', 210000, CURRENT_TIMESTAMP),
  ('uk11128', 'uk-used', 'iPhone 11', '128GB', 240000, CURRENT_TIMESTAMP),
  ('uk11p64', 'uk-used', 'iPhone 11 Pro', '64GB', 270000, CURRENT_TIMESTAMP),
  ('uk11p256', 'uk-used', 'iPhone 11 Pro', '256GB', 300000, CURRENT_TIMESTAMP),
  ('uk11pm64', 'uk-used', 'iPhone 11 Pro Max', '64GB', 310000, CURRENT_TIMESTAMP),
  ('uk11pm256', 'uk-used', 'iPhone 11 Pro Max', '256GB', 340000, CURRENT_TIMESTAMP),
  ('uk1264', 'uk-used', 'iPhone 12', '64GB', 280000, CURRENT_TIMESTAMP),
  ('uk12128', 'uk-used', 'iPhone 12', '128GB', 320000, CURRENT_TIMESTAMP),
  ('uk12p128', 'uk-used', 'iPhone 12 Pro', '128GB', 380000, CURRENT_TIMESTAMP),
  ('uk12p256', 'uk-used', 'iPhone 12 Pro', '256GB', 410000, CURRENT_TIMESTAMP),
  ('uk12pm128', 'uk-used', 'iPhone 12 Pro Max', '128GB', 450000, CURRENT_TIMESTAMP),
  ('uk12pm256', 'uk-used', 'iPhone 12 Pro Max', '256GB', 480000, CURRENT_TIMESTAMP),
  ('uk13128', 'uk-used', 'iPhone 13', '128GB', 400000, CURRENT_TIMESTAMP),
  ('uk13256', 'uk-used', 'iPhone 13', '256GB', 440000, CURRENT_TIMESTAMP),
  ('uk13p128', 'uk-used', 'iPhone 13 Pro', '128GB', 520000, CURRENT_TIMESTAMP),
  ('uk13p256', 'uk-used', 'iPhone 13 Pro', '256GB', 560000, CURRENT_TIMESTAMP),
  ('uk13pm128', 'uk-used', 'iPhone 13 Pro Max', '128GB', 600000, CURRENT_TIMESTAMP),
  ('uk13pm256', 'uk-used', 'iPhone 13 Pro Max', '256GB', 640000, CURRENT_TIMESTAMP),
  ('uk14128', 'uk-used', 'iPhone 14', '128GB', 500000, CURRENT_TIMESTAMP),
  ('uk14256', 'uk-used', 'iPhone 14', '256GB', 540000, CURRENT_TIMESTAMP),
  ('uk14p128', 'uk-used', 'iPhone 14 Pro', '128GB', 680000, CURRENT_TIMESTAMP),
  ('uk14p256', 'uk-used', 'iPhone 14 Pro', '256GB', 720000, CURRENT_TIMESTAMP),
  ('uk14pm128', 'uk-used', 'iPhone 14 Pro Max', '128GB', 780000, CURRENT_TIMESTAMP),
  ('uk14pm256', 'uk-used', 'iPhone 14 Pro Max', '256GB', 820000, CURRENT_TIMESTAMP),
  ('uk14pm512', 'uk-used', 'iPhone 14 Pro Max', '512GB', 850000, CURRENT_TIMESTAMP),
  ('s13128', 'sealed-never-opened', 'iPhone 13', '128GB', 520000, CURRENT_TIMESTAMP),
  ('s15128', 'sealed-never-opened', 'iPhone 15', '128GB', 850000, CURRENT_TIMESTAMP),
  ('s15256', 'sealed-never-opened', 'iPhone 15', '256GB', 950000, CURRENT_TIMESTAMP),
  ('s15pl128', 'sealed-never-opened', 'iPhone 15 Plus', '128GB', 950000, CURRENT_TIMESTAMP),
  ('s15pl256', 'sealed-never-opened', 'iPhone 15 Plus', '256GB', 1050000, CURRENT_TIMESTAMP),
  ('s15p128', 'sealed-never-opened', 'iPhone 15 Pro', '128GB', 1100000, CURRENT_TIMESTAMP),
  ('s15p256', 'sealed-never-opened', 'iPhone 15 Pro', '256GB', 1200000, CURRENT_TIMESTAMP),
  ('s15pm256', 'sealed-never-opened', 'iPhone 15 Pro Max', '256GB', 1350000, CURRENT_TIMESTAMP),
  ('s15pm512', 'sealed-never-opened', 'iPhone 15 Pro Max', '512GB', 1500000, CURRENT_TIMESTAMP),
  ('o15pm256', 'opened-never-used', 'iPhone 15 Pro Max', '256GB', 1250000, CURRENT_TIMESTAMP)
ON CONFLICT ("categoryId", "model", "storage") DO NOTHING;
