import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
        className="gap-1.5 font-semibold text-zinc-600 disabled:invisible hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      <div className="flex items-center gap-2.5 font-bold text-zinc-900 text-lg tracking-tight">
        <img src="/swapped-logo.png" width={26} height={26} alt="Swapped logo" />
        <span>Swapped</span>
      </div>
    </header>
  );
}
