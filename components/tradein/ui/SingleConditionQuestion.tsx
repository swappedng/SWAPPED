"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ConditionOption } from "@/types/tradein";
import { OptionCardList } from "./OptionCardList";
import { StepCard } from "./StepCard";

interface Props {
  question: string;
  description?: string;
  fieldKey: string;
  options: ConditionOption[];
  value: string;
  onSelect: (value: string) => void;
  showBatteryInfo?: boolean;
  onContinue?: () => void;
  onScreenOriginChange?: (origin: "original" | "replaced") => void;
  onBatteryOriginChange?: (origin: "original" | "replaced") => void;
  onBack?: () => void;
}

function ScreenPreview({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={48}
      height={78}
      className="h-16 w-10 object-contain"
    />
  );
}

function PhoneBackPreview({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={48}
      height={78}
      className="h-16 w-10 object-contain"
    />
  );
}

export default function SingleConditionQuestion({
  question,
  description,
  fieldKey,
  options,
  value,
  onSelect,
  showBatteryInfo = false,
  onContinue,
  onScreenOriginChange,
  onBatteryOriginChange,
  onBack,
}: Props) {
  const [screenStage, setScreenStage] = useState<"origin" | "condition">(
    value ? "condition" : "origin",
  );
  const [screenOrigin, setScreenOrigin] = useState("");
  const [batteryStage, setBatteryStage] = useState<"origin" | "condition">(
    value ? "condition" : "origin",
  );
  const [batteryOrigin, setBatteryOrigin] = useState("");

  const isScreen = fieldKey === "screen";
  const isBattery = fieldKey === "battery" || showBatteryInfo;
  const isFaceId = fieldKey === "faceid";
  const isBackGlass = fieldKey === "backglass";

  const title = showBatteryInfo
    ? "What’s your battery health?"
    : isFaceId
      ? "Does Face ID work?"
      : isScreen
        ? "How does your screen look?"
        : isBackGlass
          ? "How does the back of your phone look?"
          : question;

  const helper = showBatteryInfo
    ? "Choose the range that matches your phone's maximum capacity."
    : isFaceId
      ? "Choose the option that matches your phone right now."
      : isScreen || isBackGlass
        ? "Pick the closest match. Your inspector will confirm it."
        : description;

  const notice = showBatteryInfo ? (
    <>
      Open Settings → Battery → Battery Health &amp; Charging and look for
      “Maximum Capacity”.
    </>
  ) : isFaceId ? (
    <>
      Lock your phone and try unlocking it with your face. If it fails, choose
      “doesn’t work.”
    </>
  ) : undefined;

  const conditionOptions = useMemo(
    () =>
      (isScreen || isBattery
        ? options.filter(
            (option) =>
              !option.label.toLowerCase().includes("changed"),
          )
        : options
      ).map((option) => {
        const image = option.imagePath ? (
          isScreen ? (
            <ScreenPreview src={option.imagePath} />
          ) : isBackGlass ? (
            <PhoneBackPreview src={option.imagePath} />
          ) : undefined
        ) : undefined;

        return {
          value: option.label,
          label: option.label,
          description: option.description,
          image,
          imageSize: isScreen || isBackGlass ? ("preview" as const) : undefined,
        };
      }),
    [options, isScreen, isBackGlass, showBatteryInfo, isFaceId, isBattery],
  );

  if (isScreen && screenStage === "origin") {
    return (
      <StepCard
        title="Has your screen ever been replaced?"
        description="Choose the option that matches your phone."
        noticeTitle="Check first"
        notice={
          <>
            On many newer iPhones, Settings → General → About → Parts and
            Service History lists any replaced parts.
          </>
        }
        showBackButton
        onBack={onBack}
        onContinue={() => setScreenStage("condition")}
        continueDisabled={!screenOrigin}
      >
        <OptionCardList
          value={screenOrigin}
          onChange={(origin) => {
            setScreenOrigin(origin);
            onScreenOriginChange?.(origin as "original" | "replaced");
          }}
          options={[
            {
              value: "original",
              label: "Original screen",
              description:
                "Factory installed screen that has never been replaced.",
            },
            {
              value: "replaced",
              label: "Replaced screen",
              description:
                "Choose this if it was ever changed by Apple or any repair shop.",
            },
          ]}
        />
      </StepCard>
    );
  }

  if (isBattery && batteryStage === "origin") {
    return (
      <StepCard
        title="Has your battery ever been replaced?"
        description="Choose the option that matches your phone."
        noticeTitle="Check first"
        notice={
          <>
            On many newer iPhones, Settings → General → About → Parts and
            Service History lists if the battery was replaced.
          </>
        }
        showBackButton
        onBack={onBack}
        onContinue={() => setBatteryStage("condition")}
        continueDisabled={!batteryOrigin}
      >
        <OptionCardList
          value={batteryOrigin}
          onChange={(origin) => {
            setBatteryOrigin(origin);
            onBatteryOriginChange?.(origin as "original" | "replaced");
          }}
          options={[
            {
              value: "original",
              label: "Original battery",
              description:
                "Factory installed battery that has never been replaced.",
            },
            {
              value: "replaced",
              label: "Replaced battery",
              description:
                "Choose this if your battery was changed by Apple or any repair shop.",
            },
          ]}
        />
      </StepCard>
    );
  }

  return (
    <StepCard
      title={title}
      description={helper}
      notice={notice}
      noticeTitle={notice ? "Check first" : undefined}
      showBackButton
      onBack={
        isScreen
          ? () => setScreenStage("origin")
          : isBattery
            ? () => setBatteryStage("origin")
            : onBack
      }
      onContinue={onContinue}
      continueDisabled={!value}
    >
      <OptionCardList
        options={conditionOptions}
        value={value}
        onChange={onSelect}
      />
    </StepCard>
  );
}
