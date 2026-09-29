import * as React from "react";
import { cn } from "@/lib/utils";

export interface PillOption {
  value: string;
  label: string;
  badge?: string;
}

export interface PillSelectorProps {
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PillSelector({
  options,
  value,
  onChange,
  size = "md",
  className,
}: PillSelectorProps) {
  const sizeClasses = {
    sm: "px-3 py-1 text-xs rounded-lg",
    md: "px-3.5 py-1.5 text-sm rounded-2xl",
    lg: "px-4 py-2 text-base rounded-2xl",
  };

  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex items-center justify-center font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 active:scale-[0.98]",
              sizeClasses[size],
              isSelected
                ? "bg-zinc-800 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
            )}
          >
            <span>{option.label}</span>
            {option.badge && (
              <span
                className={cn(
                  "ml-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-zinc-100 text-zinc-600"
                )}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
