"use client";

import { useRouter } from "next/navigation";
import { SwapIllustration } from "./SwapIllustration";
import SwapPicker from "./SwapPicker";

// Use process facts until verified customer or performance metrics are available.
const proofPoints = [
  { value: "3", label: "simple steps", detail: "From your estimate to your upgrade." },
  { value: "2", label: "ways to swap", detail: "Choose pickup or a store visit." },
  { value: "1", label: "clear breakdown", detail: "See your estimated top-up upfront." },
];

export function HeroSection() {
  const router = useRouter();

  const handleStartSwap = (have: string | null) => {
    if (have) {
      localStorage.setItem("selectedHavePhone", have);
    } else {
      localStorage.removeItem("selectedHavePhone");
    }
    localStorage.removeItem("selectedWantPhone");
    localStorage.removeItem("tradeInFlowState");
    router.push('/tradein');
  };

  return (
    <section
      id="hero"
      className="mx-auto max-w-[1200px] scroll-mt-8 px-5 pb-8 pt-10 text-center sm:px-8 "
      aria-labelledby="hero-title"
    >
      <div className="mx-auto max-w-[800px] ">

        <h1
          id="hero-title"
          data-landing-reveal
          data-landing-intro
          className="text-[clamp(38px,5.2vw,56px)] capitalize font-medium leading-[1.03] tracking-[-0.055em] text-[#192331] "
        >
          Upgrade your iPhone
          <br />
          without paying full price
        </h1>
        <p data-landing-reveal data-landing-intro className="mx-auto mt-6 max-w-[520px] text-sm leading-[1.7] tracking-[-0.01em] text-[#69717d] [--reveal-delay:90ms] sm:text-base">
          Put the value of your current iPhone towards your next one. See your
          estimated top-up before you decide.
        </p>
        <div data-landing-reveal data-landing-intro className="relative z-10 mt-12 [--reveal-delay:180ms]">
          <SwapPicker onStart={handleStartSwap} />
        </div>
      </div>

      <div className="relative mx-auto max-w-[1080px] mt-12 sm:mt-16">
        <SwapIllustration />

        <ul
          data-landing-reveal
          className="relative z-10 mx-auto -mt-6 grid max-w-[960px] grid-cols-1 rounded-2xl border border-[#e7e2eb]/90 bg-white/75 px-6 py-2 text-left shadow-[0_12px_36px_rgba(53,28,79,0.12)] backdrop-blur-md [--reveal-delay:90ms] sm:absolute sm:inset-x-0 sm:bottom-0 sm:mt-0 sm:grid-cols-3 sm:px-2 sm:py-6"
        >
          {proofPoints.map(({ value, label, detail }) => (
            <li
              key={label}
              className="flex items-center gap-5 border-b border-[#e7e2eb] py-5 last:border-0 sm:justify-center sm:gap-3 sm:border-b-0 sm:border-r sm:px-4 sm:py-0 lg:gap-4"
            >
              <p className="min-w-8 text-[40px] font-medium leading-none tracking-[-0.06em] text-[#4c00bd] sm:text-[44px]">
                {value}
              </p>
              <div>
                <p className="text-sm font-medium text-[#293140]">{label}</p>
                <p className="mt-1 text-[11px] leading-relaxed tracking-normal text-[#747b84]">
                  {detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
