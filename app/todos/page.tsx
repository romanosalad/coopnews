import Link from "next/link";
import { ArticleLink } from "@/components/analytics/ArticleLink";
import { BrandCornerMotif } from "@/components/brand/BrandCornerMotif";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import type { CoopArticle } from "@/lib/coop-news-data";
import { getPortalHomeArticles } from "@/lib/portal-articles";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "relevantes", label: "Relevantes" },
  { id: "recentes", label: "Recentes" }
] as const;

export default async function TodosPage() {
  const data = await getPortalHomeArticles();
  const seen = new Set<string>();
  const flatten = (list: CoopArticle[]) =>
    list.filter((article) => {
      if (seen.has(article.slug)) return false;
      seen.add(article.slug);
      return true;
    });

  // Same source set the homepage uses, deduped across sections.
  const articles = [
    ...flatten([data.heroFeature, ...data.heroLeft, ...data.heroRight]),
    ...flatten(data.popular),
    ...flatten(data.coopTech),
    ...flatten(data.laFora)
  ];

  return (
    <main>
      <BrandCornerMotif />
      <div style={{ position: "absolute", top: 18, left: 32, zIndex: 60 }}>
        <CoopWordmark height={26} dark />
      </div>
      <TopBar />

      <div className="todos-shell">
        <header className="todos-head">
          <nav className="todos-tabs" aria-label="Filtros">
            {TABS.map((tab, index) => (
              <a key={tab.id} href={`#${tab.id}`} className={`todos-tab ${index === 0 ? "is-active" : ""}`}>
                {tab.label}
              </a>
            ))}
          </nav>
          <Link href="/" className="todos-publish">Publicar →</Link>
        </header>

        <ol className="todos-list" id="relevantes">
          {articles.map((article, index) => (
            <li key={article.slug} className="todos-item">
              <span className="todos-rank">{String(index + 1).padStart(2, "0")}.</span>
              <div className="todos-body">
                <h3 className="todos-title">
                  <ArticleLink contentId={article.id} href={`/materias/${article.slug}`} dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
                </h3>
                <div className="todos-meta">
                  <span className="todos-coin">{formatCoinScore(article)} tabcoins</span>
                  <span className="todos-meta-sep">·</span>
                  <span>{article.clickCount ?? 0} cliques</span>
                  <span className="todos-meta-sep">·</span>
                  <span>{article.author}</span>
                  <span className="todos-meta-sep">·</span>
                  <span>{article.eyebrow.toLowerCase()}</span>
                  <span className="todos-meta-sep">·</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="todos-pagination">
          <span>Página 1</span>
          <a href="#relevantes" className="todos-next">Próximo →</a>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// TabNews uses "tabcoins" as a community currency. We synthesize a similar
// score from real engagement signals: completed reads weigh most, then
// quality views, then clicks, then raw views. Articles without traffic show
// a small base score derived from relevance so the list stays comparable.
function formatCoinScore(article: CoopArticle) {
  const completed = article.completedReadCount ?? 0;
  const quality = article.qualityViewCount ?? 0;
  const clicks = article.clickCount ?? 0;
  const views = article.viewCount ?? 0;
  const computed = Math.round(completed * 6 + quality * 3 + clicks * 2 + views * 0.5);
  if (computed > 0) return computed;
  const relevance = article.relevanceScore ?? 0.7;
  return Math.max(1, Math.round(relevance * 12));
}
