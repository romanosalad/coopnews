import { ArticleLink } from "@/components/analytics/ArticleLink";
import type { CoopArticle } from "@/lib/coop-news-data";
import { ArticleVisual } from "@/components/ui/ArticleVisual";

type EditoriasSectionProps = {
  articles: CoopArticle[];
};

export function EditoriasSection({ articles }: EditoriasSectionProps) {
  return (
    <section className="editorias" id="cooptech">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-sub">COOPTECH · IA, AUTOMAÇÃO E MARTECH</span>
            <h2 className="section-title" style={{ marginTop: 8 }}>
              Coop<span className="with-brush em-italic">Tech</span>
            </h2>
          </div>
          <a href="#cooptech" className="link-arrow">VER COOPTECH →</a>
        </div>
        <div className="editorias-grid">
          {articles.map((card) => (
            <article className="ed-card" key={card.slug}>
              <ArticleLink contentId={card.id} href={`/materias/${card.slug}`} className="story-image" aria-label={`Abrir materia: ${stripHtml(card.titleHtml)}`}>
                <ArticleVisual alt="" imageUrl={card.imageUrl} placeholder={card.placeholder} />
              </ArticleLink>
              <span className={`eyebrow ${card.eyebrowClass}`}>{card.eyebrow}</span>
              <h3>
                <ArticleLink contentId={card.id} href={`/materias/${card.slug}`} dangerouslySetInnerHTML={{ __html: card.titleHtml }} />
              </h3>
              <p className="dek">{card.dek}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
