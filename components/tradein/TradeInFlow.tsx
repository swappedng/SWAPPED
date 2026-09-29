"use client";

import { useRef } from "react";
import CalendlyWidget from "../CalendlyWidget";
import SingleConditionQuestion from "../SingleConditionQuestion";
import { ContactSummaryStep } from "./ContactSummaryStep";
import { PhoneQuestionStep } from "./PhoneQuestionStep";
import { SwapMethodStep } from "./SwapMethodStep";
import {
  UpgradeCategoryStep,
  UpgradePhoneStep,
} from "./UpgradeQuestionSteps";
import { TradeInHeader } from "./TradeInHeader";
import { TradeInProgressBar } from "./TradeInProgressBar";
import { Catalogue, useTradeInFlow } from "./hooks/useTradeInFlow";

export function TradeInFlow({ catalogue }: { catalogue: Catalogue }) {
  const pageTop = useRef<HTMLDivElement>(null);
  const flow = useTradeInFlow(catalogue);

  const {
    step,
    setStep,
    prevStep,
    totalSteps,
    categoryStep,
    upgradePhoneStep,
    contactStep,
    methodStep,
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
  } = flow;

  return (
    <main
      ref={pageTop}
      className="min-h-screen bg-[#faf8f5] px-4 py-6 text-stone-900 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-2xl">
        <TradeInHeader onBack={prevStep} canGoBack={step > 1} />
        <TradeInProgressBar currentStep={step} totalSteps={totalSteps} />

        {step === 1 && (
          <PhoneQuestionStep
            options={phoneModels}
            value={tradeIn.model}
            onSelect={(option) => {
              setTradeIn((current) => ({
                ...current,
                model: option.value,
                storage: option.storage,
              }));
              setStep(2);
            }}
          />
        )}

        {currentCondition && (
          <SingleConditionQuestion
            question={currentCondition.label}
            description={currentCondition.description}
            fieldKey={currentCondition.key}
            options={currentCondition.options}
            value={tradeIn[currentCondition.key as keyof typeof tradeIn] || ""}
            onSelect={(value) =>
              setTradeIn((current) => ({
                ...current,
                [currentCondition.key]: value,
              }))
            }
            showBatteryInfo={currentCondition.key === "battery"}
            onContinue={() => setStep(step + 1)}
            onBack={prevStep}
            onScreenOriginChange={
              currentCondition.key === "screen"
                ? (origin) =>
                    setTradeIn((current) => ({
                      ...current,
                      screenReplaced: origin === "replaced" ? "yes" : "no",
                    }))
                : undefined
            }
            onBatteryOriginChange={
              currentCondition.key === "battery"
                ? (origin) =>
                    setTradeIn((current) => ({
                      ...current,
                      batteryReplaced: origin === "replaced" ? "yes" : "no",
                    }))
                : undefined
            }
          />
        )}

        {step === categoryStep && (
          <UpgradeCategoryStep
            options={categories.map((category) => ({
              value: category.id,
              label: category.label,
              description: category.description,
            }))}
            value={upgrade.category}
            onSelect={(category) =>
              setUpgrade({ category, model: "", storage: "" })
            }
            onContinue={() => setStep(upgradePhoneStep)}
            onBack={() => setStep(categoryStep - 1)}
          />
        )}

        {step === upgradePhoneStep && (
          <UpgradePhoneStep
            availablePrices={availablePricesForCategory}
            value={upgrade}
            onSelect={(selection) =>
              setUpgrade((current) => ({
                ...current,
                ...selection,
              }))
            }
            onContinue={() => setStep(contactStep)}
            onBack={() => setStep(categoryStep)}
          />
        )}

        {step === contactStep && (
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
            onContinue={() => setStep(methodStep)}
          />
        )}

        {step === methodStep && (
          <SwapMethodStep
            value={swapMethod}
            onSelect={setSwapMethod}
            onComplete={saveSwap}
            isSaving={saving}
            onBack={() => setStep(contactStep)}
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
