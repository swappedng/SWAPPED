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
        "flex items-start gap-3 rounded-2xl bg-zinc-100/80 p-3.5 text-xs text-zinc-700 sm:text-sm border border-zinc-200/60 leading-relaxed",
        className
      )}
    >
      <Info className="h-4 w-4 shrink-0 stroke-[2.2] text-zinc-500 mt-0.5" />
      <div>
        {title && <span className="font-semibold text-zinc-900">{title}: </span>}
        {children}
      </div>
    </aside>
  );
}
