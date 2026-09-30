"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const STEP_DURATION = 1000;

const phones = [
  { id: "1", src: "/phones/phone_1.png", left: "25%", top: "40%" },
  { id: "2", src: "/phones/phone_3.png", left: "35%", top: "40%" },
  { id: "3", src: "/phones/phone_2.png", left: "45%", top: "40%" },
  { id: "4", src: "/phones/phone_4.png", left: "55%", top: "40%" },
  { id: "5", src: "/phones/phone_1.png", left: "65%", top: "40%" },
  { id: "6", src: "/phones/phone_3.png", left: "75%", top: "40%" },
  { id: "7", src: "/phones/phone_2.png", left: "85%", top: "40%" },
  { id: "8", src: "/phones/phone_4.png", left: "95%", top: "40%" },
] as const;

export function StepTwoPhoneStack() {
  const figureRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.intersectionRatio >= 0.25),
      { threshold: 0.25 },
    );
    observer.observe(figure);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(motionPreference.matches);

    updatePreference();
    motionPreference.addEventListener("change", updatePreference);

    return () => motionPreference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) {
      setStep(0);
      return;
    }

    const timer = window.setInterval(
      () => setStep((current) => (current + 1) % (phones.length * 2 + 3)),
      STEP_DURATION,
    );

    return () => window.clearInterval(timer);
  }, [isVisible, prefersReducedMotion]);

  return (
    <figure
      ref={figureRef}
      data-landing-reveal
      className="relative mx-auto my-0 h-full min-h-0 w-full max-w-[560px] overflow-hidden [--reveal-delay:150ms] max-[759px]:h-[clamp(240px,34vw,390px)] [@media(max-height:700px)]:h-[clamp(240px,34vw,390px)]"
      role="img"
      aria-label="iPhones arranged in an overlapping, stepped stack"
    >
      {phones.map((phone, index) => {
        const isShifted = step <= phones.length + 1
          ? index < step
          : index >= step - phones.length - 1;

        return (
          <Image
            key={phone.id}
            src={phone.src}
            alt=""
            width={1024}
            height={1536}
            sizes="(max-width: 759px) 140px, 260px"
            draggable={false}
            className="absolute h-[clamp(210px,28vw,280px)] w-auto max-w-none select-none object-contain motion-reduce:!transition-none"
            style={{
              left: `${Number.parseFloat(phone.left) - (isShifted ? 5 : 0)}%`,
              top: phone.top,
              zIndex: index + 1,
              transform: "translate(-50%, -50%)",
              transition: "left 650ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        );
      })}
    </figure>
  );
}
