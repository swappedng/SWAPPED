"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const categories = ["All", "Your device", "Value & payment", "The swap"] as const;
const faqs = [
  { category: "Your device", question: "Which iPhones can I trade in?", answer: "Choose your model and storage in the trade-in form to see whether it’s currently supported. The available models are kept up to date with our catalogue." },
  { category: "Your device", question: "Can I swap a phone with a cracked screen or a replaced battery?", answer: "Tell us about the screen, battery and any repairs in the condition questions. These details affect your estimate, and we’ll confirm the device’s condition during inspection." },
  { category: "Value & payment", question: "How much will I need to add?", answer: "Your estimated top-up is the price of your next iPhone minus the estimated value of your current one. You’ll see a range after choosing your upgrade, with the final amount confirmed after inspection." },
  { category: "Value & payment", question: "Is the online estimate the final price?", answer: "It’s an estimate based on the details you share. We inspect your phone to confirm its condition and final trade-in value before the swap is completed." },
  { category: "The swap", question: "Do I need to visit a store?", answer: "You can choose a walk-in swap or request dispatch pickup when completing your request. The team will coordinate the inspection and exchange with you." },
  { category: "The swap", question: "What should I do before handing over my iPhone?", answer: "Back up your photos, messages and other important data. Before handing over the phone, sign out of your Apple Account, turn off Find My, and erase your personal data. Keep your SIM or transfer your eSIM to your next device." },
];

export function FaqSection() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const visibleFaqs = faqs.filter((faq) => category === "All" || faq.category === category);

  return (
    <section
      id="faqs"
      className="mx-auto max-w-[1240px] scroll-mt-8 px-6 pb-24 pt-8 min-[701px]:px-9 min-[701px]:pb-28 min-[701px]:pt-32"
      aria-labelledby="faq-title"
    >
      <div data-landing-reveal className="mb-8 flex flex-col items-center text-center min-[701px]:mb-11">
        <h2
          id="faq-title"
          className="text-[clamp(32px,3.6vw,48px)] font-semibold leading-[1.08] tracking-[-0.05em] text-[#192331]"
        >
         We are here to answer your questions.
        </h2>
      </div>

      <div className="relative overflow-hidden p-3 min-[701px]:rounded-[32px] min-[701px]:p-5">
        <div className="relative mx-auto max-w-[880px]">
          <div
            data-landing-reveal
            className="mb-4 flex flex-wrap justify-center gap-2 min-[701px]:mb-5"
            role="group"
            aria-label="Filter frequently asked questions"
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={`cursor-pointer rounded-full border px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[4px] focus-visible:outline-[#4c00bd] min-[701px]:px-4 ${category === item ? "border-[#4c00bd]/15 bg-[#4c00bd]/85 text-white" : "border-[#4c00bd]/15 bg-[#fffdfb] text-[#131313] hover:bg-[#ede3fb]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div data-landing-reveal className="overflow-hidden rounded-[22px] border border-[#e7e2eb] bg-white/55 [--reveal-delay:90ms]">
            {visibleFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group border-b border-[#4c00bd]/10 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-sm font-medium leading-[1.5] text-[#192331] marker:hidden focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-[#4c00bd] [&::-webkit-details-marker]:hidden min-[701px]:px-7 min-[701px]:py-5 min-[701px]:text-[15px]">
                  <span>{faq.question}</span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#4c00bd]/7 text-[#4c00bd] transition-colors ">
                    <ChevronDown
                      className="transition-transform group-open:rotate-180"
                      size={16}
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <p className="-mt-1 mb-6 max-w-[720px] px-5 text-sm leading-[1.7] text-[#69717d] min-[701px]:mb-7 min-[701px]:px-7">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
