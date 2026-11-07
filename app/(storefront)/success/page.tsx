"use client";

import { Check } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-[#192331] sm:px-6">
      <section className="mx-auto max-w-[800px] pt-16 text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#4c00bd]/10 text-[#4c00bd]">
          <Check className="h-10 w-10" aria-hidden="true" />
        </div>

        <h1 className="text-[clamp(38px,5.2vw,56px)] font-medium leading-[1.03] tracking-[-0.055em] text-[#192331]">
          Swap appointment confirmed
        </h1>

        <p className="mx-auto mt-6 max-w-[520px] text-sm leading-[1.7] tracking-[-0.01em] text-[#69717d] sm:text-base">
          We've received your request and will send you an email to confirm your
          appointment. The final price will be determined after our inspection.
        </p>

        <div className="mt-12">
          <Link
            href="/tradein"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#090909] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-[#4a00bd] focus-visible:outline-offset-3 motion-reduce:transition-none"
          >
            Start a new trade-in
          </Link>
        </div>
      </section>
    </main>
  );
}
