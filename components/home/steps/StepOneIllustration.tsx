import type { CSSProperties } from "react";

const callouts = [
  {
    title: "Face ID",
    detail: null,
    path: "M367 86 161 80H40",
    position: "left-[5.3%] top-[10%]",
    delay: "0ms",
  },
  {
    title: "Storage",
    detail: "128 / 256 / 512 GB",
    path: "M415 160 485 101H685",
    position: "right-[10%] top-[11%] text-right",
    delay: "120ms",
  },
  {
    title: "Battery health",
    detail: "Max capacity %",
    path: "M400 270 475 235H685",
    position: "right-[10%] top-[36%] text-right",
    delay: "240ms",
  },
  {
    title: "Screen",
    detail: "Cracks, scratches",
    path: "M310 315 160 283H40",
    position: "left-[5.3%] top-[44%]",
    delay: "360ms",
  },
  {
    title: "Body & frame",
    detail: "Dents, scuffs",
    path: "M470 350 480 356H685",
    position: "right-[10%] top-[58%] text-right",
    delay: "480ms",
  },
] as const;

export function StepOneIllustration() {
  return (
    <div
      data-landing-reveal
      role="img"
      className="relative mx-auto aspect-[38/27] w-full max-w-[760px] [--reveal-delay:150ms]"
      aria-label="iPhone condition checks: Face ID, storage, battery health, screen, and body and frame"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/steps-illustrations/step-1.svg"
        alt=""
        className="absolute inset-0 block size-full"
      />
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 760 540"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#35333b" strokeWidth="1.25">
          {callouts.map((callout) => (
            <path
              key={callout.title}
              d={callout.path}
              pathLength={1}
              className="step-one-callout-line"
              style={{ "--callout-delay": callout.delay } as CSSProperties}
            />
          ))}
        </g>
      </svg>
      {callouts.map((callout) => (
        <div
          key={callout.title}
          className={`step-one-callout-label absolute text-[clamp(8px,1vw,12px)] leading-tight text-[#192331] ${callout.position}`}
          style={{ "--callout-delay": callout.delay } as CSSProperties}
        >
          <p className="m-0 font-semibold">{callout.title}</p>
          {callout.detail && <p className="m-0 text-[#69717d]">{callout.detail}</p>}
        </div>
      ))}
    </div>
  );
}
