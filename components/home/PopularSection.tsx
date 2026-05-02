import { ArticleLink } from "@/components/analytics/ArticleLink";
import { ArticleVisual } from "@/components/ui/ArticleVisual";
import type { CoopArticle } from "@/lib/coop-news-data";

type PopularSectionProps = {
  articles: CoopArticle[];
};

export function PopularSection({ articles }: PopularSectionProps) {
  return (
    <section className="popular" id="mais-populares">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-sub">FÓRUM · CLIQUES, ATENÇÃO E COOPCASH</span>
            <h2 className="section-title" style={{ marginTop: 8 }}>
              Mais <em className="em-italic" style={{ color: "var(--accent)" }}>populares</em>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button className="period-button">SEMANA</button>
            <button className="period-button active">MÊS</button>
            <button className="period-button">ANO</button>
          </div>
        </div>
        <div className="popular-list">
          {articles.map((article, index) => (
            <ArticleLink contentId={article.id} href={`/materias/${article.slug}`} className="popular-item" key={article.slug}>
              <div className="popular-rank">{String(index + 1).padStart(2, "0")}<span className="dot">.</span></div>
              <div className="popular-thumb">
                <ArticleVisual alt="" imageUrl={article.imageUrl} placeholder={article.placeholder} />
              </div>
              <h3 className="popular-title" dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
              <div className="popular-meta">{formatPopularMeta(article)}</div>
            </ArticleLink>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <a href="#mais-populares" className="solid-cta">VER FÓRUM COMPLETO →</a>
        </div>
      </div>
    </section>
  );
}

function formatPopularMeta(article: CoopArticle) {
  const views = article.viewCount ?? 0;
  const clicks = article.clickCount ?? 0;
  const engagedMinutes = Math.round((article.totalEngagedSeconds ?? 0) / 60);
  const completion = article.completionRate ?? 0;

  if (views === 0 && clicks === 0 && engagedMinutes === 0) {
    return "NOVO · AGUARDANDO SINAIS";
  }

  const parts = [`${views} VIEWS`, `${clicks} CLIQUES`];
  if (engagedMinutes > 0) parts.push(`${engagedMinutes} MIN LIDOS`);
  if (completion > 0) parts.push(`${completion}% LERAM ATÉ O FIM`);
  return parts.join(" · ");
}
