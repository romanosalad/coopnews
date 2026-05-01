import Link from "next/link";
import { getArticleBySlug } from "@/lib/coop-news-data";
import { Placeholder } from "@/components/ui/Placeholder";

const leftSlugs = [
  "cooperativas-confundem-crm-com-mailing",
  "landing-page-escrita-por-ia-no-coop-brasileiro",
  "campanha-devolve-dignidade-em-vez-de-vender-pacote"
];

const rightSlugs = [
  "unimed-bh-jornada-boas-vindas-gatilho-consulta",
  "hubspot-plano-cooperativista-mira-miolo-do-mercado",
  "treinar-gpt-sem-vazar-dado-de-associado",
  "festival-cataratas-abre-inscricoes-coops-trilha-propria"
];

export function Hero() {
  const feature = getArticleBySlug("campanha-sicredi-criatividade-cooperativista-nao-precisa-ser-careta");
  if (!feature) return null;

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-col">
          <div className="story-stack">
            {leftSlugs.map((slug) => {
              const article = getArticleBySlug(slug);
              return article ? <Story key={slug} article={article} /> : null;
            })}
          </div>
        </div>

        <div className="hero-col">
          <article className="hero-feature">
            <span className={`eyebrow ${feature.eyebrowClass}`}>{feature.eyebrow}</span>
            <Link href={`/materias/${feature.slug}`} className="story-image" aria-label={`Abrir matéria: ${stripHtml(feature.titleHtml)}`}>
              <Placeholder idx={feature.placeholder} />
            </Link>
            <h1>
              <Link href={`/materias/${feature.slug}`} dangerouslySetInnerHTML={{ __html: feature.titleHtml }} />
            </h1>
            <p className="dek">{feature.dek}</p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.16em", color: "var(--mute)" }}>
                POR {feature.author.toUpperCase()}
              </span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.16em", color: "var(--mute)" }}>
                · {feature.readTime.toUpperCase()}
              </span>
            </div>
          </article>
        </div>

        <div className="hero-col">
          <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>
            AGORA · 14:32
          </span>
          <div className="story-stack">
            {rightSlugs.map((slug) => {
              const article = getArticleBySlug(slug);
              return article ? <Story key={slug} article={article} /> : null;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Story({ article }: { article: NonNullable<ReturnType<typeof getArticleBySlug>> }) {
  return (
    <article className="story">
      <span className={`eyebrow ${article.eyebrowClass}`}>{article.eyebrow}</span>
      <h3>
        <Link href={`/materias/${article.slug}`} dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
      </h3>
    </article>
  );
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
