-- CreateTable
CREATE TABLE "public"."ModelConditionModifier" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "priceModifier" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "modifierType" "PriceModifierType" NOT NULL DEFAULT 'AMOUNT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelConditionModifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelConditionModifier_model_idx" ON "public"."ModelConditionModifier"("model");

-- CreateIndex
CREATE UNIQUE INDEX "ModelConditionModifier_model_optionId_key" ON "public"."ModelConditionModifier"("model", "optionId");

-- AddForeignKey
ALTER TABLE "public"."ModelConditionModifier" ADD CONSTRAINT "ModelConditionModifier_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."ConditionAttributeOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
