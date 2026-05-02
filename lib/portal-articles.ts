import { coopArticles, getArticleBySlug, getArticlesBySection, type ArticleBodyBlock, type CoopArticle } from "@/lib/coop-news-data";
import { getEditorialFallbackImage } from "@/lib/editorial-fallbacks";
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

  // Cross-section dedupe: hero claims first, then CoopTech / Popular / LaFora
  // pick from what is left so each desk shows distinct stories instead of
  // recycling the same article across the entire homepage.
  const claimed = new Set<string>();
  const claim = (article: CoopArticle | undefined) => {
    if (!article) return undefined;
    claimed.add(article.slug);
    return article;
  };
  const remaining = () => live.filter((article) => !claimed.has(article.slug));

  const heroFeature = claim(live[0]) ?? fallbackHero;
  const heroLeftLive = takeAndClaim(remaining(), 3, claimed);
  const heroRightLive = takeAndClaim(remaining(), 4, claimed);
  const heroLeft = fillArticles(heroLeftLive, fallbackHeroLeft, 3, claimed);
  const heroRight = fillArticles(heroRightLive, fallbackHeroRight, 4, claimed);

  // CoopTech graceful fallback chain: strict desk -> broad signal -> static.
  // The strict filter alone leaves the section empty until enough AI-tagged
  // CoopTech articles exist; broad keyword scan rescues legacy inventory; the
  // static editorial fallback guarantees the section never renders blank.
  const coopTechStrict = filterByCoopTech(remaining());
  const coopTechBroad = coopTechStrict.length >= 3 ? coopTechStrict : filterByCoopTechBroad(remaining());
  const coopTech = fillArticles(takeAndClaim(coopTechBroad, 6, claimed), getArticlesBySection("editorias"), 6, claimed);

  const popularPool = popularLive.filter((article) => !claimed.has(article.slug));
  const popularFiltered = popularPool.length > 0 ? popularPool : remaining();
  const popular = fillArticles(takeAndClaim(popularFiltered, 7, claimed), getArticlesBySection("popular"), 7, claimed);

  const laForaPool = filterByLaFora(remaining());
  const laFora = fillArticles(takeAndClaim(laForaPool, 3, claimed), getArticlesBySection("lafora"), 3, claimed);

  return {
    heroFeature,
    heroLeft,
    heroRight,
    editorias: takeAndClaim(remaining(), 6, claimed),
    coopTech,
    popular,
    laFora
  };
}

