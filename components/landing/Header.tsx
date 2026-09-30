import Link from "next/link";
import { Brand } from "./Brand";

export function Header() {
  return (
    <header className="mx-auto flex h-20 max-w-[1640px] items-center justify-between gap-6 px-[12px] min-[701px]:h-16 min-[701px]:px-9">
      <Brand />
      {/* <Link href="/tradein" className="button-primary ">
        Start Swap
      </Link> */}
    </header>
  );
}
