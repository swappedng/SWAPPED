export type TradeInStep =
  | { type: "phone-selection" }
  | { type: "condition"; index: number }
  | { type: "upgrade-category" }
  | { type: "upgrade-phone" }
  | { type: "contact-details" }
  | { type: "swap-method" };

export const INITIAL_TRADE_IN_STEP: TradeInStep = {
  type: "phone-selection",
};


export function createTradeInSteps(conditionCount: number): TradeInStep[] {
  return [
    { type: "phone-selection" },

    ...Array.from({ length: conditionCount }, (_, index): TradeInStep => ({
      type: "condition",
      index,
    })),

    { type: "upgrade-category" },
    { type: "upgrade-phone" },
    { type: "contact-details" },
    { type: "swap-method" },
  ];
}


export function getTradeInStepPosition(
  steps: TradeInStep[],
  currentStep: TradeInStep,
): number {
  return steps.findIndex((step) => {
    if (step.type !== currentStep.type) {
      return false;
    }

    if (step.type === "condition" && currentStep.type === "condition") {
      return step.index === currentStep.index;
    }

    return true;
  });
}
