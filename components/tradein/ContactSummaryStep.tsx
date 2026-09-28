"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, Mail } from "lucide-react";

const money = (value: number) => `₦${Math.max(0, value).toLocaleString()}`;

export interface ContactSummaryStepProps {
  amountToPay: number;
  tradeInPhone: string;
  nextPhone: string;
  category: string;
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onContinue: () => void;
}

export function ContactSummaryStep({
  amountToPay,
  tradeInPhone,
  nextPhone,
  category,
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  onContinue,
}: ContactSummaryStepProps) {
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
      className="overflow-hidden rounded-3xl border border-zinc-100/80 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
    >
      <div className="px-5 py-6 sm:px-7">
        {/* <header className="text-center">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50">
            <Check aria-hidden="true" className="h-4 w-4 text-zinc-700" />
          </div>
          <h1 id="estimate-title" className="text-xl font-medium tracking-tight text-zinc-900 sm:text-2xl">
            Your next iPhone is closer.
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 sm:text-sm">
            Your estimate is ready. Here’s what your upgrade looks like.
          </p>
        </header> */}

        <div className="py-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Estimated top-up
          </p>
          <p className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-[clamp(1.25rem,4vw,2rem)] font-medium leading-tight tracking-tight text-zinc-900 sm:gap-x-3">
            <span className="whitespace-nowrap">{money(lower)}</span>
            <span className="font-normal text-zinc-300">–</span>
            <span className="whitespace-nowrap">{money(upper)}</span>
          </p>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-zinc-500">
            Final amount confirmed after we inspect your device.
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 sm:gap-4 sm:p-4">
          <div className="min-w-0 text-right">
            <p className="text-xs text-zinc-500">Trading in</p>
            <p className="mt-1 break-words text-sm font-medium leading-snug text-zinc-700">
              {tradeInPhone}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white">
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs text-zinc-500">
              Upgrading to{category && <span className="text-zinc-400"> · {category}</span>}
            </p>
            <p className="mt-1 break-words text-sm font-medium leading-snug text-zinc-900">
              {nextPhone}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-5 sm:px-7">
        <div className="mb-4 flex items-start gap-2.5">
          <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          <div>
            <h2 className="text-sm font-medium tracking-tight text-zinc-900">
              Keep the details handy.
            </h2>
            <p id="estimate-email-note" className="mt-1 text-xs leading-relaxed text-zinc-500">
              We’ll email you the full breakdown.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="estimate-email" className="mb-1.5 block text-xs font-medium text-zinc-700">
              Email address
            </label>
            <Input
              id="estimate-email"
              name="email"
              autoComplete="email"
              aria-describedby="estimate-email-note"
              required
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              className="h-11 text-base sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="estimate-phone" className="mb-1.5 block text-xs font-medium text-zinc-700">
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

        <Button type="submit" disabled={!valid} className="mt-4 h-11 w-full font-medium">
          Continue
          <ArrowRight aria-hidden="true" />
        </Button>
        <p className="mt-2.5 text-center text-xs text-zinc-500">
          Next, choose how you’d like to complete your swap.
        </p>
      </form>
    </section>
  );
}
