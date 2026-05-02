import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

type DiscoveryItem = {
  title: string;
  link: string;
  snippet?: string;
};

type ScrapedArticle = {
  title: string;
  imageUrl: string | null;
  text: string;
};

type StorySlide = {
  kicker: string;
  title: string;
  body: string;
};

type RefinedStory = {
  title: string;
  slug: string;
  body_markdown: string;
  category: string;
  geo_location: string | null;
  relevance_score: number;
  publish: boolean;
  decision_log: {
    verdict: "publish" | "draft" | "discard";
    reasons: string[];
    cmad: {
      coop_business: string;
      marketing: string;
      art_craft: string;
      design_ux: string;
    };
    desk: "Capa" | "CoopTech" | "La Fora" | "Vozes" | "Forum";
    source_terms: string[];
    source_url: string;
  };
  story_json: StorySlide[];
};

const DEFAULT_TERMS = [
  "\"credit union\" \"brand campaign\" agency",
  "\"credit union\" \"advertising campaign\" agency",
  "\"credit union\" \"marketing campaign\" \"members\"",
  "\"cooperative bank\" \"brand campaign\" agency",
  "\"co-operative bank\" \"advertising campaign\"",
  "\"building society\" \"brand campaign\" agency",
  "\"mutual bank\" \"brand campaign\" agency",
  "Desjardins brand campaign agency marketing",
  "Rabobank brand campaign agency cooperative",
  "\"The Co-operative Bank\" campaign agency",
  "\"The Co-operative Group\" brand campaign agency",
  "\"Nationwide Building Society\" brand campaign agency",
  "\"REI Co-op\" brand campaign marketing",
  "Migros cooperative brand campaign agency",
  "Arla cooperative brand campaign marketing"
];

const DEFAULT_SEARCH_LOCALES = [
  { gl: "us", hl: "en" },
  { gl: "gb", hl: "en" },
  { gl: "ca", hl: "en" },
  { gl: "au", hl: "en" },
  { gl: "de", hl: "de" },
  { gl: "fr", hl: "fr" },
  { gl: "nl", hl: "nl" },
  { gl: "se", hl: "sv" },
  { gl: "jp", hl: "ja" }
];

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_PUBLISH_THRESHOLD = 0.72;

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Use POST" }, 405);
  }

  const supabaseUrl = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const serperKey = Deno.env.get("SERPER_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const model = Deno.env.get("OPENAI_MODEL") ?? DEFAULT_MODEL;

  const missingSecrets = [
    !supabaseUrl ? "PROJECT_URL" : null,
    !serviceKey ? "SERVICE_ROLE_KEY" : null,
    !openaiKey ? "OPENAI_API_KEY" : null
  ].filter(Boolean);

  if (missingSecrets.length > 0) {
    return json({ error: `Missing ${missingSecrets.join(", ")}` }, 500);
  }

  const body = await request.json().catch(() => ({}));
  const terms = normalizeTerms(body.terms);
  const limit = clampNumber(body.limit, 1, 10, 3);
  const maxSearches = clampNumber(body.max_searches, 1, 30, 12);
  const publishThreshold = clampNumber(body.publish_threshold, 0, 1, DEFAULT_PUBLISH_THRESHOLD);
  const dryRun = Boolean(body.dry_run);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  const discovered = await getDiscoveryItems({ body, serperKey, terms, limit, maxSearches });
  const inserted = [];
  const discarded = [];

  for (const item of discovered) {
    try {
      const scraped = await scrapeArticle(item.link);
      if (!scraped.text || scraped.text.length < 500) {
        discarded.push({ url: item.link, reason: "scraped_text_too_short" });
        continue;
      }

      const refined = await refineWithOpenAI(openaiKey, model, {
        scraped,
        sourceUrl: item.link,
        sourceTerms: terms,
        publishThreshold
      });

      if (!refined || refined.decision_log.verdict === "discard") {
        discarded.push({ url: item.link, reason: "ai_marked_irrelevant" });
        continue;
      }

      const record = {
        title: refined.title,
        slug: refined.slug || slugify(refined.title),
        body_markdown: refined.body_markdown,
        source_url: item.link,
        story_json: refined.story_json,
        image_url: scraped.imageUrl,
        status: refined.publish ? "published" : "draft",
        geo_location: refined.geo_location,
        category: refined.category || "Marketing Cooperativista",
        relevance_score: refined.relevance_score,
        decision_log: refined.decision_log,
        published_at: refined.publish ? new Date().toISOString() : null
      };

      if (dryRun) {
        inserted.push({ ...record, dry_run: true });
        continue;
      }

      const { data, error } = await supabase
        .from("contents")
        .upsert(record, { onConflict: "slug" })
        .select("id, slug, status, relevance_score, image_url")
        .single();

      if (error) {
        discarded.push({ url: item.link, reason: error.message });
      } else {
        inserted.push(data);
      }
    } catch (error) {
      discarded.push({ url: item.link, reason: error instanceof Error ? error.message : "unknown_error" });
    }
  }

  return json({ inserted, discarded, dry_run: dryRun });
});

