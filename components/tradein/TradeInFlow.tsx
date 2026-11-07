"use client";

import { useRef } from "react";
import SingleConditionQuestion from "./ui/SingleConditionQuestion";
import { ContactSummaryStep } from "./steps/ContactSummaryStep";
import { PhoneQuestionStep } from "./steps/PhoneQuestionStep";
import { SwapMethodStep } from "./steps/SwapMethodStep";
import {
  UpgradeCategoryStep,
  UpgradePhoneStep,
} from "./steps/UpgradeQuestionSteps";
import { TradeInHeader } from "./TradeInHeader";
import { Catalogue, useTradeInFlow } from "./hooks/useTradeInFlow";

export function TradeInFlow({ catalogue }: { catalogue: Catalogue }) {
  const pageTop = useRef<HTMLDivElement>(null);
  const flow = useTradeInFlow(catalogue);

  const {
    step,
    initialHaveModel,
    goToNextStep,
    goToPreviousStep,
    currentStepPosition,
    totalSteps,
    saving,
    tradeIn,
    setTradeIn,
    upgrade,
    setUpgrade,
    email,
    setEmail,
    phone,
    setPhone,
    swapMethod,
    setSwapMethod,
    savedSwapId,
    phoneModels,
    categories,
    selectedTradeIn,
    currentCondition,
    tradeInValue,
    newPhonePrice,
    availablePricesForCategory,
    saveSwap,
    updateSwapMethod,
    goToSchedule,
    selectTradeInPhone,
  } = flow;

  const isPhoneSelectionStep = step.type === "phone-selection";

  const isCategoryStep = step.type === "upgrade-category";

  const isUpgradePhoneStep = step.type === "upgrade-phone";

  const isContactStep = step.type === "contact-details";

  const isMethodStep = step.type === "swap-method";

  return (
    <main
      ref={pageTop}
      className="flex min-h-screen flex-col bg-background text-[#192331]"
    >
      <TradeInHeader
        currentStep={currentStepPosition + 1}
        totalSteps={totalSteps}
      />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8 sm:px-6">
        {isPhoneSelectionStep && (
          <PhoneQuestionStep
            options={phoneModels}
            value={tradeIn.model}
            initialModel={initialHaveModel}
            onSelect={selectTradeInPhone}
          />
        )}

        {currentCondition && (() => {
          const normKey = (currentCondition.key || "").toLowerCase().replace(/_/g, "");
          return (
            <SingleConditionQuestion
              question={currentCondition.label}
              description={currentCondition.description}
              fieldKey={normKey}
              options={currentCondition.options}
              value={tradeIn[normKey as keyof typeof tradeIn] || tradeIn[currentCondition.key as keyof typeof tradeIn] || ""}
              onSelect={(value) =>
                setTradeIn((current) => ({
                  ...current,
                  [normKey]: value,
                  [currentCondition.key]: value,
                }))
              }
              showBatteryInfo={normKey === "battery"}
              onContinue={goToNextStep}
              onBack={goToPreviousStep}
              onScreenOriginChange={
                normKey === "screen"
                  ? (origin) =>
                      setTradeIn((current) => ({
                        ...current,
                        screenReplaced: origin === "replaced" ? "yes" : "no",
                      }))
                  : undefined
              }
              onBatteryOriginChange={
                normKey === "battery"
                  ? (origin) =>
                      setTradeIn((current) => ({
                        ...current,
                        batteryReplaced: origin === "replaced" ? "yes" : "no",
                      }))
                  : undefined
              }
            />
          );
        })()}

        {isCategoryStep && (
          <UpgradeCategoryStep
            options={categories.map((category) => ({
              value: category.id,
              label: category.label,
              description: category.description,
              imagePath: category.imagePath,
            }))}
            value={upgrade.category}
            onSelect={(category) =>
              setUpgrade({ category, model: "", storage: "" })
            }
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {isUpgradePhoneStep && (
          <UpgradePhoneStep
            availablePrices={availablePricesForCategory}
            value={upgrade}
            onSelect={(selection) =>
              setUpgrade((current) => ({
                ...current,
                ...selection,
              }))
            }
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {isContactStep && (
          <ContactSummaryStep
            amountToPay={newPhonePrice - tradeInValue}
            tradeInPhone={
              selectedTradeIn?.label ||
              `${selectedTradeIn?.model || ""} ${tradeIn.storage}`.trim()
            }
            nextPhone={`${upgrade.model} ${upgrade.storage}`.trim()}
            nextPhonePrice={newPhonePrice}
            category={
              categories.find((category) => category.id === upgrade.category)
                ?.label || ""
            }
            email={email}
            phone={phone}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onBack={goToPreviousStep}
            onContinue={() => {
              saveSwap(); // Fire and forget
              goToNextStep();
            }}
          />
        )}

        {isMethodStep && (
          <SwapMethodStep
            value={swapMethod}
            onSelect={(method) => {
              setSwapMethod(method);
              updateSwapMethod(method);
            }}
            onComplete={goToSchedule}
            isSaving={saving}
            onBack={goToPreviousStep}
          />
        )}
      </div>
    </main>
  );
}
