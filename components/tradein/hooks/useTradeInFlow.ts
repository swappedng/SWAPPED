import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTradeInRequest } from "@/lib/api/endpoints/tradein";
import {
  emptyTradeInDetails,
  type ConditionGroup,
  type PhoneModel,
  type SaleCategory,
  type TradeInDetails,
  type UpgradeSelection,
} from "@/types/tradein";

export type Catalogue = {
  conditionGroups: ConditionGroup[];
  phoneModels: PhoneModel[];
  saleCategories: SaleCategory[];
};

export function useTradeInFlow(catalogue: Catalogue) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [tradeIn, setTradeIn] = useState<TradeInDetails>(emptyTradeInDetails);
  const [upgrade, setUpgrade] = useState<UpgradeSelection>({
    category: "",
    model: "",
    storage: "",
  });
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [swapMethod, setSwapMethod] = useState("");
  const [savedSwapId, setSavedSwapId] = useState("");
  const [showCalendly, setShowCalendly] = useState(false);

  const {
    conditionGroups,
    phoneModels,
    saleCategories: categories,
  } = catalogue;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const generation = (name: string) =>
    Number(name.match(/iPhone\s+(\d+)/i)?.[1] || 0);

  const rank = (name: string) =>
    generation(name) * 10 +
    (name.includes("Pro Max")
      ? 3
      : name.includes(" Pro")
        ? 2
        : name.includes("Plus")
          ? 1
          : name.includes("mini")
            ? -1
            : 0);

  const selectedTradeIn = useMemo(
    () => phoneModels.find((item) => item.value === tradeIn.model),
    [phoneModels, tradeIn.model]
  );

  const visibleConditions = useMemo(
    () =>
      conditionGroups.filter(
        (group) =>
          group.key !== "body" &&
          (group.key !== "sim" ||
            generation(selectedTradeIn?.model || "") >= 14)
      ),
    [conditionGroups, selectedTradeIn]
  );

  const categoryStep = visibleConditions.length + 2;
  const upgradePhoneStep = categoryStep + 1;
  const contactStep = upgradePhoneStep + 1;
  const methodStep = contactStep + 1;
  const totalSteps = methodStep;

  const tradeInValue = useMemo(() => {
    if (!selectedTradeIn) return 0;
    const price = visibleConditions.reduce(
      (total, group) =>
        total *
        (group.options.find(
          (option) =>
            option.value === tradeIn[group.key as keyof TradeInDetails]
        )?.priceModifier || 1),
      selectedTradeIn.basePrice
    );
    const screenReplaced =
      tradeIn.screenReplaced === "yes"
        ? visibleConditions
            .find((group) => group.key === "screen")
            ?.options.find(
              (option) =>
                option.value.includes("changed") ||
                option.label.toLowerCase().includes("changed")
            )?.priceModifier || 1
        : 1;
    const batteryReplaced =
      tradeIn.batteryReplaced === "yes"
        ? visibleConditions
            .find((group) => group.key === "battery")
            ?.options.find(
              (option) =>
                option.value.includes("changed") ||
                option.label.toLowerCase().includes("changed")
            )?.priceModifier || 1
        : 1;
    return Math.round(price * screenReplaced * batteryReplaced);
  }, [selectedTradeIn, visibleConditions, tradeIn]);

  const newPhonePrice = useMemo(
    () =>
      categories
        .find((category) => category.id === upgrade.category)
        ?.prices.find(
          (price) =>
            price.model === upgrade.model && price.storage === upgrade.storage
        )?.price || 0,
    [categories, upgrade]
  );

  const availablePricesForCategory = useMemo(() => {
    const category = categories.find((item) => item.id === upgrade.category);
    return category
      ? category.prices.filter(
          (item) => rank(item.model) >= rank(selectedTradeIn?.model || "")
        )
      : [];
  }, [categories, upgrade.category, selectedTradeIn]);

  const currentCondition =
    step >= 2 && step < categoryStep ? visibleConditions[step - 2] : null;

  async function saveSwap() {
    if (!swapMethod || saving) return;
    setSaving(true);
    try {
      const swap = await createTradeInRequest({
        tradeInPhone: tradeIn,
        newPhone: upgrade,
        contactEmail: email,
        contactPhone: phone,
        swapMethod,
        tradeInValue,
        newPhonePrice,
        amountToPay: newPhonePrice - tradeInValue,
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

  const prevStep = () => setStep((current) => Math.max(1, current - 1));
  const nextStep = () => setStep((current) => current + 1);

  return {
    step,
    setStep,
    prevStep,
    nextStep,
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
  };
}
