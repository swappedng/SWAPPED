import type { ReactNode } from "react";

export function ExpandingSection({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <section
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`min-h-0 overflow-hidden transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
          isOpen
            ? "translate-y-0 opacity-100 delay-100"
            : "-translate-y-2 opacity-0"
        }`}
      >
        {children}
      </section>
    </div>
  );
}