function takeAndClaim(pool: CoopArticle[], limit: number, claimed: Set<string>) {
  const picked: CoopArticle[] = [];
  for (const article of pool) {
    if (picked.length >= limit) break;
    if (claimed.has(article.slug)) continue;
    claimed.add(article.slug);
    picked.push(article);
  }
  return picked;
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

function fillArticles(primary: CoopArticle[], fallback: CoopArticle[], limit: number, claimed?: Set<string>) {
  const seen = new Set<string>(claimed ?? []);
  primary.forEach((article) => seen.add(article.slug));
  const filler = fallback.filter((article) => !seen.has(article.slug));
  filler.forEach((article) => {
    if (claimed) claimed.add(article.slug);
    seen.add(article.slug);
  });
  return [...primary, ...filler].slice(0, limit);
}

// Strict CoopTech: requires desk === CoopTech OR category clearly mapping to
// IA / automacao / martech / tech. Source URL fallback catches obvious tech
// publications when the AI mis-tagged the desk.
function filterByCoopTech(articles: CoopArticle[]) {
  return articles.filter((article) => {
    const desk = normalizeText(String(article.decisionLog?.desk ?? ""));
    const category = normalizeText(article.eyebrow);
    const sourceText = normalizeText(`${article.sourceUrl ?? ""} ${stripHtml(article.titleHtml)}`);

    if (desk === "cooptech" || category.includes("cooptech") || category.includes("martech")) {
      return true;
    }
    if (category.includes("ia") || category.includes("automacao") || category.includes("tech")) {
      return true;
    }
    return [
      "techcrunch",
      "the verge",
      "wired",
      "venturebeat",
      "ai for",
      "machine learning",
      "automation",
      "martech",
      "openai",
      "anthropic"
    ].some((keyword) => sourceText.includes(keyword));
  });
}

// Broader CoopTech rescue: kicks in when the strict filter returns < 3 items.
// Scans the rewritten title and body markdown for tech-adjacent vocabulary
// (IA, GPT, automacao, dados, CRM, martech, plataforma, software, SaaS,
// algoritmo) so legacy AI ingestions tagged as "Capa" but actually about
// technology still surface in the desk.
function filterByCoopTechBroad(articles: CoopArticle[]) {
  return articles.filter((article) => {
    const text = normalizeText(`${stripHtml(article.titleHtml)} ${article.dek} ${article.bodyMarkdown ?? ""} ${article.eyebrow}`);
    return [
      " ia ",
      " ia,",
      " ia.",
      "inteligencia artificial",
      "gpt",
      "llm",
      "machine learning",
      "automacao",
      "automatiz",
      "martech",
      "crm",
      "cdp",
      "dados",
      "data ",
      "algoritm",
      "plataforma",
      "software",
      "saas",
      "api ",
      "low-code",
      "no-code",
      "chatbot",
      "agentic"
    ].some((keyword) => text.includes(keyword));
  });
}

// Strict La Fora: only B Corp / ESG / Purpose-driven brands or non-coop case
// studies the editorial line uses for inspiration. Falls back to nothing
// rather than spilling unrelated coop articles into the section.
function filterByLaFora(articles: CoopArticle[]) {
  return articles.filter((article) => {
    const desk = normalizeText(String(article.decisionLog?.desk ?? ""));
    const category = normalizeText(article.eyebrow);
    if (desk.includes("la fora") || desk.includes("lafora") || category.includes("fora") || category.includes("bem")) {
      return true;
    }

    const text = normalizeText(`${stripHtml(article.titleHtml)} ${article.sourceUrl ?? ""} ${article.eyebrow}`);
    return [
      "b corp",
      "b-corp",
      "esg",
      "purpose",
      "social impact",
      "sustainab",
      "diversity",
      "duolingo",
      "patagonia",
      "ben & jerry",
      "rabobank",
      "desjardins",
      "nationwide",
      "rei co-op",
      "duolingo",
      "airbnb",
      "starbucks"
    ].some((keyword) => text.includes(keyword));
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
  const bodyBlocks = parseBodyBlocks(content.body_markdown);
  const body = bodyBlocks.filter((block) => block.type === "paragraph").map((block) => block.text);
  const summary = getDecisionLogString(content.decision_log, "summary");
  const avgScrollDepth = content.view_count ? Math.round((content.total_scroll_depth ?? 0) / content.view_count) : 0;
  const dek = buildDek({ summary, body, title: content.title });
  const eyebrowClass = categoryToEyebrowClass(category);
  const imageUrl = content.image_url || getEditorialFallbackImage(eyebrowClass, content.slug);

  return {
    id: content.id,
    slug: content.slug,
    eyebrow: category.toUpperCase(),
    eyebrowClass,
    titleHtml: escapeHtml(content.title),
    dek,
    author: "Redação CoopNews",
    readTime: estimateReadTime(content.body_markdown),
    placeholder: placeholderFromSlug(content.slug),
    imageUrl,
    sourceUrl: content.source_url,
    bodyMarkdown: content.body_markdown,
    relevanceScore: content.relevance_score,
    decisionLog: content.decision_log,
    viewCount: content.view_count ?? 0,
    clickCount: content.click_count ?? 0,
    totalEngagedSeconds: content.total_engaged_seconds ?? 0,
    qualityViewCount: content.quality_view_count ?? 0,
    avgScrollDepth,
    completedReadCount: content.completed_read_count ?? 0,
    shareCount: content.share_count ?? 0,
    completionRate: content.view_count
      ? Math.min(100, Math.round(((content.completed_read_count ?? 0) / content.view_count) * 100))
      : 0,
    isAiGenerated: true,
    tldr: content.tldr ?? null,
    storyJson: Array.isArray(content.story_json)
      ? content.story_json.map((slide) => ({
          kicker: String(slide?.kicker ?? ""),
          title: String(slide?.title ?? ""),
          body: String(slide?.body ?? "")
        }))
      : [],
    section: "editorias",
    body: body.length > 0 ? body : ["Matéria reescrita pela redação do CoopNews."],
    bodyBlocks: bodyBlocks.length > 0 ? injectVisualRhythm(bodyBlocks) : [{ type: "paragraph", text: "Matéria reescrita pela redação do CoopNews." }]
  };
}

function getDecisionLogString(log: Record<string, unknown>, key: string) {
  const value = log?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function buildDek({ summary, body, title }: { summary: string; body: string[]; title: string }) {
  const cleanSummary = summary.trim();
  const firstParagraph = (body[0] ?? "").trim();
  const summaryDuplicatesBody =
    cleanSummary.length > 40 &&
    firstParagraph.length > 40 &&
    normalizeText(cleanSummary).slice(0, 80) === normalizeText(firstParagraph).slice(0, 80);

  if (cleanSummary && !summaryDuplicatesBody) {
    return toLead(cleanSummary);
  }

  return toLead(synthesizeDek(title, body));
}

function synthesizeDek(title: string, body: string[]) {
  const brand = title.split(":")[0].replace(/\s+\|\s+.*/, "").trim();
  const secondParagraph = (body[1] ?? "").trim();

  if (secondParagraph) {
    return secondParagraph;
  }

  if (brand && brand.length < 52) {
    return `Como ${brand} transforma marca, vínculo e experiência em vantagem competitiva para a economia cooperativa.`;
  }

  return "Análise estratégica do CoopNews para o marketing cooperativista global.";
}

function markdownToParagraphs(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/^#+\s+/gm, "").replace(/\*\*/g, "").trim())
    .filter(Boolean);
}

function parseBodyBlocks(markdown: string): ArticleBodyBlock[] {
  const blocks: ArticleBodyBlock[] = [];
  for (const rawBlock of markdown.split(/\n{2,}/)) {
    const block = rawBlock.trim();
    if (!block) continue;

    if (/^#{1,3}\s+/.test(block)) {
      const text = block.replace(/^#+\s+/, "").replace(/\*\*/g, "").trim();
      if (text) blocks.push({ type: "heading", text });
      continue;
    }

    if (block.startsWith("> ")) {
      const text = block.replace(/^>\s+/gm, "").replace(/\*\*/g, "").trim();
      if (text) blocks.push({ type: "quote", text });
      continue;
    }

    const cleaned = block.replace(/\*\*/g, "").trim();
    if (cleaned) blocks.push({ type: "paragraph", text: cleaned });
  }
  return blocks;
}

// When the AI returned no H2 (most legacy content), inject editorial rhythm:
// - promote one short standalone sentence in the first third to "emphasis" lead.
// - synthesize a heading roughly every 4 paragraphs from the next paragraph's
//   first 6 substantive words, so long reads break into scannable sections like
//   NYT, Substack, and B9.
function injectVisualRhythm(blocks: ArticleBodyBlock[]): ArticleBodyBlock[] {
  const hasHeading = blocks.some((block) => block.type === "heading");
  if (hasHeading) return blocks;

  const result: ArticleBodyBlock[] = [];
  let paragraphCount = 0;

  blocks.forEach((block, index) => {
    if (block.type !== "paragraph") {
      result.push(block);
      return;
    }

    paragraphCount += 1;

    if (paragraphCount > 1 && paragraphCount % 4 === 1 && index < blocks.length - 1) {
      result.push({ type: "heading", text: synthesizeHeading(block.text) });
    }

    if (paragraphCount === 2 && block.text.length < 220 && /[.!?]\s*$/.test(block.text)) {
      result.push({ type: "emphasis", text: block.text });
      return;
    }

    result.push(block);
  });

  return result;
}

function synthesizeHeading(paragraph: string) {
  const words = paragraph
    .replace(/^[“"]+/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 7)
    .join(" ");
  return words.replace(/[,.;:!?]+$/, "").trim();
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
