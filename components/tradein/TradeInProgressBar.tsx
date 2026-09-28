export interface TradeInProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function TradeInProgressBar({
  currentStep,
  totalSteps,
}: TradeInProgressBarProps) {
  return (
    <div className="mb-8">
      <div
        className="mb-2.5 flex gap-1.5"
        aria-label={`Step ${currentStep} of ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompletedOrActive = index < currentStep;
          return (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                isCompletedOrActive ? "bg-zinc-900" : "bg-zinc-200"
              }`}
            />
          );
        })}
      </div>
      <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}
