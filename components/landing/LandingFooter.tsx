import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-background [background-image:radial-gradient(ellipse_at_82%_145%,#c7f978_0%,transparent_22%),radial-gradient(ellipse_at_13%_150%,#8b55ec_0%,transparent_24%)] px-6 pb-5 pt-14 min-[701px]:px-9 min-[701px]:pb-7 min-[701px]:pt-20">
     <div className="relative mx-auto max-w-[1440px]">
        <Link
          data-landing-reveal
          href="/"
          className="group flex items-center justify-center gap-3 text-[#192331] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#4c00bd] focus-visible:outline-offset-[8px] min-[701px]:gap-6"
          aria-label="Swapped home"
        >
          <span className="text-[clamp(64px,14.5vw,218px)] font-bold leading-none tracking-wider opacity-10 transition-opacity group-hover:opacity-20 duration-200 min-[701px]:text-[clamp(64px,10vw,218px)]">
            swapped<span className="text-[#4c00bd]">.</span>
          </span>
        </Link>
        <div className="mt-10 flex items-center justify-between border-t border-[#4c00bd]/15 pt-4 text-[10px] font-medium tracking-[0.04em] min-[701px]:mt-14">
          <span>© {new Date().getFullYear()} Swapped</span>
        </div>
      </div>
    </footer>
  );
}
