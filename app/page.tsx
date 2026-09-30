import { FaqSection } from "@/components/landing/FaqSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { Footer } from "@/components/landing/Footer";
import { LandingReveal } from "@/components/landing/LandingReveal";
import { Header } from "@/components/landing/Header";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { StoriesSection } from "@/components/landing/StoriesSection";

export default function Home() {
  return (
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
      <Footer />
    </div>
  );
}