async function getDiscoveryItems({
  body,
  serperKey,
  terms,
  limit,
  maxSearches
}: {
  body: Record<string, unknown>;
  serperKey: string | undefined;
  terms: string[];
  limit: number;
  maxSearches: number;
}) {
  if (typeof body.url === "string" && body.url.startsWith("http")) {
    return [{ title: body.url, link: body.url }] satisfies DiscoveryItem[];
  }

  if (!serperKey) {
    throw new Error("Missing SERPER_API_KEY for discovery mode. Send { url } for manual ingestion.");
  }

  return discoverStories(serperKey, terms, limit, maxSearches);
}

async function discoverStories(apiKey: string, terms: string[], limit: number, maxSearches: number) {
  const results: DiscoveryItem[] = [];
  let searches = 0;

  for (const q of terms) {
    for (const locale of DEFAULT_SEARCH_LOCALES) {
      if (searches >= maxSearches) break;
      searches += 1;

      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q, gl: locale.gl, hl: locale.hl, num: Math.min(limit, 5) })
      });

      if (!response.ok) continue;
      const payload = await response.json();
      results.push(...(payload.organic ?? []));
    }

    if (searches >= maxSearches) break;
  }

  return Array.from(new Map(results.filter((item) => item.link).map((item) => [item.link, item])).values()).slice(0, limit);
}

