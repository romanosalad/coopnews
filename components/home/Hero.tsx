import { ArticleLink } from "@/components/analytics/ArticleLink";
import type { CoopArticle } from "@/lib/coop-news-data";
import { ArticleVisual } from "@/components/ui/ArticleVisual";

type HeroProps = {
  feature: CoopArticle;
  leftArticles: CoopArticle[];
  rightArticles: CoopArticle[];
};

export function Hero({ feature, leftArticles, rightArticles }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-col">
          <div className="story-stack">
            {leftArticles.map((article) => (
              <Story key={article.slug} article={article} />
            ))}
          </div>
        </div>

        <div className="hero-col">
          <article className="hero-feature">
            <span className={`eyebrow ${feature.eyebrowClass}`}>{feature.eyebrow}</span>
            <ArticleLink contentId={feature.id} href={`/materias/${feature.slug}`} className="story-image" aria-label={`Abrir materia: ${stripHtml(feature.titleHtml)}`}>
              <ArticleVisual alt="" imageUrl={feature.imageUrl} placeholder={feature.placeholder} />
            </ArticleLink>
            <h1>
              <ArticleLink contentId={feature.id} href={`/materias/${feature.slug}`} dangerouslySetInnerHTML={{ __html: feature.titleHtml }} />
            </h1>
            <p className="dek">{feature.dek}</p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.16em", color: "var(--mute)" }}>
                {feature.readTime.toUpperCase()}
              </span>
            </div>
          </article>
        </div>

        <div className="hero-col">
          <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>
            AGORA · 14:32
          </span>
          <div className="story-stack">
            {rightArticles.map((article) => (
              <Story key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Story({ article }: { article: CoopArticle }) {
  return (
    <article className="story">
      <span className={`eyebrow ${article.eyebrowClass}`}>{article.eyebrow}</span>
      <h3>
        <ArticleLink contentId={article.id} href={`/materias/${article.slug}`} dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
      </h3>
    </article>
  );
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
