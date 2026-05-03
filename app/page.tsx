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
import { getPortalHomeArticles } from "@/lib/portal-articles";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getPortalHomeArticles();

  return (
    <main data-screen-label="01 Home Briefing.Co">
      <BrandCornerMotif />
      <div style={{ position: "absolute", top: 18, left: 32, zIndex: 60 }}>
        <CoopWordmark height={26} dark />
      </div>
      <TopBar />
      <ColunistasSection />
      <hr className="section-rule" aria-hidden="true" />
      <Hero feature={articles.heroFeature} leftArticles={articles.heroLeft} rightArticles={articles.heroRight} />
      <EditoriasSection articles={articles.coopTech} />
      <PopularSection articles={articles.popular} />
      <LaForaSection articles={articles.laFora} />
      <CtaBand />
      <Footer />
    </main>
  );
}
