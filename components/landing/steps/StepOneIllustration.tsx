export function StepOneIllustration() {
  return (
    <div
      className="relative mx-auto aspect-[38/27] w-full max-w-[760px]"
      aria-label="iPhone condition checks: Face ID, storage, battery health, screen, and body and frame"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/steps-illustrations/step-1b.svg"
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
          <path d="M367 86 161 80H40" />
          <path d="M415 160 485 101H685" />
          <path d="M400 270 475 235H685" />
          <path d="M310 315 160 283H40" />
          <path d="M470 350 480 356H685" />
        </g>
      </svg>
      <div className="absolute left-[5.3%] top-[10%] text-[clamp(8px,1vw,12px)] leading-tight text-[#192331]">
        <p className="m-0 font-semibold">Face ID</p>
      </div>
      <div className="absolute right-[10%] top-[11%] text-right text-[clamp(8px,1vw,12px)] leading-tight text-[#192331]">
        <p className="m-0 font-semibold">Storage</p>
        <p className="m-0 text-[#69717d]">128 / 256 / 512 GB</p>
      </div>
      <div className="absolute right-[10%] top-[36%] text-right text-[clamp(8px,1vw,12px)] leading-tight text-[#192331]">
        <p className="m-0 font-semibold">Battery health</p>
        <p className="m-0 text-[#69717d]">Max capacity %</p>
      </div>
      <div className="absolute left-[5.3%] top-[44%] text-[clamp(8px,1vw,12px)] leading-tight text-[#192331]">
        <p className="m-0 font-semibold">Screen</p>
        <p className="m-0 text-[#69717d]">Cracks, scratches</p>
      </div>
      <div className="absolute right-[10%] top-[58%] text-right text-[clamp(8px,1vw,12px)] leading-tight text-[#192331]">
        <p className="m-0 font-semibold">Body &amp; frame</p>
        <p className="m-0 text-[#69717d]">Dents, scuffs</p>
      </div>
    </div>
  );
}
