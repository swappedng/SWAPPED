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
        "rounded-3xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-zinc-100/80 sm:p-7",
        className
      )}
    >
      <header className="mb-6">
        <h1 className="text-xl font-medium tracking-tight text-zinc-900 sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-zinc-500 leading-relaxed">
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
        <div className="mt-6 rounded-2xl bg-zinc-50 p-4 border border-zinc-100 text-xs text-zinc-600 leading-relaxed">
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
