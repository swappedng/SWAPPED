import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 active:scale-[0.99] disabled:pointer-events-none disabled:bg-black/60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#18181b] text-white shadow-sm hover:bg-[#27272a] active:bg-[#09090b]",
        brand:
          "bg-[#4c00bd] text-white shadow-sm hover:bg-[#5a0fcc] active:bg-[#3d0099]",
        outline:
          "border border-zinc-300 bg-white text-zinc-900 shadow-xs hover:border-zinc-400 hover:bg-zinc-50/80 active:bg-zinc-100",
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 active:bg-zinc-200",
        ghost:
          "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 active:bg-zinc-200",
        link: "text-zinc-900 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 rounded-lg px-3 text-xs",
        default: "h-9 px-4 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
