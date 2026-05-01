import { BrandCornerMotif } from "@/components/brand/BrandCornerMotif";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { CtaBand } from "@/components/home/CtaBand";
import { ColunistasSection } from "@/components/home/ColunistasSection";
import { EditoriasSection } from "@/components/home/EditoriasSection";
import { Hero } from "@/components/home/Hero";
import { LaForaSection } from "@/components/home/LaForaSection";
import { PopularSection } from "@/components/home/PopularSection";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";

export default function HomePage() {
  return (
    <main data-screen-label="01 Home Coop News">
      <BrandCornerMotif />
      <div style={{ position: "absolute", top: 18, left: 32, zIndex: 60 }}>
        <CoopWordmark height={26} dark />
      </div>
      <TopBar />
      <Hero />
      <ColunistasSection />
      <PopularSection />
      <EditoriasSection />
      <LaForaSection />
      <CtaBand />
      <Footer />
    </main>
  );
}
