import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  inverse?: boolean;
};

export function Brand({ inverse = false }: BrandProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 text-[24px] font-bold tracking-[-1.3px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[5px] min-[701px]:text-[26px] ${inverse ? "text-white focus-visible:outline-white" : "text-[#192331] focus-visible:outline-[#4c00bd]"}`}
      aria-label="Swapped home"
    >
      <Image src="/swapped-logo.png" alt="" width={27} height={27} />
      <span>
        swapped<span className={inverse ? "text-[#cbb4ff]" : "text-[#4c00bd]"}>.</span>
      </span>
    </Link>
  );
}
