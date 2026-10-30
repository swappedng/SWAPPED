"use client";

import { useRef } from "react";
import CalendlyWidget from "./CalendlyWidget";
import SingleConditionQuestion from "./ui/SingleConditionQuestion";
import { ContactSummaryStep } from "./steps/ContactSummaryStep";
import { PhoneQuestionStep } from "./steps/PhoneQuestionStep";
import { SwapMethodStep } from "./steps/SwapMethodStep";
import {
  UpgradeCategoryStep,
  UpgradePhoneStep,
} from "./steps/UpgradeQuestionSteps";
import { Header } from "../home/Header";
import { TradeInProgressBar } from "./ui/TradeInProgressBar";
import { Catalogue, useTradeInFlow } from "./hooks/useTradeInFlow";

export function TradeInFlow({ catalogue }: { catalogue: Catalogue }) {
  const pageTop = useRef<HTMLDivElement>(null);
  const flow = useTradeInFlow(catalogue);

  const {
    step,
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
    showCalendly,
    handleCalendlyClose,
    phoneModels,
    categories,
    selectedTradeIn,
    currentCondition,
    tradeInValue,
    newPhonePrice,
    availablePricesForCategory,
    saveSwap,
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
      className="min-h-screen bg-background px-4 py-6 text-[#192331] sm:px-6 sm:py-0"
    >
      <Header />
      <div className="mx-auto max-w-2xl pt-16">
        <TradeInProgressBar
          currentStep={currentStepPosition + 1}
          totalSteps={totalSteps}
        />

        {isPhoneSelectionStep && (
          <PhoneQuestionStep
            options={phoneModels}
            value={tradeIn.model}
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
            category={
              categories.find((category) => category.id === upgrade.category)
                ?.label || ""
            }
            email={email}
            phone={phone}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onContinue={goToNextStep}
          />
        )}

        {isMethodStep && (
          <SwapMethodStep
            value={swapMethod}
            onSelect={setSwapMethod}
            onComplete={saveSwap}
            isSaving={saving}
            onBack={goToPreviousStep}
          />
        )}
      </div>

      <CalendlyWidget
        isOpen={showCalendly}
        onClose={handleCalendlyClose}
        onScheduled={handleCalendlyClose}
        swapId={savedSwapId}
        swapMethod={swapMethod}
        email={email}
      />
    </main>
  );
}
