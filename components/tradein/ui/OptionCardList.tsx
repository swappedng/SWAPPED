import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface OptionCardItem<T = string> {
  value: T;
  label: string;
  description?: string;
  badge?: string;
  /** Pass an image, SVG, or temporary icon. Presentation-only. */
  image?: ReactNode;
  imageSize?: "standard" | "preview";
}

export interface OptionCardListProps<T = string> {
  options: OptionCardItem<T>[];
  value: T;
  onChange: (value: T) => void;
  layout?: "list" | "grid";
  className?: string;
}

export function OptionCardList<T = string>({
  options,
  value,
  onChange,
  layout = "list",
  className,
}: OptionCardListProps<T>) {
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
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "group relative flex w-full items-start justify-between rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#4c00bd]/30 active:scale-[0.99]",
              isSelected
                ? "border-[#4c00bd] bg-[#f3effa] text-[#192331]"
                : "border-[#e7e2eb] bg-[#fffdfb] text-[#192331] hover:border-[#4c00bd]/35 hover:bg-[#f8f5fc]"
            )}
          >
            <span className="flex items-center gap-3 pr-2">
              {option.image && (
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
                    option.imageSize === "preview"
                      ? "h-16 w-12 border-0 bg-transparent"
                      : cn(
                          "h-9 w-9",
                          isSelected
                            ? "border-[#4c00bd]/15 bg-white text-[#4c00bd]"
                            : "border-[#e7e2eb] bg-[#f8f6f2] text-[#69717d] group-hover:border-[#4c00bd]/25"
                        )
                  )}
                >
                  {option.image}
                </span>
              )}
              <span className="flex flex-col">
                <span className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#192331]">
                    {option.label}
                  </span>
                  {option.badge && (
                    <span className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      isSelected ? "bg-[#4c00bd]/10 text-[#4c00bd]" : "bg-[#f3effa] text-[#4c00bd]"
                    )}>
                      {option.badge}
                    </span>
                  )}
                </span>
                {option.description && (
                  <span className="mt-0.5 text-xs leading-relaxed tracking-relaxed text-[#69717d]">
                    {option.description}
                  </span>
                )}
              </span>
            </span>

            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all mt-0.5",
                isSelected
                  ? "border-[#4c00bd] bg-[#4c00bd] text-white scale-100"
                  : "border-[#e7e2eb] bg-white text-transparent group-hover:border-[#4c00bd]/45"
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
