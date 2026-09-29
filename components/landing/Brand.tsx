import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-[24px] font-bold tracking-[-1.3px] text-[#192331] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[5px] focus-visible:outline-blue-400 min-[701px]:text-[26px]" aria-label="Swapped home">
      <Image src="/swapped-logo.png" alt="" width={27} height={27} />
      <span>
        swapped<span className="text-[#3b82f6]">.</span>
      </span>
    </Link>
  );
}
