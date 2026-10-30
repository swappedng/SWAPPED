export interface TradeInProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function TradeInProgressBar({
  currentStep,
  totalSteps,
}: TradeInProgressBarProps) {
  const progress = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className="mb-8">
      <div
        className="mb-2.5 h-3.5 overflow-hidden rounded-full bg-[#dbdad7]/70"
        aria-label={`Step ${currentStep} of ${totalSteps}`}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
      >
        <div
          className="h-full rounded-full bg-[#4c00bd] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* <p className="text-xs font-medium tracking-[0.12em] text-[#4c00bd] uppercase">
        Step {currentStep} of {totalSteps}
      </p> */}
    </div>
  );
}
