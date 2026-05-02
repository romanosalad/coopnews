import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleEngagementTracker } from "@/components/analytics/ArticleEngagementTracker";
import { BrandCornerMotif } from "@/components/brand/BrandCornerMotif";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import { ArticleTldr } from "@/components/ui/ArticleTldr";
import { ArticleVisual } from "@/components/ui/ArticleVisual";
import { CadrinhoBadge, inferCaderno } from "@/components/ui/CadrinhoBadge";
import { FocusModeToggle } from "@/components/ui/FocusModeToggle";
import { coopArticles, type ArticleBodyBlock, type CoopArticle } from "@/lib/coop-news-data";
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
  const layoutSeed = computeLayoutSeed(article);
  const numberedMilestones = buildNumberedMilestones(article);
  const bodyBlocks: ArticleBodyBlock[] = article.bodyBlocks ?? article.body.map((text) => ({ type: "paragraph", text }));
  const paragraphCount = bodyBlocks.filter((block) => block.type === "paragraph").length;

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
            <div className="article-hero-controls">
              <Link href="/" className="article-back">← VOLTAR PARA HOME</Link>
              <FocusModeToggle />
            </div>
            <span className={`eyebrow ${article.eyebrowClass}`}>{article.eyebrow}</span>
            <CadrinhoBadge
              caderno={inferCaderno(article.bodyMarkdown ?? "", article.eyebrow)}
              readTime={article.readTime}
              className="article-caderno-badge"
            />
            <h1 dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
            <p className="article-dek">{article.dek}</p>
            <div className="article-meta">
              <span>{article.readTime.toUpperCase()}</span>
              <span>· COOP NEWS</span>
            </div>
          </div>
          <div className="article-cover">
            <ArticleVisual alt="" imageUrl={article.imageUrl} placeholder={article.placeholder} />
          </div>
        </header>

        <div className="article-body-wrap">
          <div className="article-body">
            <ArticleTldr tldr={article.tldr} />

            {(() => {
              let paragraphIndex = -1;
              return bodyBlocks.map((block, blockIndex) => {
                if (block.type !== "paragraph") {
                  return <BodyBlockRenderer block={block} key={`${block.type}-${blockIndex}`} />;
                }
                paragraphIndex += 1;
                return (
                  <ArticleParagraphBlock
                    article={article}
                    paragraph={block.text}
                    index={paragraphIndex}
                    key={`p-${blockIndex}`}
                    layoutSeed={layoutSeed}
                    totalParagraphs={paragraphCount}
                    numberedMilestones={numberedMilestones}
                  />
                );
              });
            })()}

            {article.sourceUrl || article.isAiGenerated ? (
              <div className="article-source-box">
                <span className="section-sub">TRANSPARÊNCIA EDITORIAL</span>
                <p>
                  {article.isAiGenerated
                    ? "Esta matéria foi reescrita e diagramada pela redação do CoopNews a partir de uma fonte externa."
                    : "Conteúdo curado pela redação do CoopNews."}
                </p>
                {article.sourceUrl ? (
                  <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="source-link">
                    Ler matéria original
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className="article-sidebar">
            <div className="article-sidebar-card">
              <span className="section-sub">{article.isAiGenerated ? "MATRIZ C-MAD" : "PRÓXIMA LEITURA"}</span>
              <h2>{article.isAiGenerated ? "Leitura estratégica" : "Também nesta editoria"}</h2>
              {article.isAiGenerated ? (
                <div className="article-related-list">
                  <div className="article-related">
                    <span className={`eyebrow ${article.eyebrowClass}`}>COOP BUSINESS</span>
                    <strong>{getCmadValue(article, "coop_business") || "Valor para associado e comunidade"}</strong>
                  </div>
                  <div className="article-related">
                    <span className={`eyebrow ${article.eyebrowClass}`}>MARKETING</span>
                    <strong>{getCmadValue(article, "marketing") || "Posicionamento e marca"}</strong>
                  </div>
                  <div className="article-related">
                    <span className={`eyebrow ${article.eyebrowClass}`}>ART/CRAFT</span>
                    <strong>{getCmadValue(article, "art_craft") || "Direção de arte e copy"}</strong>
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

function BodyBlockRenderer({ block }: { block: ArticleBodyBlock }) {
  if (block.type === "heading") {
    return <h2 className="article-section-heading">{block.text}</h2>;
  }
  if (block.type === "emphasis") {
    return <p className="article-emphasis">{block.text}</p>;
  }
  if (block.type === "quote") {
    return (
      <blockquote className="article-inline-quote">
        <p>{block.text}</p>
      </blockquote>
    );
  }
  return <p>{block.text}</p>;
}

type ArticleParagraphBlockProps = {
  article: CoopArticle;
  paragraph: string;
  index: number;
  layoutSeed: number;
  totalParagraphs: number;
  numberedMilestones: { kicker: string; title: string; body: string }[];
};

function ArticleParagraphBlock({ article, paragraph, index, layoutSeed, totalParagraphs, numberedMilestones }: ArticleParagraphBlockProps) {
  const showByWhyMatters = index === 0;
  const showPullQuote = totalParagraphs > 4 && index === Math.max(2, Math.floor(totalParagraphs / 3));
  const showChapterDivider = layoutSeed % 3 === 0 && totalParagraphs > 6 && index === Math.floor(totalParagraphs / 2);
  const showNumberedBox = layoutSeed % 3 === 1 && numberedMilestones.length >= 3 && index === Math.max(3, Math.floor(totalParagraphs / 2));
  const showMarginNote = layoutSeed % 3 === 2 && totalParagraphs > 4 && index === Math.floor(totalParagraphs / 2) + 1;
  const showCmadGrid = totalParagraphs > 4 && index === totalParagraphs - 2;

  return (
    <>
      <p>{paragraph}</p>
      {showByWhyMatters ? (
        <div className="article-context-card">
          <span className="section-sub">POR QUE IMPORTA PARA O COOP</span>
          <strong>{whyItMattersForCoop(article)}</strong>
        </div>
      ) : null}
      {showPullQuote ? (
        <aside className="article-pullquote">
          <span>Leitura CoopNews</span>
          <strong>{pickPullQuote(article)}</strong>
        </aside>
      ) : null}
      {showChapterDivider ? (
        <div className="article-chapter-divider">
          <span className="article-chapter-roman">Cap. 02</span>
          <span className="article-chapter-rule" aria-hidden="true" />
          <span className="article-chapter-label">{getCmadValue(article, "design_ux") || "Aprofundamento estratégico"}</span>
        </div>
      ) : null}
      {showNumberedBox ? (
        <div className="article-numbered-box">
          <span className="section-sub">OS PONTOS-CHAVE</span>
          <ol>
            {numberedMilestones.map((slide, slideIndex) => (
              <li key={slideIndex}>
                <span className="article-numbered-rank">{String(slideIndex + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{slide.title}</strong>
                  <p>{slide.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {showMarginNote ? (
        <aside className="article-margin-note">
          <span>NOTA DE MARGEM</span>
          <p>{getCmadValue(article, "art_craft") || pickPullQuote(article)}</p>
        </aside>
      ) : null}
      {showCmadGrid ? (
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

// Always frame the "Por que importa" block from the cooperative angle. The
// AI is instructed to do this in C-MAD.marketing, but if the field came back
// generic OR doesn't mention coop, we prepend a coop framing so the reader
// always feels the article is talking to them as a cooperative operator.
function whyItMattersForCoop(article: CoopArticle): string {
  const cmadMarketing = getCmadValue(article, "marketing");
  const cmadCoopBusiness = getCmadValue(article, "coop_business");
  const candidates = [cmadCoopBusiness, cmadMarketing, article.dek].map((value) => value.trim()).filter(Boolean);

  for (const candidate of candidates) {
    if (mentionsCoop(candidate)) return candidate;
  }

  const base = candidates[0] ?? "Posicionamento, marca e diferenciacao competitiva.";
  return `Para cooperativas: ${base}`;
}

function mentionsCoop(text: string) {
  const normalized = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  return ["cooperativ", "coop ", "credit union", "mutual", "associad", "cooperado"].some((kw) => normalized.includes(kw));
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

function buildNumberedMilestones(article: CoopArticle) {
  return (article.storyJson ?? [])
    .filter((slide) => slide.title && slide.body)
    .slice(0, 3);
}

function computeLayoutSeed(article: CoopArticle) {
  return article.slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
