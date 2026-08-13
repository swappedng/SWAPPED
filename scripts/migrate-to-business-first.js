const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting data migration...');

  // 1. Migrate PhoneModel to TradeInCatalog
  const phoneModels = await prisma.phoneModel.findMany();
  console.log(`Found ${phoneModels.length} phone models to migrate.`);

  for (const pm of phoneModels) {
    await prisma.tradeInCatalog.upsert({
      where: { id: pm.id },
      update: {
        displayName: pm.label,
        modelName: pm.model,
        storage: pm.storage,
        baseValue: pm.basePrice,
        isActive: pm.isActive,
        order: pm.order,
      },
      create: {
        id: pm.id,
        displayName: pm.label,
        modelName: pm.model,
        storage: pm.storage,
        baseValue: pm.basePrice,
        isActive: pm.isActive,
        order: pm.order,
      },
    });
  }
  console.log('Phone models migrated.');

  // 2. Migrate ConditionAttributeGroup to AssessmentStep
  const attributeGroups = await prisma.conditionAttributeGroup.findMany({
    include: { options: true },
  });
  console.log(`Found ${attributeGroups.length} attribute groups to migrate.`);

  for (const group of attributeGroups) {
    const step = await prisma.assessmentStep.upsert({
      where: { id: group.id },
      update: {
        question: group.label,
        internalNote: group.description,
        order: group.order,
        isActive: group.isActive,
      },
      create: {
        id: group.id,
        question: group.label,
        internalNote: group.description,
        order: group.order,
        isActive: group.isActive,
      },
    });

    for (const opt of group.options) {
      await prisma.assessmentOption.upsert({
        where: { id: opt.id },
        update: {
          label: opt.label,
          impactType: 'MULTIPLY',
          impactValue: opt.priceModifier,
          order: opt.order,
          isActive: opt.isActive,
          stepId: step.id,
        },
        create: {
          id: opt.id,
          label: opt.label,
          impactType: 'MULTIPLY',
          impactValue: opt.priceModifier,
          order: opt.order,
          isActive: opt.isActive,
          stepId: step.id,
        },
      });
    }
  }
  console.log('Assessment steps and options migrated.');

  // 3. Migrate PricingRule to PriceBoost
  const pricingRules = await prisma.pricingRule.findMany();
  console.log(`Found ${pricingRules.length} pricing rules to migrate.`);

  for (const rule of pricingRules) {
    await prisma.priceBoost.upsert({
      where: { id: rule.id },
      update: {
        name: rule.name,
        amount: rule.priceAdjustment,
        type: rule.isPercentage ? 'PERCENTAGE' : 'FIXED',
        appliesTo: rule.baseModel === '*' ? 'ALL' : rule.baseModel,
        isActive: rule.isActive,
      },
      create: {
        id: rule.id,
        name: rule.name,
        amount: rule.priceAdjustment,
        type: rule.isPercentage ? 'PERCENTAGE' : 'FIXED',
        appliesTo: rule.baseModel === '*' ? 'ALL' : rule.baseModel,
        isActive: rule.isActive,
      },
    });
  }
  console.log('Pricing rules migrated.');

  console.log('Migration completed successfully.');
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
