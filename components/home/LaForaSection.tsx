import { ArticleLink } from "@/components/analytics/ArticleLink";
import { ArticleVisual } from "@/components/ui/ArticleVisual";
import type { CoopArticle } from "@/lib/coop-news-data";

type LaForaSectionProps = {
  articles: CoopArticle[];
};

export function LaForaSection({ articles }: LaForaSectionProps) {
  const [feature, ...sideArticles] = articles;
  if (!feature) return null;

  return (
    <section className="lafora" id="la-fora">
      <div className="shell lafora-inner">
        <div className="lafora-head">
          <div>
            <span className="eyebrow on-dark editoria-lafora" style={{ display: "block", marginBottom: 16 }}>
              EDITORIA · MARKETING DO BEM GLOBAL
            </span>
            <h2 className="lafora-title">Lá <em>Fora</em>.</h2>
          </div>
          <p className="lafora-tag">
            Empresas B, ESG, comunidade e consumo global: o que não é coop, mas ensina muito para quem vive de pertencimento.
          </p>
        </div>
        <div className="lafora-grid">
          <article className="lafora-feature">
            <ArticleLink contentId={feature.id} href={`/materias/${feature.slug}`} className="story-image" aria-label={`Abrir materia: ${stripHtml(feature.titleHtml)}`}>
              <ArticleVisual alt="" imageUrl={feature.imageUrl} placeholder={feature.placeholder} />
            </ArticleLink>
            <span className="eyebrow on-dark editoria-lafora">{feature.eyebrow}</span>
            <h2>
              <ArticleLink contentId={feature.id} href={`/materias/${feature.slug}`} dangerouslySetInnerHTML={{ __html: feature.titleHtml }} />
            </h2>
            <p className="dek" style={{ color: "#999" }}>{feature.dek}</p>
          </article>
          {sideArticles.slice(0, 2).map((article) => (
            <LaforaSide key={article.slug} article={article} />
          ))}
        </div>
        <div className="lafora-bottom">
          <span className="lafora-note">Toda quarta-feira, no seu inbox.</span>
          <a href="#la-fora" className="lafora-button">ASSINAR LÁ FORA →</a>
        </div>
      </div>
    </section>
  );
}

function LaforaSide({ article }: { article: CoopArticle }) {
  return (
    <article className="lafora-side">
      <ArticleLink contentId={article.id} href={`/materias/${article.slug}`} className="story-image" aria-label={`Abrir materia: ${stripHtml(article.titleHtml)}`}>
        <ArticleVisual alt="" imageUrl={article.imageUrl} placeholder={article.placeholder} />
      </ArticleLink>
      <span className="eyebrow on-dark editoria-lafora">{article.eyebrow}</span>
      <h3>
        <ArticleLink contentId={article.id} href={`/materias/${article.slug}`} dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
      </h3>
    </article>
  );
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
