import { ReactNode } from "react";
import { InfoNotice } from "./InfoNotice";
import { StepActions, StepActionsProps } from "./StepActions";
import { OptionCardList } from "./OptionCardList";
import { cn } from "@/lib/utils";

export interface StepCardProps extends StepActionsProps {
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
  notice?: ReactNode;
  noticeTitle?: string;
  className?: string;
}

export function StepCard({
  title,
  description,
  children,
  aside,
  notice,
  noticeTitle,
  showBackButton,
  onBack,
  onContinue,
  continueDisabled,
  continueLabel,
  className,
}: StepCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#e7e2eb] bg-[#fffdfb] p-5 shadow-[0_20px_50px_rgba(25,35,49,0.05)] sm:p-7",
        className,
      )}
    >
      <header className="mb-4">
        <h1 className="text-md font-semibold tracking-tight text-[#192331] sm:text-xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-relaxed text-[#69717d]">
            {description}
          </p>
        )}
      </header>

      {notice && (
        <div className="mb-6">
          <InfoNotice title={noticeTitle}>{notice}</InfoNotice>
        </div>
      )}

      {children}

      {aside && (
        <div className="mt-4 rounded-xl border border-[#e7e2eb] bg-[#f8f6f2] p-4 text-xs leading-relaxed text-[#69717d]">
          {aside}
        </div>
      )}

      <StepActions
        showBackButton={showBackButton}
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={continueDisabled}
        continueLabel={continueLabel}
      />
    </section>
  );
}

export function ChoiceGrid({
  options,
  value,
  onSelect,
}: {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <OptionCardList
      options={options}
      value={value}
      onChange={onSelect}
      layout="grid"
    />
  );
}
