import Link from "next/link";
import { getArticlesBySection } from "@/lib/coop-news-data";
import { Placeholder } from "@/components/ui/Placeholder";

export function EditoriasSection() {
  const cards = getArticlesBySection("editorias");

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
          {cards.map((card) => (
            <article className="ed-card" key={card.slug}>
              <Link href={`/materias/${card.slug}`} className="story-image" aria-label={`Abrir matéria: ${stripHtml(card.titleHtml)}`}>
                <Placeholder idx={card.placeholder} />
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
