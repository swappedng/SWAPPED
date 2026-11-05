import { Mail } from "lucide-react";
import { Brand } from "@/components/home/Brand";
import { TradeInProgressBar } from "./ui/TradeInProgressBar";

export interface TradeInHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function TradeInHeader({
  currentStep,
  totalSteps,
}: TradeInHeaderProps) {
  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex h-16 max-w-[1640px] items-center justify-between gap-6 px-4 sm:px-9">
        <Brand />
        <a
          href="mailto:support@swapped.com"
          aria-label="Email us at support@swapped.com"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#4c00bd] text-white transition-colors hover:bg-[#5a0fcc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c00bd]"
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          <span
            role="tooltip"
            className="pointer-events-none absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-lg bg-[#192331] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            Email us
          </span>
        </a>
      </div>
      <TradeInProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
    </header>
  );
}
