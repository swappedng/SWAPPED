"use client";

import Image from "next/image";
import type { PointerEvent } from "react";

export function SwapIllustration() {
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    element.style.setProperty("--tilt-x", `${(0.5 - y) * 16}deg`);
    element.style.setProperty("--tilt-y", `${(x - 0.5) * 20}deg`);
    element.style.setProperty("--gleam-x", `${x * 100}%`);
    element.style.setProperty("--gleam-y", `${y * 100}%`);
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--gleam-x", "50%");
    element.style.setProperty("--gleam-y", "50%");
  }

  return (
    <figure
      className="relative mx-auto mt-7 grid max-w-[720px] items-end sm:mt-5"
      aria-label="iPhone shown from the front and back. Devices shown are illustrative."
    >
      <div className="relative flex min-w-0 flex-col items-center">
        <div className="relative flex h-[210px] w-full items-end justify-center sm:h-[280px] [perspective:900px]">
          <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="group relative aspect-[542/668] h-[210px] w-auto max-w-full cursor-default sm:h-[280px] motion-reduce:!transform-none motion-reduce:!transition-none"
            style={{
              transform: "rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
              transition: "transform 220ms ease-out",
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              src="/iphone_img.png"
              alt=""
              width={542}
              height={668}
              sizes="(max-width: 639px) 170px, 227px"
              priority
              draggable={false}
              className="relative h-full w-auto max-w-full select-none object-contain mix-blend-multiply"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
              style={{
                backgroundImage:
                  "radial-gradient(circle at var(--gleam-x, 50%) var(--gleam-y, 50%), rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.2) 22%, transparent 52%)",
                transform: "translateZ(1px)",
              }}
            />
          </div>
        </div>
      </div>
    </figure>
  );
}
