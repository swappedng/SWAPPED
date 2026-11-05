import { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InfoNoticeProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function InfoNotice({ title, children, className }: InfoNoticeProps) {
  return (
    <aside
      className={cn(
        "flex items-start gap-2 rounded-xl border border-[#e7e2eb] bg-[#f8f6f2] p-2 text-xs leading-relaxed text-[#69717d] sm:text-sm",
        className
      )}
    >
      <Info className=" h-4 w-4 shrink-0 stroke-[2.2] text-[#4c00bd]" />
      <div className="text-xs">
        {title && <span className="font-semibold text-[#192331]">{title}: </span>}
        {children}
      </div>
    </aside>
  );
}
