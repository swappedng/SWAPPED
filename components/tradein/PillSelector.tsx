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
    sm: "px-3 py-1.5 text-xs rounded-full",
    md: "px-3.5 py-2 text-sm rounded-full",
    lg: "px-4 py-2.5 text-base rounded-full",
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
              "relative inline-flex items-center justify-center border font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#4c00bd]/30 active:scale-[0.98]",
              sizeClasses[size],
              isSelected
                ? "border-[#4c00bd] bg-[#f3effa] text-[#4c00bd]"
                : "border-[#e7e2eb] bg-[#fffdfb] text-[#192331] hover:border-[#4c00bd]/35 hover:bg-[#f8f5fc]"
            )}
          >
            <span>{option.label}</span>
            {option.badge && (
              <span
                className={cn(
                  "ml-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isSelected
                    ? "bg-[#4c00bd]/10 text-[#4c00bd]"
                    : "bg-[#4c00bd]/8 text-[#4c00bd]"
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
