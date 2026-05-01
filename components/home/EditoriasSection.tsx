import Link from "next/link";
import type { CoopArticle } from "@/lib/coop-news-data";
import { ArticleVisual } from "@/components/ui/ArticleVisual";

type EditoriasSectionProps = {
  articles: CoopArticle[];
};

export function EditoriasSection({ articles }: EditoriasSectionProps) {
  return (
    <section className="editorias">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-sub">EDITORIAS · O QUE VOCÊ NÃO PODE PERDER</span>
            <h2 className="section-title" style={{ marginTop: 8 }}>
              Pauta da <span className="with-brush em-italic">semana</span>
            </h2>
          </div>
          <a href="#" className="link-arrow">VER TUDO →</a>
        </div>
        <div className="editorias-grid">
          {articles.map((card) => (
            <article className="ed-card" key={card.slug}>
              <Link href={`/materias/${card.slug}`} className="story-image" aria-label={`Abrir materia: ${stripHtml(card.titleHtml)}`}>
                <ArticleVisual alt="" imageUrl={card.imageUrl} placeholder={card.placeholder} />
              </Link>
              <span className={`eyebrow ${card.eyebrowClass}`}>{card.eyebrow}</span>
              <h3>
                <Link href={`/materias/${card.slug}`} dangerouslySetInnerHTML={{ __html: card.titleHtml }} />
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
