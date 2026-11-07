"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

const money = (value: number) => `₦${Math.max(0, value).toLocaleString()}`;

export interface ContactSummaryStepProps {
  amountToPay: number;
  tradeInPhone: string;
  nextPhone: string;
  nextPhonePrice: number;
  category: string;
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function ContactSummaryStep({
  amountToPay,
  tradeInPhone,
  nextPhone,
  nextPhonePrice,
  category,
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  onBack,
  onContinue,
}: ContactSummaryStepProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    /^[+\d][\d\s()-]{6,}$/.test(phone);
  const lower = Math.max(0, amountToPay - 20000);
  const upper = Math.max(0, amountToPay + 20000);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (valid) onContinue();
  };

  return (
    <section
      aria-labelledby="estimate-title"
      className="overflow-hidden rounded-[28px] border border-[#e7e2eb] bg-[#fffdfb] shadow-[0_20px_50px_rgba(25,35,49,0.05)]"
    >
      <div className="px-5 pt-9 sm:px-9 sm:pt-11">
        <div className="text-center">
          <p className="text-sm font-medium text-[#69717d]">
            Estimated amount you’ll pay
          </p>
          <h1
            id="estimate-title"
            className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-3xl font-semibold text-[#192331] sm:gap-x-3"
          >
            <span className="whitespace-nowrap">{money(lower)}</span>
            <span className="font-normal text-[#4c00bd]/25">–</span>
            <span className="whitespace-nowrap">{money(upper)}</span>
          </h1>
          <p className="mt-2 text-xs text-[#69717d] opacity-70 sm:text-sm">
            Final amount confirmed after we inspect your device.
          </p>
        </div>

        {/* <button
          type="button"
          onClick={() => setShowBreakdown((current) => !current)}
          aria-expanded={showBreakdown}
          aria-controls="estimate-breakdown"
          className="mx-auto mt-7 flex items-center gap-1 text-xs font-medium text-[#69717d] transition-colors hover:text-[#192331] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4c00bd]"
        >
          {showBreakdown ? "Hide price breakdown" : "See price breakdown"}
          <ChevronDown
            className={`size-3.5 transition-transform ${showBreakdown ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button> */}

        {/* <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
            showBreakdown ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id="estimate-breakdown"
              aria-hidden={!showBreakdown}
              className={`mt-6 border-y border-[#e7e2eb] py-3 text-sm transition-[opacity,transform] duration-200 ease-out sm:text-base motion-reduce:transition-none ${
                showBreakdown
                  ? "translate-y-0 opacity-100 delay-100"
                  : "-translate-y-2 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between gap-5 py-3 text-[#69717d]">
                <span>{nextPhone}{category && ` · ${category}`}</span>
                <span className="shrink-0">{money(nextPhonePrice)}</span>
              </div>
              <div className="flex items-center justify-between gap-5 border-t border-[#e7e2eb] py-3 text-[#69717d]">
                <span>Your trade-in estimate</span>
                <span className="shrink-0">− {money(upper)}</span>
              </div>
              <div className="flex items-center justify-between gap-5 border-t border-[#e7e2eb] pt-4 font-semibold text-[#192331]">
                <span>You pay</span>
                <span className="shrink-0">{money(lower)} – {money(upper)}</span>
              </div>
              <p className="mt-4 text-xs text-[#69717d]">Trading in: {tradeInPhone}</p>
            </div>
          </div>
        </div> */}
      </div>

      <form
        onSubmit={submit}
        className="mt-9 border-t border-[#e7e2eb] px-5 py-7 sm:px-9 sm:py-8"
      >
        <h2 className="mb-5 text-xl font-semibold tracking-[-0.03em] text-[#192331]">
          Where should we send your estimate?
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="estimate-email"
              className="mb-1.5 block text-xs font-medium text-[#192331]"
            >
              Email address
            </label>
            <Input
              id="estimate-email"
              name="email"
              autoComplete="email"
              required
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              className="h-11 text-base sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="estimate-phone"
              className="mb-1.5 block text-xs font-medium text-[#192331]"
            >
              Phone number
            </label>
            <Input
              id="estimate-phone"
              name="phone"
              autoComplete="tel"
              required
              type="tel"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="0801 234 5678"
              className="h-11 text-base sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-11 border-[#4c00bd]/20 px-6 text-sm font-semibold text-[#4c00bd] hover:bg-[#f3effa]"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="brand"
            disabled={!valid}
            className="h-11 flex-1 font-medium"
          >
            Continue
          </Button>
        </div>
        <p className="mt-2.5 text-center text-xs text-[#69717d]">
          Next, choose how you’d like to complete your swap.
        </p>
      </form>
    </section>
  );
}
