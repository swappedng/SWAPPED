import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/landing/Brand";

export interface TradeInHeaderProps {
  onBack: () => void;
  canGoBack: boolean;
}

export function TradeInHeader({ onBack, canGoBack }: TradeInHeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        disabled={!canGoBack}
        className="gap-1.5 font-semibold text-[#69717d] disabled:invisible hover:bg-[#4c00bd]/5 hover:text-[#4c00bd]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      <Brand />
    </header>
  );
}
