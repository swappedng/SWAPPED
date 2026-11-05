import Link from "next/link";
import { Check } from "lucide-react";
import { Brand } from "@/components/home/Brand";
import { Button } from "@/components/ui/button";

export default function ConfirmPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-[#192331] sm:px-6">
      <header className="mx-auto mb-8 flex h-16 max-w-[1640px] items-center justify-start px-1 sm:px-3">
        <Brand />
      </header>
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#e7e2eb] bg-[#fffdfb] p-6 text-center shadow-[0_20px_50px_rgba(25,35,49,0.05)] sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#4c00bd]/10 text-[#4c00bd]">
          <Check className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#192331] sm:text-3xl">
          Trade-in submitted!
        </h1>
        <p className="mt-2 text-sm font-medium text-[#4c00bd]">
          Thank you for choosing SWAPPED.
        </p>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#69717d] sm:text-base">
          We&apos;ve received your request and will send you an email to confirm
          your appointment. The final price will be determined after our
          inspection.
        </p>
        <Button asChild variant="brand" className="mt-7 h-11">
          <Link href="/tradein">Start a new trade-in</Link>
        </Button>
      </div>
    </main>
  );
}
