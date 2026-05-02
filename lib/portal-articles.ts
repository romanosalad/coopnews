import { coopArticles, getArticleBySlug, getArticlesBySection, type CoopArticle } from "@/lib/coop-news-data";
import { getPublishedContentsFromSupabase } from "@/lib/supabase";
import type { Content } from "@/lib/types";

export type PortalHomeArticles = {
  heroFeature: CoopArticle;
  heroLeft: CoopArticle[];
  heroRight: CoopArticle[];
  editorias: CoopArticle[];
};

const fallbackHero = getArticleBySlug("campanha-sicredi-criatividade-cooperativista-nao-precisa-ser-careta") ?? coopArticles[0];
const fallbackHeroLeft = [
  "cooperativas-confundem-crm-com-mailing",
  "landing-page-escrita-por-ia-no-coop-brasileiro",
  "campanha-devolve-dignidade-em-vez-de-vender-pacote"
].map((slug) => getArticleBySlug(slug)).filter(Boolean) as CoopArticle[];
const fallbackHeroRight = [
  "unimed-bh-jornada-boas-vindas-gatilho-consulta",
  "hubspot-plano-cooperativista-mira-miolo-do-mercado",
  "treinar-gpt-sem-vazar-dado-de-associado",
  "festival-cataratas-abre-inscricoes-coops-trilha-propria"
].map((slug) => getArticleBySlug(slug)).filter(Boolean) as CoopArticle[];

export async function getPortalHomeArticles(): Promise<PortalHomeArticles> {
  const live = prioritizeArticlesWithImages((await getPublishedContentsFromSupabase()).map(contentToArticle).filter((article) => !isWeakRoundupArticle(article)));

  if (live.length === 0) {
    return {
      heroFeature: fallbackHero,
      heroLeft: fallbackHeroLeft,
      heroRight: fallbackHeroRight,
      editorias: getArticlesBySection("editorias")
    };
  }

  return {
    heroFeature: live[0] ?? fallbackHero,
    heroLeft: fillArticles(live.slice(1, 4), fallbackHeroLeft, 3),
    heroRight: fillArticles(live.slice(4, 8), fallbackHeroRight, 4),
    editorias: fillArticles(live, getArticlesBySection("editorias"), 6)
  };
}

export async function getPortalArticleBySlug(slug: string) {
  const live = await getPublishedContentsFromSupabase();
  const liveArticle = live.find((content) => content.slug === slug);
  if (liveArticle) return contentToArticle(liveArticle);

  return getArticleBySlug(slug);
}

function fillArticles(primary: CoopArticle[], fallback: CoopArticle[], limit: number) {
  const seen = new Set<string>();
  const merged = [...primary, ...fallback].filter((article) => {
    if (seen.has(article.slug)) return false;
    seen.add(article.slug);
    return true;
  });
  return merged.slice(0, limit);
}

function prioritizeArticlesWithImages(articles: CoopArticle[]) {
  return [...articles].sort((left, right) => {
    const delta = articleHomeScore(right) - articleHomeScore(left);
    if (delta !== 0) return delta;
    return 0;
  });
}

function articleHomeScore(article: CoopArticle) {
  return (isStrongCoopArticle(article) ? 100 : 0) + (article.imageUrl ? 40 : 0) - (isWeakRoundupArticle(article) ? 200 : 0);
}

function isStrongCoopArticle(article: CoopArticle) {
  const text = `${stripHtml(article.titleHtml)} ${article.sourceUrl ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return ["cooperativ", "sicredi", "sicoob", "unicred", "unimed", "coletiv"].some((keyword) => text.includes(keyword));
}

function isWeakRoundupArticle(article: CoopArticle) {
  const text = `${stripHtml(article.titleHtml)} ${article.sourceUrl ?? ""} ${article.imageUrl ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return text.includes("campanhas-da-semana") || text.includes("liniker-gil-whatsapp");
}

function contentToArticle(content: Content): CoopArticle {
  const category = content.category || "Marketing Cooperativista";
  const body = markdownToParagraphs(content.body_markdown);

  return {
    slug: content.slug,
    eyebrow: `${category.toUpperCase()} · IA`,
    eyebrowClass: categoryToEyebrowClass(category),
    titleHtml: escapeHtml(content.title),
    dek: body[0] ?? "Matéria refinada pela curadoria de IA do Coop News.",
    author: "Curadoria IA",
    readTime: estimateReadTime(content.body_markdown),
    placeholder: placeholderFromSlug(content.slug),
    imageUrl: content.image_url,
    sourceUrl: content.source_url,
    bodyMarkdown: content.body_markdown,
    relevanceScore: content.relevance_score,
    decisionLog: content.decision_log,
    isAiGenerated: true,
    section: "editorias",
    body: body.length > 0 ? body : ["Matéria refinada pela curadoria de IA do Coop News."]
  };
}

function markdownToParagraphs(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/^#+\s+/gm, "").replace(/\*\*/g, "").trim())
    .filter(Boolean);
}

function estimateReadTime(markdown: string) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(words / 180));
  return `${minutes} min de leitura`;
}

function categoryToEyebrowClass(category: string) {
  const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("martech")) return "editoria-martech";
  if (normalized.includes("ia")) return "editoria-ia";
  if (normalized.includes("bem") || normalized.includes("comunicacao")) return "editoria-bem";
  if (normalized.includes("automacao")) return "editoria-automacao";
  if (normalized.includes("fora")) return "editoria-lafora";
  return "editoria-criatividade";
}

function placeholderFromSlug(slug: string) {
  return slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
