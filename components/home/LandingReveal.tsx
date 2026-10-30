"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = "[data-landing-reveal]:not([data-landing-intro])";

export function LandingReveal() {
  useEffect(() => {
    const root = document.querySelector("#landing-page");
    if (!root) return;

    const elements = Array.from(
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    );
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motionPreference.matches || !("IntersectionObserver" in window)) return;

    const reveal = (element: HTMLElement) => {
      element.classList.remove("landing-reveal-pending");
      element.classList.add("landing-reveal-visible");
      observer.unobserve(element);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    );

    elements.forEach((element) => element.classList.add("landing-reveal-pending"));

    // Give the hidden state a paint before observing elements already in view.
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        elements.forEach((element) => observer.observe(element));
      });
    });

    const showAll = () => {
      if (!motionPreference.matches) return;
      window.cancelAnimationFrame(frame);
      elements.forEach(reveal);
      observer.disconnect();
    };

    motionPreference.addEventListener("change", showAll);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      motionPreference.removeEventListener("change", showAll);
      elements.forEach((element) => {
        element.classList.remove(
          "landing-reveal-pending",
          "landing-reveal-visible",
        );
      });
    };
  }, []);

  return null;
}
