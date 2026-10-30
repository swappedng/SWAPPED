-- Ensure PriceModifierType enum exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PriceModifierType') THEN
    CREATE TYPE "PriceModifierType" AS ENUM ('AMOUNT', 'PERCENTAGE');
  END IF;
END $$;

-- Insert 'Sim locked/Wifi Only' option for the SIM condition group if not exists
INSERT INTO "ConditionAttributeOption" ("id", "groupId", "label", "description", "priceModifier", "modifierType", "isActive", "order", "createdAt", "updatedAt")
SELECT
  'opt_sim_locked_wifi_only',
  g."id",
  'Sim locked/Wifi Only',
  'Device is carrier locked or restricted to Wi-Fi use only.',
  0,
  'AMOUNT'::"PriceModifierType",
  true,
  3,
  NOW(),
  NOW()
FROM "ConditionAttributeGroup" g
WHERE g."key" = 'sim'::"ConditionType"
ON CONFLICT ("groupId", "label") DO NOTHING;
