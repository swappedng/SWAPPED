import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./Brand";

export function LandingFooter() {
  return (
    <footer className="border-t border-[#eaf0f8] bg-[#f4f8fd] px-6 pb-[25px] pt-[34px] min-[701px]:px-[max(36px,calc((100vw-1098px)/2))] min-[701px]:pb-[26px] min-[701px]:pt-[50px]">
      <div className="block pb-[30px] min-[701px]:flex min-[701px]:items-center min-[701px]:justify-between min-[701px]:gap-6 min-[701px]:pb-[43px]"><div><span className="text-[9px] font-medium tracking-[0.15em] text-[#768599]">YOUR NEXT CHAPTER STARTS HERE</span><h2 className="mt-3 text-[30px] font-medium leading-[1.15] tracking-[-0.05em] min-[701px]:text-[35px]">Ready when you are.</h2></div><Link href="/tradein" className="button-primary mt-[22px] gap-2 px-3 py-2 text-[13px] tracking-[0.9px] min-[701px]:mt-0">Let’s swap <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-[#dfe8f2] pt-[29px]"><div><Brand /><p className="mt-[9px] text-[10px] text-[#7b8798]">A simpler way to your next iPhone.</p></div><nav className="order-1 flex w-full items-center gap-[22px] text-[11px] text-[#647287] min-[701px]:order-none min-[701px]:w-auto min-[701px]:gap-6" aria-label="Footer navigation"><a className="hover:text-[#3b82f6] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[5px] focus-visible:outline-blue-400" href="#how-it-works">How it works</a><a className="hover:text-[#3b82f6] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[5px] focus-visible:outline-blue-400" href="#faqs">FAQs</a><Link className="inline-flex items-center gap-[5px] hover:text-[#3b82f6] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[5px] focus-visible:outline-blue-400" href="/tradein">Start your swap <ArrowUpRight size={13} aria-hidden="true" /></Link></nav><span className="ml-auto text-[9px] text-[#8895a5] min-[701px]:ml-0 min-[701px]:text-[10px]">© {new Date().getFullYear()} Swapped</span></div>
    </footer>
  );
}
