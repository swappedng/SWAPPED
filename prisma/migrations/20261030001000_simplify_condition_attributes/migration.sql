CREATE TYPE "ConditionType" AS ENUM ('battery', 'screen', 'faceid', 'backglass', 'body', 'sim');

-- Preserve historical swap answers, replacing legacy option keys with labels.
UPDATE "SwapCondition" AS answer
SET "value" = option."label"
FROM "ConditionAttributeGroup" AS attribute_group
JOIN "ConditionAttributeOption" AS option ON option."groupId" = attribute_group."id"
WHERE answer."groupKey" = attribute_group."key"
  AND answer."value" = option."value";

ALTER TABLE "SwapCondition"
  ALTER COLUMN "groupKey" TYPE "ConditionType" USING "groupKey"::"ConditionType";
ALTER TABLE "ConditionAttributeGroup"
  ALTER COLUMN "key" TYPE "ConditionType" USING "key"::"ConditionType";

DROP INDEX "ConditionAttributeOption_groupId_value_key";
ALTER TABLE "ConditionAttributeOption"
  DROP COLUMN "displayLabel",
  DROP COLUMN "displayDescription",
  DROP COLUMN "value";
CREATE UNIQUE INDEX "ConditionAttributeOption_groupId_label_key"
  ON "ConditionAttributeOption"("groupId", "label");
