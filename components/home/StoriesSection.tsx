import Image from "next/image";
import type { CSSProperties } from "react";
import { Quote, Sparkles } from "lucide-react";

const stories = [
  {
    name: "Uche O.",
    location: "Lekki, Lagos",
    avatar: "/memojis/memoji_1.png",
    title: "A little less back-and-forth.",
    quote:
      "I could see what I needed to add before making a decision. That made planning my upgrade so much easier.",
    context: "iPhone 13 to iPhone 15",
  },
  {
    name: "Tobi A.",
    location: "Ikeja, Lagos",
    avatar: "/memojis/memoji_2.png",
    title: "Same routine. New iPhone.",
    quote:
      "Pick the phone, check the estimate, arrange the swap. Exactly the kind of straightforward upgrade I was looking for.",
    context: "iPhone 12 to iPhone 15 Pro",
  },
  {
    name: "Teniola A.",
    location: "Yaba, Lagos",
    avatar: "/memojis/memoji_3.png",
    title: "An upgrade that fits my day.",
    quote:
      "Having a choice between pickup and walking in makes the whole thing feel a lot more convenient.",
    context: "iPhone 11 to iPhone 14",
  },
];

export function StoriesSection() {
  return (
    <section
      id="stories"
      className="mx-auto max-w-[1240px] scroll-mt-8 px-6 pb-20 pt-16 min-[701px]:px-9 min-[701px]:pb-28 min-[701px]:pt-24"
      aria-labelledby="stories-title"
    >
      <div data-landing-reveal className="mb-8 flex flex-col items-center text-center min-[701px]:mb-11">
       
        <div>
          <h2
            id="stories-title"
            className="text-[clamp(32px,3.6vw,48px)] font-semibold leading-[1.08] tracking-[-0.05em] text-[#192331]"
          >
            Upgrade stories from people like you.
          </h2>
         
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[28px] border border-[#4c00bd]/10 bg-[#f3effa] p-3 min-[701px]:rounded-[32px] min-[701px]:p-5">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#4c00bd]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-64 rounded-full bg-[#8e5ce6]/10 blur-3xl" />
        <div className="relative grid grid-cols-1 gap-3 min-[701px]:grid-cols-3 min-[701px]:gap-5">
          {stories.map((story, index) => (
            <article
              key={story.title}
              data-landing-reveal
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
              className={`flex min-h-[276px] flex-col rounded-[22px] border border-white/80 bg-[#fffdfb] p-6 shadow-[0_12px_30px_rgba(76,0,189,0.06)] min-[701px]:min-h-[320px] min-[701px]:p-7 `}
            >
              <Quote
                className="mb-5 text-[#4c00bd]"
                size={25}
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <h3 className="mb-3 text-[21px] font-semibold leading-[1.2] tracking-[-0.04em] text-[#192331]">
                {story.title}
              </h3>
              <p className="mb-7 text-[14px] leading-[1.65] text-[#69717d]">
                {story.quote}
              </p>
              <div className="mt-auto flex items-center gap-3 border-t border-[#4c00bd]/10 pt-5">
                <div className="grid size-11 shrink-0 place-items-end overflow-hidden rounded-full bg-[#eee5fc]">
                  <Image
                    src={story.avatar}
                    alt={`Memoji of ${story.name}`}
                    width={44}
                    height={44}
                    className="size-11 object-contain"
                  />
                </div>
                <div>
                  <strong className="block text-sm font-semibold text-[#192331]">
                    {story.name}
                  </strong>
                  <small className="block text-xs text-[#69717d]">
                    {story.context}
                  </small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
