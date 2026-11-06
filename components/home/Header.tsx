
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Brand } from "./Brand";

export function Header() {
  return (
    <header className="sticky top-0 z-50 mx-auto flex h-20 max-w-[1640px] items-center justify-between gap-6 bg-background/90 px-5 backdrop-blur-md min-[701px]:h-20 min-[701px]:px-9">
      <Brand />
      <Link
        href="/tradein"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#090909] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-[#4a00bd] focus-visible:outline-offset-3 sm:h-11 sm:px-6 sm:text-sm"
      >
        Swap your phone
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </header>
  );
}
