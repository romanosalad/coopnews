import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleEngagementTracker } from "@/components/analytics/ArticleEngagementTracker";
import { BrandCornerMotif } from "@/components/brand/BrandCornerMotif";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import { ArticleVisual } from "@/components/ui/ArticleVisual";
import { coopArticles, type CoopArticle } from "@/lib/coop-news-data";
import { getPortalArticleBySlug } from "@/lib/portal-articles";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return coopArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getPortalArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${stripHtml(article.titleHtml)} | Coop News`,
    description: article.dek
  };
}

export default async function MateriaPage({ params }: Props) {
  const { slug } = await params;
  const article = await getPortalArticleBySlug(slug);
  if (!article) notFound();

  const related = coopArticles.filter((item) => item.slug !== article.slug && item.section === article.section).slice(0, 3);

  return (
    <main>
      <ArticleEngagementTracker contentId={article.id} />
      <BrandCornerMotif />
      <div style={{ position: "absolute", top: 18, left: 32, zIndex: 60 }}>
        <CoopWordmark height={26} dark />
      </div>
      <TopBar />

      <article className="article-page">
        <header className="article-hero">
          <div className="article-hero-text">
            <Link href="/" className="article-back">← VOLTAR PARA HOME</Link>
            <span className={`eyebrow ${article.eyebrowClass}`}>{article.eyebrow}</span>
            <h1 dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
            <p className="article-dek">{article.dek}</p>
            <div className="article-meta">
              <span>{article.readTime.toUpperCase()}</span>
              <span>· COOP NEWS</span>
              {typeof article.relevanceScore === "number" ? <span>· IA {Math.round(article.relevanceScore * 100)}%</span> : null}
            </div>
          </div>
          <div className="article-cover">
            <ArticleVisual alt="" imageUrl={article.imageUrl} placeholder={article.placeholder} />
          </div>
        </header>

        <div className="article-body-wrap">
          <div className="article-body">
            {article.body.map((paragraph, index) => (
              <ArticleBodyBlock article={article} paragraph={paragraph} index={index} key={`${paragraph}-${index}`} />
            ))}

            {article.isAiGenerated ? (
              <div className="article-source-box">
                <span className="section-sub">TRANSPARÊNCIA EDITORIAL</span>
                <p>
                  Esta matéria foi traduzida, reescrita e diagramada pela curadoria do CoopNews a partir de uma fonte externa.
                </p>
                {article.sourceUrl ? (
                  <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="source-link">
                    Ler matéria original
                  </a>
                ) : null}
              </div>
            ) : (
              <p>
                Esta visualização ainda usa conteúdo estático de demonstração. Quando a ingestão entrar, este mesmo desenho receberá matérias reais,
                aprovadas pela curadoria antes de aparecerem no portal.
              </p>
            )}
          </div>

          <aside className="article-sidebar">
            <div className="article-sidebar-card">
              <span className="section-sub">{article.isAiGenerated ? "MATRIZ C-MAD" : "PRÓXIMA LEITURA"}</span>
              <h2>{article.isAiGenerated ? "Leitura estratégica" : "Também nesta editoria"}</h2>
              {article.isAiGenerated ? (
                <div className="article-related-list">
                  <div className="article-related">
                    <span className={`eyebrow ${article.eyebrowClass}`}>SCORE</span>
                    <strong>{typeof article.relevanceScore === "number" ? `${Math.round(article.relevanceScore * 100)}% de relevância` : "Aguardando score"}</strong>
                  </div>
                  <div className="article-related">
                    <span className={`eyebrow ${article.eyebrowClass}`}>COOP BUSINESS</span>
                    <strong>{getCmadValue(article, "coop_business") || "Valor para associado e comunidade"}</strong>
                  </div>
                  <div className="article-related">
                    <span className={`eyebrow ${article.eyebrowClass}`}>IMAGEM</span>
                    <strong>{article.imageUrl ? "Imagem original do artigo" : "Placeholder editorial"}</strong>
                  </div>
                </div>
              ) : (
                <div className="article-related-list">
                  {related.map((item) => (
                    <Link href={`/materias/${item.slug}`} key={item.slug} className="article-related">
                      <span className={`eyebrow ${item.eyebrowClass}`}>{item.eyebrow}</span>
                      <strong dangerouslySetInnerHTML={{ __html: item.titleHtml }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>

      <Footer />
    </main>
  );
}

function ArticleBodyBlock({ article, paragraph, index }: { article: CoopArticle; paragraph: string; index: number }) {
  return (
    <>
      <p>{paragraph}</p>
      {index === 0 ? (
        <div className="article-context-card">
          <span className="section-sub">POR QUE IMPORTA</span>
          <strong>{getCmadValue(article, "marketing") || article.dek}</strong>
        </div>
      ) : null}
      {index === 2 ? (
        <aside className="article-pullquote">
          <span>Leitura CoopNews</span>
          <strong>{pickPullQuote(article)}</strong>
        </aside>
      ) : null}
      {index === 4 ? (
        <div className="article-cmad-grid">
          <div>
            <span>C</span>
            <strong>Coop Business</strong>
            <p>{getCmadValue(article, "coop_business") || "Valor concreto para associado, operação ou comunidade."}</p>
          </div>
          <div>
            <span>M</span>
            <strong>Marketing</strong>
            <p>{getCmadValue(article, "marketing") || "Posicionamento, marca e nível de consciência."}</p>
          </div>
          <div>
            <span>A</span>
            <strong>Art/Craft</strong>
            <p>{getCmadValue(article, "art_craft") || "Direção de arte, copy e originalidade da peça."}</p>
          </div>
          <div>
            <span>D</span>
            <strong>Design/UX</strong>
            <p>{getCmadValue(article, "design_ux") || "Jornada, pertencimento e experiência do cooperado."}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

function getCmadValue(article: CoopArticle, key: string) {
  const cmad = article.decisionLog?.cmad;
  if (!cmad || typeof cmad !== "object") return "";
  const value = (cmad as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function pickPullQuote(article: CoopArticle) {
  const craft = getCmadValue(article, "art_craft");
  if (craft) return craft;
  return article.dek;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
