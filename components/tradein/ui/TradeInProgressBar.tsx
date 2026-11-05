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
    <div>
      <div
        className="h-2 w-full overflow-hidden bg-[#e7e2eb]"
        aria-label={`Step ${currentStep} of ${totalSteps}`}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
      >
        <div
          className="h-full rounded-r-full bg-[#7c6ee6] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
