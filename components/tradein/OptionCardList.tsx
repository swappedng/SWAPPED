import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface OptionCardItem {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  /** Pass an image, SVG, or temporary icon. Presentation-only. */
  image?: ReactNode;
}

export interface OptionCardListProps {
  options: OptionCardItem[];
  value: string;
  onChange: (value: string) => void;
  layout?: "list" | "grid";
  className?: string;
}

export function OptionCardList({
  options,
  value,
  onChange,
  layout = "list",
  className,
}: OptionCardListProps) {
  return (
    <div
      className={cn(
        layout === "grid"
          ? "grid gap-3 sm:grid-cols-2"
          : "space-y-2.5",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "group relative flex min-h-[56px] w-full items-center justify-between rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 active:scale-[0.99]",
              isSelected
                ? "border-[#18181b] bg-zinc-50/80 text-zinc-900 shadow-xs ring-1 ring-[#18181b]"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50/50"
            )}
          >
            <span className="flex items-center gap-3.5 pr-2">
              {option.image && (
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
                    isSelected
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 group-hover:border-zinc-300"
                  )}
                >
                  {option.image}
                </span>
              )}
              <span className="flex flex-col">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900">
                    {option.label}
                  </span>
                  {option.badge && (
                    <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600">
                      {option.badge}
                    </span>
                  )}
                </span>
                {option.description && (
                  <span className="mt-0.5 text-xs text-zinc-500 leading-relaxed">
                    {option.description}
                  </span>
                )}
              </span>
            </span>

            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                isSelected
                  ? "border-[#18181b] bg-[#18181b] text-white scale-100"
                  : "border-zinc-300 bg-white text-transparent group-hover:border-zinc-400"
              )}
            >
              <Check className={cn("h-3 w-3 stroke-[3]", isSelected ? "opacity-100" : "opacity-0")} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
