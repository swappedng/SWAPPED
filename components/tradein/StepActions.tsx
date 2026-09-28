import { Button } from "@/components/ui/button";

export interface StepActionsProps {
  showBackButton?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
}

export function StepActions({
  showBackButton = false,
  onBack,
  onContinue,
  continueDisabled = false,
  continueLabel = "Continue",
}: StepActionsProps) {
  if (!onContinue) return null;

  return (
    <div className="mt-6 flex items-center gap-3">
      {showBackButton && (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 px-6 text-sm font-semibold"
        >
          Back
        </Button>
      )}
      <Button
        type="button"
        variant="default"
        onClick={onContinue}
        disabled={continueDisabled}
        className="h-11 flex-1 text-sm font-semibold"
      >
        {continueLabel}
      </Button>
    </div>
  );
}
