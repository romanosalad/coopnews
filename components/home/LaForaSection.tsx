import Link from "next/link";
import { getArticleBySlug } from "@/lib/coop-news-data";
import { Placeholder } from "@/components/ui/Placeholder";

export function LaForaSection() {
  const feature = getArticleBySlug("duolingo-tom-corporativo-coops");
  const mercadoLivre = getArticleBySlug("mercado-livre-frete-gratis-pertencimento");
  const nubank = getArticleBySlug("nubank-roxo-virou-commodity");

  if (!feature || !mercadoLivre || !nubank) return null;

  return (
    <section className="lafora">
      <div className="shell lafora-inner">
        <div className="lafora-head">
          <div>
            <span className="eyebrow on-dark editoria-lafora" style={{ display: "block", marginBottom: 16 }}>
              EDITORIA · NOVA NO COOP NEWS
            </span>
            <h2 className="lafora-title">Lá <em>Fora</em>.</h2>
          </div>
          <p className="lafora-tag">
            O que está acontecendo no marketing de fora do mundo cooperativista — e o que dá pra roubar (com crédito) pra dentro.
          </p>
        </div>
        <div className="lafora-grid">
          <article className="lafora-feature">
            <Link href={`/materias/${feature.slug}`} className="story-image" aria-label="Abrir case Duolingo">
              <Placeholder idx={feature.placeholder} />
            </Link>
            <span className="eyebrow on-dark editoria-lafora">{feature.eyebrow}</span>
            <h2>
              <Link href={`/materias/${feature.slug}`} dangerouslySetInnerHTML={{ __html: feature.titleHtml }} />
            </h2>
            <p className="dek" style={{ color: "#999" }}>{feature.dek}</p>
          </article>
          <LaforaSide article={mercadoLivre} />
          <LaforaSide article={nubank} />
        </div>
        <div className="lafora-bottom">
          <span className="lafora-note">Toda quarta-feira, no seu inbox.</span>
          <a href="#" className="lafora-button">ASSINAR LÁ FORA →</a>
        </div>
      </div>
    </section>
  );
}

function LaforaSide({ article }: { article: NonNullable<ReturnType<typeof getArticleBySlug>> }) {
  return (
    <article className="lafora-side">
      <Link href={`/materias/${article.slug}`} className="story-image" aria-label={`Abrir matéria: ${stripHtml(article.titleHtml)}`}>
        <Placeholder idx={article.placeholder} />
      </Link>
      <span className="eyebrow on-dark editoria-lafora">{article.eyebrow}</span>
      <h3>
        <Link href={`/materias/${article.slug}`} dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
      </h3>
    </article>
  );
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
