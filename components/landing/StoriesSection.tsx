import { ArrowUpRight, Sparkles } from "lucide-react";

const stories = [
  { title: "A little less back-and-forth.", quote: "I could see what I needed to add before making a decision. That made planning my upgrade so much easier.", context: "The estimate experience" },
  { title: "Same routine. New iPhone.", quote: "Pick the phone, check the estimate, arrange the swap. Exactly the kind of straightforward upgrade I was looking for.", context: "The upgrade experience" },
  { title: "An upgrade that fits my day.", quote: "Having a choice between pickup and walking in makes the whole thing feel a lot more convenient.", context: "The pickup experience" },
];

export function StoriesSection() {
  return (
    <section id="stories" className="mx-auto max-w-[1240px] scroll-mt-8 px-6 pb-[60px] pt-[35px] min-[701px]:px-9 min-[701px]:pb-[85px] min-[701px]:pt-[50px]" aria-labelledby="stories-title">
      <div className="block pb-6 min-[701px]:flex min-[701px]:items-center min-[701px]:justify-between min-[701px]:gap-6 min-[701px]:px-6 min-[701px]:pb-[26px]">
        <div><h2 id="stories-title" className="mt-[17px] text-[clamp(30px,3.3vw,43px)] font-medium leading-[1.15] tracking-[-0.05em]">Small switch.<br /><span className="text-[#8591a2]">Good stories.</span></h2></div>
        <div className="mt-[18px] min-[701px]:mt-0"><p className="mb-2 text-xs leading-[1.7] text-[#6e7785] min-[701px]:mb-[14px] min-[701px]:text-[13px]">Less time figuring it out.<br className="max-[700px]:hidden" />More time enjoying what’s next.</p></div>
      </div>
      <div className="relative rounded-3xl bg-[linear-gradient(170deg,#f3f9ff,#d9efff_60%,#91d1fb)] p-[18px] min-[701px]:rounded-[28px] min-[701px]:px-6 min-[701px]:pb-[42px] min-[701px]:pt-7">
        <Sparkles className="absolute -bottom-[15px] -left-[15px] z-[1] rotate-[10deg] fill-[#e3f4ff] text-white drop-shadow-[0_4px_5px_#6bace630]" size={46} strokeWidth={1} aria-hidden="true" />
        <div className="grid grid-cols-1 gap-[14px] min-[701px]:grid-cols-3 min-[701px]:gap-[18px]">
          {stories.map((story, index) => (
            <article key={story.title} className={`relative flex min-h-60 flex-col rounded-[18px] border border-[#ffffffee] bg-[#ffffffdf] p-[23px] shadow-[0_8px_22px_#3878bd08] min-[701px]:min-h-[284px] min-[701px]:p-6 min-[701px]:max-[1050px]:p-5 ${index === 1 ? "bg-[radial-gradient(ellipse_at_75%_100%,#9ed8ff,transparent_85%),linear-gradient(160deg,white,#eaf6ff)] min-[701px]:-translate-y-[9px]" : ""}`}>
              <span className="h-7 font-[Georgia,serif] text-[42px] leading-none text-[#7aa7d8]" aria-hidden="true">“</span>
              <h3 className="mb-3 mt-[14px] text-[19px] font-medium leading-[1.25] tracking-[-0.04em] min-[701px]:max-w-[195px]">{story.title}</h3>
              <p className="mb-7 text-[13px] leading-[1.75] text-[#65788f] min-[701px]:text-xs">{story.quote}</p>
              <div className="mt-auto flex items-center gap-[9px]"><span className="grid h-[29px] w-[29px] place-items-center rounded-full border border-[#d9e9f9] bg-[#eef6fe] text-[9px] text-[#4d7cab]">0{index + 1}</span><div><strong className="block text-[10px] font-medium">Sample story</strong><small className="text-[8px] text-[#728398]">{story.context}</small></div><ArrowUpRight className="ml-auto text-[#7e9dbf]" size={17} aria-hidden="true" /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
