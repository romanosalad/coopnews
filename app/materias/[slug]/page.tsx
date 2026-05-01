import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandCornerMotif } from "@/components/brand/BrandCornerMotif";
import { CoopWordmark } from "@/components/brand/Wordmark";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import { Placeholder } from "@/components/ui/Placeholder";
import { coopArticles, getArticleBySlug } from "@/lib/coop-news-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return coopArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${stripHtml(article.titleHtml)} | Coop News`,
    description: article.dek
  };
}

export default async function MateriaPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = coopArticles.filter((item) => item.slug !== article.slug && item.section === article.section).slice(0, 3);

  return (
    <main>
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
              <span>POR {article.author.toUpperCase()}</span>
              <span>· {article.readTime.toUpperCase()}</span>
              <span>· COOP NEWS</span>
            </div>
          </div>
          <div className="article-cover">
            <Placeholder idx={article.placeholder} />
          </div>
        </header>

        <div className="article-body-wrap">
          <div className="article-body">
            {article.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <blockquote>
              <p>
                O que importa para o Coop News é separar campanha bonita de comunicação que muda comportamento, relação e valor percebido.
              </p>
            </blockquote>
            <p>
              Esta visualização ainda usa conteúdo estático de demonstração. Quando a ingestão entrar, este mesmo desenho receberá matérias reais,
              aprovadas pela curadoria antes de aparecerem no portal.
            </p>
          </div>

          <aside className="article-sidebar">
            <div className="article-sidebar-card">
              <span className="section-sub">PRÓXIMA LEITURA</span>
              <h2>Também nesta editoria</h2>
              <div className="article-related-list">
                {related.map((item) => (
                  <Link href={`/materias/${item.slug}`} key={item.slug} className="article-related">
                    <span className={`eyebrow ${item.eyebrowClass}`}>{item.eyebrow}</span>
                    <strong dangerouslySetInnerHTML={{ __html: item.titleHtml }} />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>

      <Footer />
    </main>
  );
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