async function scrapeArticle(url: string): Promise<ScrapedArticle> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "NewsCoopBot/0.1 (+https://coopnews.local)"
    }
  });

  if (!response.ok) {
    throw new Error(`scrape_failed_${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, iframe, noscript, aside, form, [class*='ad'], [id*='ad'], [class*='cookie']").remove();

  const title =
    clean($("meta[property='og:title']").attr("content")) ||
    clean($("meta[name='twitter:title']").attr("content")) ||
    clean($("h1").first().text()) ||
    clean($("title").text()) ||
    url;

  const imageUrl =
    clean($("meta[property='og:image']").attr("content")) ||
    clean($("meta[name='twitter:image']").attr("content")) ||
    clean($("article img").first().attr("src")) ||
    clean($("main img").first().attr("src")) ||
    null;

  const paragraphs = $("article p, main p, [role='main'] p, p")
    .map((_, element) => clean($(element).text()))
    .get()
    .filter((text) => text.length > 80);

  return {
    title,
    imageUrl: imageUrl ? new URL(imageUrl, url).toString() : null,
    text: paragraphs.slice(0, 24).join("\n\n")
  };
}

async function refineWithOpenAI(
  apiKey: string,
  model: string,
  input: {
    scraped: ScrapedArticle;
    sourceUrl: string;
    sourceTerms: string[];
    publishThreshold: number;
  }
): Promise<RefinedStory | null> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Voce e o Editor-Chefe do CoopNews Engine V1.0. CoopNews nao e um portal institucional; e uma plataforma de market intelligence para cooperativas. Use uma voz analitica, provocativa e estrategica, com ritmo editorial proximo de B9 e Mundo do Marketing. Reescreva em portugues do Brasil: nao traduza literalmente e nao copie frases longas da fonte. Abra com o fato, depois contexto, estrategia, C-MAD e impacto. A matriz C-MAD e obrigatoria: Coop Business, Marketing, Art/Craft e Design/UX. Publique somente se a fonte falar explicitamente de cooperativa, co-operative, co-op, credit union, mutual, building society, cooperative group ou marca cooperativa reconhecivel. Descarte roundups genericos, SEO fraco e textos onde cooperativismo foi inferido. Cadernos validos: Capa para campanhas e movimentos de marketing; CoopTech para IA, automacao e martech; La Fora para B Corp/ESG/marketing do bem que inspire cooperativas; Vozes apenas para opiniao humana; Forum apenas para ranking/comunidade. Titulo de capa deve ter ate 75 caracteres; lead/feed ate 160 caracteres; artigos longos devem usar H2 a cada cerca de 300 palavras. Responda sempre e somente JSON valido no schema pedido. Se irrelevante, retorne apenas {\"verdict\":\"discard\"}."
        },
        {
          role: "user",
          content: JSON.stringify({
            expected_schema: {
              verdict: "publish|draft|discard",
              title: "string",
              slug: "kebab-case string",
              category: "Criatividade|Martech|IA|Comunicacao do Bem|Automacao|La Fora|Marketing Cooperativista|Cooperativismo Global",
              body_markdown:
                "6 to 9 short paragraphs in Brazilian Portuguese, rewritten as an original Coop News article: no bullet list, no copied lead, no source link inside the body",
              geo_location: "US, GB, CA, AU, NZ, DE, FR, NL, SE, JP, BR-SP etc or null",
              relevance_score: `0 to 1, use >= ${input.publishThreshold} only for complete and clearly relevant articles`,
              publish: `boolean, true only when verdict is publish and relevance_score >= ${input.publishThreshold}`,
              decision_log: {
                verdict: "publish|draft|discard",
                reasons: ["string"],
                desk: "Capa|CoopTech|La Fora|Vozes|Forum",
                cmad: {
                  coop_business: "string",
                  marketing: "string",
                  art_craft: "string",
                  design_ux: "string"
                },
                source_terms: input.sourceTerms,
                source_url: input.sourceUrl
              },
              story_json: [
                { kicker: "Insight", title: "string", body: "string" },
                { kicker: "Estrategia", title: "string", body: "string" },
                { kicker: "Agencia", title: "string", body: "string" },
                { kicker: "Impacto", title: "string", body: "string" },
                { kicker: "Analise", title: "string", body: "string" }
              ]
            },
            source_url: input.sourceUrl,
            scraped_title: input.scraped.title,
            scraped_text: input.scraped.text
          })
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`openai_failed_${response.status}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content);
  const modelVerdict = clean(parsed.verdict || parsed.decision_log?.verdict).toLowerCase();
  if (modelVerdict === "discard") return null;

  const title = clean(parsed.title) || input.scraped.title;
  const bodyMarkdown = clean(parsed.body_markdown);
  const slides = normalizeSlides(parsed.story_json);
  const rawScore = Number(parsed.relevance_score ?? parsed.relevanceScore ?? parsed.score);
  const hasCompleteArticle = bodyMarkdown.length >= 600;
  const hasCompleteStory = slides.length === 5 && slides.every((slide) => slide.title && slide.body);
  const inferredScore = hasCompleteArticle && hasCompleteStory ? 0.78 : 0;
  const relevanceScore = Number.isFinite(rawScore) && rawScore > 0 ? rawScore : inferredScore;
  const shouldPublish =
    hasCompleteArticle &&
    hasCompleteStory &&
    modelVerdict !== "draft" &&
    Boolean(parsed.publish !== false) &&
    relevanceScore >= input.publishThreshold;

  return {
    title,
    slug: slugify(parsed.slug || title),
    body_markdown: bodyMarkdown,
    category: clean(parsed.category) || "Marketing Cooperativista",
    geo_location: clean(parsed.geo_location) || null,
    relevance_score: Number.isFinite(relevanceScore) ? relevanceScore : 0,
    publish: shouldPublish,
    decision_log: {
      verdict: shouldPublish ? "publish" : "draft",
      reasons: Array.isArray(parsed.decision_log?.reasons) ? parsed.decision_log.reasons.map(String) : [],
      cmad: normalizeCmad(parsed.decision_log?.cmad),
      desk: normalizeDesk(parsed.decision_log?.desk, parsed.category),
      source_terms: input.sourceTerms,
      source_url: input.sourceUrl
    },
    story_json: slides
  };
}

function normalizeCmad(value: unknown) {
  const cmad = typeof value === "object" && value ? value as Record<string, unknown> : {};
  return {
    coop_business: clean(cmad.coop_business),
    marketing: clean(cmad.marketing),
    art_craft: clean(cmad.art_craft),
    design_ux: clean(cmad.design_ux)
  };
}

function normalizeDesk(value: unknown, category: unknown): RefinedStory["decision_log"]["desk"] {
  const normalized = clean(value || category).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("tech") || normalized.includes("martech") || normalized.includes("ia") || normalized.includes("automacao")) return "CoopTech";
  if (normalized.includes("fora") || normalized.includes("esg") || normalized.includes("b corp") || normalized.includes("bem")) return "La Fora";
  if (normalized.includes("vozes") || normalized.includes("opiniao")) return "Vozes";
  if (normalized.includes("forum") || normalized.includes("ranking")) return "Forum";
  return "Capa";
}

function normalizeSlides(value: unknown): StorySlide[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 5).map((slide) => ({
    kicker: clean(slide?.kicker) || "Analise",
    title: clean(slide?.title),
    body: clean(slide?.body)
  }));
}

function normalizeTerms(value: unknown) {
  if (!Array.isArray(value)) return DEFAULT_TERMS;
  const terms = value.map(String).map(clean).filter(Boolean);
  return terms.length > 0 ? terms : DEFAULT_TERMS;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function clean(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
