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
          className="h-11 border-[#4c00bd]/20 px-6 text-sm font-semibold text-[#4c00bd] hover:bg-[#f3effa]"
        >
          Back
        </Button>
      )}
      <Button
        type="button"
        variant="brand"
        onClick={onContinue}
        disabled={continueDisabled}
        className="h-11 flex-1 text-sm font-semibold"
      >
        {continueLabel}
      </Button>
    </div>
  );
}
