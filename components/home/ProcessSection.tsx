"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { StepOneIllustration } from "./steps/StepOneIllustration";
import { StepTwoPhoneStack } from "./steps/StepTwoPhoneStack";
import { StepThreeIllustration } from "./steps/StepThreeIllustration";

type ProcessStep = {
  number: string;
  title: string;
  copy: string;
  image: string | null;
};

const steps: ProcessStep[] = [
  {
    number: "01",
    title: "Tell us about your iPhone",
    copy: "Pick your model and answer a few quick questions about its condition. That's all we need for your estimate.",
    image: "/steps-illustrations/step-1.svg",
  },
  {
    number: "02",
    title: "Choose your next iPhone",
    copy: "See your estimated top-up upfront, then get the full breakdown by email so you can decide in your own time.",
    image: "/phones/phone_1.png",
  },
  {
    number: "03",
    title: "Swap it your way",
    copy: "Yours or mine? We'll inspect your device, confirm its value, and complete your swap wherever you want.",
    image: "/steps-illustrations/step-3.png",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ProcessSection() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const cards = Array.from(
      list.querySelectorAll<HTMLElement>("[data-stack-card]"),
    );
    if (cards.length === 0) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const updateProgress = () => {
      frame = 0;

      if (motionQuery.matches) {
        cards.forEach((card) => card.style.setProperty("--p", "0"));
        return;
      }

      const viewportHeight = window.innerHeight;
      // Read every position before writing styles to keep scroll work in one frame.
      const progress = cards.map((card, index) => {
        if (index === cards.length - 1) {
          return 0;
        }
        const nextTop = cards[index + 1].getBoundingClientRect().top;
        const nextStyles = getComputedStyle(cards[index + 1]);
        if (nextStyles.position !== "sticky") return 0;
        const stuckTop = Number.parseFloat(nextStyles.top);
        if (!Number.isFinite(stuckTop)) return 0;
        return 1 - clamp((nextTop - stuckTop) / (viewportHeight * 0.55), 0, 1);
      });
      cards.forEach((card, index) =>
        card.style.setProperty("--p", progress[index].toFixed(4)),
      );
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    motionQuery.addEventListener("change", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      motionQuery.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  return (
    <section
      id="how-it-works"
      className="[--peek:80px] [--heading-height:176px] [--stack-height:min(680px,calc(100svh-40px))] [--heading-stage-height:calc(var(--stack-height)*2-var(--heading-height)-var(--peek)*3)] max-[759px]:[--peek:104px]"
      aria-labelledby="process-title"
    >
      <div className="h-[120px] max-[759px]:h-16" aria-hidden="true" />
      <div
        ref={listRef}
        className="relative mx-auto max-w-[1440px] px-24 max-[759px]:px-4"
      >
        <div className="relative mb-[calc(var(--heading-height)-var(--heading-stage-height))] h-[var(--heading-stage-height)] [@media(max-height:700px)]:mb-0 [@media(max-height:700px)]:h-auto">
          <header
            data-stack-heading
            className="pointer-events-none sticky top-[calc(16px+env(safe-area-inset-top,0px))] z-10 box-border flex h-[var(--heading-height)] flex-col items-center justify-center gap-2.5 bg-background px-6 pb-24 text-center [@media(max-height:700px)]:relative [@media(max-height:700px)]:top-auto"
          >
            <h2
              id="process-title"
              data-landing-reveal
              className="m-0 text-[clamp(28px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.035em] text-[#192331]"
            >
              Effortless Steps to Upgrade
            </h2>
      
          </header>
        </div>
        <div className="relative">
          {steps.map((step, index) => (
            <section
              key={step.number}
              data-stack-card
              className="sticky top-[calc(16px+env(safe-area-inset-top,0px)+var(--heading-height)+var(--i)*var(--peek))] z-[calc(1+var(--i))] bg-background mx-auto grid h-[calc(var(--stack-height)-var(--heading-height)-var(--i)*var(--peek))] w-full scroll-mt-[calc(16px+var(--heading-height)+var(--i)*var(--peek))] grid-cols-[1.06fr_1fr] grid-rows-[var(--peek)_minmax(0,1fr)] overflow-hidden border-y border-[#e7e2eb] [--p:0] max-[759px]:h-auto max-[759px]:min-h-[calc(var(--stack-height)-var(--heading-height)-var(--i)*var(--peek))] max-[759px]:grid-cols-1 max-[759px]:grid-rows-[var(--peek)_auto] max-[759px]:rounded-t-2xl [@media(max-height:700px)]:relative [@media(max-height:700px)]:top-auto [@media(max-height:700px)]:h-auto [@media(max-height:700px)]:min-h-[calc(var(--stack-height)-var(--heading-height)-var(--i)*var(--peek))] [@media(max-height:700px)]:mb-6"
              style={{ "--i": index } as CSSProperties}
              aria-labelledby={`process-step-${index + 1}-title`}
            >
              <header className="col-span-full grid h-[var(--peek)] grid-cols-[120px_minmax(0,1fr)] items-center px-10 py-4 max-[759px]:grid-cols-1 max-[759px]:content-center max-[759px]:gap-1.5 max-[759px]:px-5 max-[759px]:py-3">
                <p className="relative z-[2] m-0 ">
                  <span className="text-[24px] font-medium leading-none tracking-[-0.06em] text-[#4c00bd] sm:text-[22px]">
                    {step.number}
                  </span>
                </p>
                <h2
                  id={`process-step-${index + 1}-title`}
                  data-landing-reveal
                  className="relative z-[2] m-0 text-[clamp(22px,2.3vw,32px)] font-semibold leading-[1.2] tracking-[-0.03em] text-[#192331] max-[759px]:whitespace-normal max-[759px]:text-[22px]"
                >
                  {step.title}
                </h2>
              </header>
              <div
                data-landing-reveal
                className={`${step.image ? "" : "col-span-full"} min-w-0 pb-10 pl-40 pr-8 pt-5 [--reveal-delay:90ms] max-[759px]:px-5 max-[759px]:pb-6 max-[759px]:pt-4`}
              >
                <p className="m-0 max-w-[30ch] text-[18px] font-medium leading-[1.5] text-[#69717d] opacity-[calc(1-var(--p)*1.6)] max-[759px]:text-[16px] motion-reduce:opacity-100">
                  {step.copy}
                </p>
              </div>
              <div
                hidden={!step.image}
                className="min-h-0 min-w-0 self-stretch bg-background opacity-[calc(1-var(--p)*0.9)] max-[759px]:h-auto max-[759px]:min-h-[100px] motion-reduce:opacity-100"
              >
                {step.number === "01" ? (
                  <StepOneIllustration />
                ) : step.number === "02" ? (
                  <StepTwoPhoneStack />
                ) : step.number === "03" ? (
                  <StepThreeIllustration />
                ) : step.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={step.image}
                    alt=""
                    className="block size-full object-cover"
                  />
                ) : null}
              </div>
            </section>
          ))}
        </div>
        <div
          className="h-[25svh] [@media(max-height:700px)]:h-12"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
