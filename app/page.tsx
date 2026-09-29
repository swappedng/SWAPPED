import { FaqSection } from "@/components/landing/FaqSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Header } from "@/components/landing/LandingHeader";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { StoriesSection } from "@/components/landing/StoriesSection";

export default function Home() {
  return (
    <div className="tracking-[-0.025em] text-[#192331]">
      <a className="absolute -top-20 left-5 z-20 rounded-xl bg-white px-5 py-3" href="#hero">
        Skip to content
      </a>
      <Header />
      <main>
        <HeroSection />
        <ProcessSection />
        <StoriesSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
