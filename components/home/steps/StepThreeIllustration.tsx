import Image from "next/image";

const swapOptions = [
  {
    src: "/steps-illustrations/step-3.png",
    width: 947,
    height: 682
  },
  {
    src: "/steps-illustrations/step-3b.png",
    width: 1003,
    height: 710
  },
] as const;

export function StepThreeIllustration() {
  return (
    <div data-landing-reveal className="mx-auto grid h-full w-full max-w-[600px] grid-cols-2 items-center gap-3 px-4 py-5 [--reveal-delay:150ms] max-[759px]:gap-2 max-[759px]:px-3">
      {swapOptions.map((option) => (
        <figure
          key={option.src}
          className="m-0 flex min-w-0 flex-col items-center rounded-2xl px-3 pb-4 pt-5 max-[759px]:px-2 max-[759px]:pb-3"
        >
          <Image
            src={option.src}
            alt=""
            width={option.width}
            height={option.height}
            sizes="(max-width: 759px) 45vw, 260px"
            className="aspect-[10/7] w-full object-contain"
          />
        </figure>
      ))}
    </div>
  );
}
