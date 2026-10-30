import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTradeInRequest } from "@/lib/api/endpoints/customer/tradein";
import { generation, rank } from "@/lib/phone-models";
import { SwapMethod } from "@/lib/api/types/enums";
import {
  emptyTradeInDetails,
  type ConditionGroup,
  type PhoneModel,
  type SaleCategory,
  type TradeInDetails,
  type UpgradeSelection,
} from "@/types/tradein";
import {
  createTradeInSteps,
  getTradeInStepPosition,
  INITIAL_TRADE_IN_STEP,
  type TradeInStep,
} from "../TradeInSteps";
import type { PhoneOption } from "../steps/PhoneQuestionStep";

export type Catalogue = {
  conditionGroups: ConditionGroup[];
  phoneModels: PhoneModel[];
  saleCategories: SaleCategory[];
  modelModifiers?: Record<string, Record<string, { priceModifier: number; modifierType: string }>>;
};

export function useTradeInFlow(catalogue: Catalogue) {
  const router = useRouter();

  const [step, setStep] = useState<TradeInStep>(INITIAL_TRADE_IN_STEP);
  const [saving, setSaving] = useState(false);
  const [tradeIn, setTradeIn] = useState<TradeInDetails>(emptyTradeInDetails);
  const [upgrade, setUpgrade] = useState<UpgradeSelection>({
    category: "",
    model: "",
    storage: "",
  });
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [swapMethod, setSwapMethod] = useState<SwapMethod | "">("");
  const [savedSwapId, setSavedSwapId] = useState("");
  const [showCalendly, setShowCalendly] = useState(false);

  const {
    conditionGroups,
    phoneModels,
    saleCategories: categories,
    modelModifiers,
  } = catalogue;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goToNextStep = () => {
    const nextPosition = currentStepPosition + 1;

    if (currentStepPosition === -1) return;
    if (nextPosition >= steps.length) return;

    setStep(steps[nextPosition]);
  };

  const goToPreviousStep = () => {
    if (currentStepPosition === -1) {
      setStep(INITIAL_TRADE_IN_STEP);
      return;
    }

    if (currentStepPosition <= 0) return;

    setStep(steps[currentStepPosition - 1]);
  };

function selectTradeInPhone(option: PhoneOption) {
  const is13OrBelow = generation(option.label || "") <= 13;
  setTradeIn((current) => ({
    ...current,
    model: option.id,
    storage: option.storage,
    sim: is13OrBelow && current.sim.toLowerCase().includes("esim only") ? "" : current.sim,
  }));

  goToNextStep();
}

const selectCondition = ( key: ConditionGroup['key'], value: string ) => {
  setTradeIn((current) => ({
    ...current,
   [key]: value,
  }));
}

  const selectedTradeIn = useMemo(
    () => phoneModels.find((item) => item.id === tradeIn.model),
    [phoneModels, tradeIn.model],
  );

  const visibleConditions = useMemo(
    () => {
      const selectedModelName = selectedTradeIn?.model || "";
      const modelCustomModifiers = modelModifiers?.[selectedModelName];

      return conditionGroups
        .filter((group) => {
          const k = (group.key || "").toLowerCase().replace(/_/g, "");
          return k !== "body";
        })
        .map((group) => {
          const k = (group.key || "").toLowerCase().replace(/_/g, "");
          let options = group.options.map((opt) => {
            const override = modelCustomModifiers?.[opt.label];
            if (override) {
              return {
                ...opt,
                priceModifier: override.priceModifier,
              };
            }
            return opt;
          });

          if (k === "sim") {
            const phoneName = selectedTradeIn?.model || selectedTradeIn?.label || "";
            const is13OrBelow = generation(phoneName) <= 13;
            if (is13OrBelow) {
              options = options.filter(
                (opt) => !opt.label.toLowerCase().includes("esim only"),
              );
            }
          }

          return {
            ...group,
            options,
          };
        });
    },
    [conditionGroups, selectedTradeIn, modelModifiers],
  );

  const steps = useMemo(
    () => createTradeInSteps(visibleConditions.length),
    [visibleConditions.length],
  );

  const currentStepPosition = getTradeInStepPosition(steps, step);

  const currentCondition =
    step.type === "condition" ? visibleConditions[step.index] : null;

  const tradeInValue = useMemo(() => {
    if (!selectedTradeIn) return 0;
    const price = visibleConditions.reduce(
      (total, group) => {
        const k = (group.key || "").toLowerCase().replace(/_/g, "");
        const answer = tradeIn[k as keyof TradeInDetails] || tradeIn[group.key as keyof TradeInDetails];
        const option = group.options.find((opt) => opt.label === answer);
        return total * (option?.priceModifier || 1);
      },
      selectedTradeIn.buyingPrice,
    );
    const screenReplaced =
      tradeIn.screenReplaced === "yes"
        ? visibleConditions
            .find((group) => (group.key || "").toLowerCase().replace(/_/g, "") === "screen")
            ?.options.find(
              (option) =>
            option.label.toLowerCase().includes("changed"),
            )?.priceModifier || 1
        : 1;
    const batteryReplaced =
      tradeIn.batteryReplaced === "yes"
        ? visibleConditions
            .find((group) => (group.key || "").toLowerCase().replace(/_/g, "") === "battery")
            ?.options.find(
              (option) =>
            option.label.toLowerCase().includes("changed"),
            )?.priceModifier || 1
        : 1;
    return Math.round(price * screenReplaced * batteryReplaced);
  }, [selectedTradeIn, visibleConditions, tradeIn]);

  const selectedSellingPrice = useMemo(
    () =>
      categories
        .find((category) => category.id === upgrade.category)
        ?.prices.find(
          (price) =>
            price.model === upgrade.model && price.storage === upgrade.storage,
        ),
    [categories, upgrade],
  );

  const newPhonePrice = selectedSellingPrice?.price || 0;

  const availablePricesForCategory = useMemo(() => {
    const category = categories.find((item) => item.id === upgrade.category);
    return category
      ? category.prices.filter(
          (item) => rank(item.model) >= rank(selectedTradeIn?.model || ""),
        )
      : [];
  }, [categories, upgrade.category, selectedTradeIn]);

  async function saveSwap() {
    if (!swapMethod || saving) return;
    setSaving(true);
    try {
      // Build conditions array from the form state, filtering out empty answers
      const conditions = visibleConditions
        .map((group) => ({
          groupKey: group.key,
          value: tradeIn[group.key as keyof TradeInDetails] as string,
        }))
        .filter((c) => c.value !== "" && c.value !== undefined);

      const swap = await createTradeInRequest({
        tradeInModelId: selectedTradeIn?.id || "",
        tradeInValue,
        snapshotBuyingPrice: selectedTradeIn?.buyingPrice || 0,
        conditions,
        phoneSellingPriceId: selectedSellingPrice?.id,
        upgradeCategoryId: upgrade.category,
        upgradeModel: upgrade.model,
        upgradeStorage: upgrade.storage,
        upgradePrice: newPhonePrice,
        amountToPay: newPhonePrice - tradeInValue,
        swapMethod,
        contactEmail: email,
        contactPhone: phone,
      });
      setSavedSwapId(swap.id);
      setShowCalendly(true);
    } catch (error) {
      console.error("Failed to save trade-in swap:", error);
    } finally {
      setSaving(false);
    }
  }

  const handleCalendlyClose = () => {
    setShowCalendly(false);
    router.push(`/tradein/confirm?swapId=${encodeURIComponent(savedSwapId)}`);
  };

  return {
    step,
    setStep,
    goToNextStep,
    goToPreviousStep,
    currentStepPosition,
    totalSteps: steps.length,
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
    setShowCalendly,
    handleCalendlyClose,
    phoneModels,
    categories,
    selectedTradeIn,
    currentCondition,
    tradeInValue,
    newPhonePrice,
    availablePricesForCategory,
    saveSwap,
    selectTradeInPhone
  };
}
