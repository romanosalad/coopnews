import { coopArticles, getArticleBySlug, getArticlesBySection, type CoopArticle } from "@/lib/coop-news-data";
import { getPopularContentsFromSupabase, getPublishedContentsFromSupabase } from "@/lib/supabase";
import type { Content } from "@/lib/types";

export type PortalHomeArticles = {
  heroFeature: CoopArticle;
  heroLeft: CoopArticle[];
  heroRight: CoopArticle[];
  editorias: CoopArticle[];
  coopTech: CoopArticle[];
  popular: CoopArticle[];
  laFora: CoopArticle[];
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
  const live = prioritizeArticlesWithImages(
    dedupeContentsBySource(await getPublishedContentsFromSupabase())
      .map(contentToArticle)
      .filter((article) => !isWeakRoundupArticle(article))
  );
  const popularLive = dedupeContentsBySource(await getPopularContentsFromSupabase())
    .map(contentToArticle)
    .filter((article) => !isWeakRoundupArticle(article));
  const coopTech = filterByDesk(live, ["CoopTech", "CoopTech", "Martech", "IA", "Automacao"]);
  const laFora = filterByDesk(live, ["La Fora", "Lá Fora", "Comunicacao do Bem", "Comunicação do Bem"]);

  if (live.length === 0) {
    return {
      heroFeature: fallbackHero,
      heroLeft: fallbackHeroLeft,
      heroRight: fallbackHeroRight,
      editorias: getArticlesBySection("editorias"),
      coopTech: getArticlesBySection("editorias"),
      popular: getArticlesBySection("popular"),
      laFora: getArticlesBySection("lafora")
    };
  }

  return {
    heroFeature: live[0] ?? fallbackHero,
    heroLeft: fillArticles(live.slice(1, 4), fallbackHeroLeft, 3),
    heroRight: fillArticles(live.slice(4, 8), fallbackHeroRight, 4),
    editorias: fillArticles(live.slice(0, 6), getArticlesBySection("editorias"), 6),
    coopTech: fillFromLive(coopTech, live, 6),
    popular: fillArticles(popularLive.length > 0 ? popularLive : live, getArticlesBySection("popular"), 7),
    laFora: fillFromLive(laFora, live, 3)
  };
}

function dedupeContentsBySource(contents: Content[]) {
  const best = new Map<string, Content>();

  for (const content of contents) {
    const key = content.source_url || content.slug;
    const current = best.get(key);
    if (!current || contentFreshnessScore(content) > contentFreshnessScore(current)) {
      best.set(key, content);
    }
  }

  return Array.from(best.values());
}

function contentFreshnessScore(content: Content) {
  const hasSummary = getDecisionLogString(content.decision_log, "summary") ? 100000000000000 : 0;
  const publishedAt = new Date(content.published_at ?? content.created_at).getTime();
  return hasSummary + (Number.isFinite(publishedAt) ? publishedAt : 0);
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

function fillFromLive(primary: CoopArticle[], live: CoopArticle[], limit: number) {
  const seen = new Set<string>();
  return [...primary, ...live].filter((article) => {
    if (seen.has(article.slug)) return false;
    seen.add(article.slug);
    return true;
  }).slice(0, limit);
}

function filterByDesk(articles: CoopArticle[], names: string[]) {
  const normalizedNames = names.map(normalizeText);
  return articles.filter((article) => {
    const desk = normalizeText(String(article.decisionLog?.desk ?? ""));
    const category = normalizeText(article.eyebrow);
    return normalizedNames.some((name) => desk.includes(name) || category.includes(name));
  });
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

  return [
    "cooperativ",
    "credit union",
    "mutual",
    "building society",
    "co-op",
    "cooperative bank",
    "sicredi",
    "sicoob",
    "unicred",
    "unimed",
    "coletiv"
  ].some((keyword) => text.includes(keyword));
}

function isWeakRoundupArticle(article: CoopArticle) {
  const text = `${stripHtml(article.titleHtml)} ${article.sourceUrl ?? ""} ${article.imageUrl ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return [
    "campanhas-da-semana",
    "liniker-gil-whatsapp",
    "marketing-de-influencia-estrategia-nacional-conexao-local",
    "marketing-para-cooperativa",
    "dicas-estrategicas-marketing-cooperativista"
  ].some((keyword) => text.includes(keyword));
}

function contentToArticle(content: Content): CoopArticle {
  const category = content.category || "Marketing Cooperativista";
  const body = markdownToParagraphs(content.body_markdown);
  const summary = getDecisionLogString(content.decision_log, "summary");
  const avgScrollDepth = content.view_count ? Math.round((content.total_scroll_depth ?? 0) / content.view_count) : 0;

  return {
    id: content.id,
    slug: content.slug,
    eyebrow: `${category.toUpperCase()} · IA`,
    eyebrowClass: categoryToEyebrowClass(category),
    titleHtml: escapeHtml(content.title),
    dek: toLead(summary || fallbackSummary(content.title, body[0])),
    author: "Redação CoopNews",
    readTime: estimateReadTime(content.body_markdown),
    placeholder: placeholderFromSlug(content.slug),
    imageUrl: content.image_url,
    sourceUrl: content.source_url,
    bodyMarkdown: content.body_markdown,
    relevanceScore: content.relevance_score,
    decisionLog: content.decision_log,
    viewCount: content.view_count ?? 0,
    clickCount: content.click_count ?? 0,
    totalEngagedSeconds: content.total_engaged_seconds ?? 0,
    qualityViewCount: content.quality_view_count ?? 0,
    avgScrollDepth,
    isAiGenerated: true,
    section: "editorias",
    body: body.length > 0 ? body : ["Matéria refinada pela curadoria de IA do Coop News."]
  };
}

function getDecisionLogString(log: Record<string, unknown>, key: string) {
  const value = log?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function fallbackSummary(title: string, firstParagraph?: string) {
  const brand = title.split(":")[0].replace(/\s+\|\s+.*/, "").trim();
  if (brand && brand.length < 52) {
    return `O caso mostra como ${brand} usa comunicação, marca e experiência para transformar vínculo comunitário em vantagem competitiva.`;
  }

  return firstParagraph ?? "Análise estratégica da curadoria CoopNews para o mercado cooperativista.";
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

function toLead(value: string) {
  const cleanValue = value.replace(/^#+\s+/gm, "").replace(/\*\*/g, "").trim();
  if (cleanValue.length <= 160) return cleanValue;
  return `${cleanValue.slice(0, 157).replace(/\s+\S*$/, "")}...`;
}

function categoryToEyebrowClass(category: string) {
  const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("martech")) return "editoria-martech";
  if (normalized.includes("tech")) return "editoria-martech";
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

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
