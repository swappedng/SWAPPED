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
    <section id="faqs" className="mx-auto max-w-[850px] scroll-mt-8 px-6 pb-16 pt-[15px] min-[701px]:px-9 min-[701px]:pb-[105px] min-[701px]:pt-7" aria-labelledby="faq-title">
      <div className="text-center"><span className="text-[9px] font-medium tracking-[0.15em] text-[#768599]">A LITTLE CLARITY</span><h2 id="faq-title" className="my-[17px] text-[clamp(30px,3.3vw,43px)] font-medium leading-[1.15] tracking-[-0.05em]">Good questions.<br className="min-[701px]:hidden" /> Straight answers.</h2><p className="mt-[14px] text-[13px] text-[#6e7785]">Everything you need to feel ready for your swap.</p></div>
      <div className="my-6 flex flex-wrap justify-center gap-[6px] min-[701px]:mb-[34px] min-[701px]:mt-7 min-[701px]:gap-2" role="group" aria-label="Filter frequently asked questions">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`cursor-pointer rounded-full border px-[11px] py-2 text-[9px] transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[5px] focus-visible:outline-blue-400 min-[701px]:px-4 min-[701px]:text-[10px] ${category === item ? "border-[#3b82f6] bg-[#3b82f6] text-white" : "border-[#dce3ec] bg-white text-[#687386] hover:bg-[#f3f7fd]"}`}>{item}</button>)}</div>
      <div className="border-t border-[#e5eaf0]">{visibleFaqs.map((faq) => <details key={faq.question} className="group border-b border-[#e5eaf0]"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-[18px] text-xs leading-[1.6] marker:hidden focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[5px] focus-visible:outline-blue-400 group-open:text-[#3b82f6] [&::-webkit-details-marker]:hidden min-[701px]:px-px min-[701px]:py-[21px] min-[701px]:text-[13px]"><span>{faq.question}</span><ChevronDown className="shrink-0 text-[#8b98a8] transition-transform group-open:rotate-180" size={17} aria-hidden="true" /></summary><p className="-mt-0.5 mb-[23px] mr-[30px] max-w-[660px] text-xs leading-[1.8] text-[#6e7785] min-[701px]:text-[13px]">{faq.answer}</p></details>)}</div>
    </section>
  );
}
