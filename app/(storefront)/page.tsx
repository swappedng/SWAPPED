import { FaqSection } from "@/components/home/FaqSection";
import { HeroSection } from "@/components/home/HeroSection";
import { LandingReveal } from "@/components/home/LandingReveal";
import { Header } from "@/components/home/Header";
import { ProcessSection } from "@/components/home/ProcessSection";
import { StoriesSection } from "@/components/home/StoriesSection";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <div id="landing-page" className="tracking-[-0.025em] text-[#192331]">
        <LandingReveal />
        <a
          className="absolute -top-20 left-5 z-20 rounded-xl bg-white px-5 py-3"
          href="#hero"
        >
          Skip to content
        </a>
        <Header />
        <main>
          <HeroSection />
          <ProcessSection />
          <StoriesSection />
          <FaqSection />
        </main>
      </div>
      <Footer />
    </>
  );
}
