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
    source_terms: string[];
    source_url: string;
  };
  story_json: StorySlide[];
};

const DEFAULT_TERMS = [
  "campanha publicidade cooperativa",
  "cooperativa campanha marketing agencia",
  "marketing cooperativista campanha brasil",
  "campanha sicredi sicoob unimed publicidade"
];

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_PUBLISH_THRESHOLD = 0.72;

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Use POST" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const serperKey = Deno.env.get("SERPER_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const model = Deno.env.get("OPENAI_MODEL") ?? DEFAULT_MODEL;

  if (!supabaseUrl || !serviceKey || !openaiKey) {
    return json({ error: "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or OPENAI_API_KEY" }, 500);
  }

  const body = await request.json().catch(() => ({}));
  const terms = normalizeTerms(body.terms);
  const limit = clampNumber(body.limit, 1, 10, 3);
  const publishThreshold = clampNumber(body.publish_threshold, 0, 1, DEFAULT_PUBLISH_THRESHOLD);
  const dryRun = Boolean(body.dry_run);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  const discovered = await getDiscoveryItems({ body, serperKey, terms, limit });
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
  limit
}: {
  body: Record<string, unknown>;
  serperKey: string | undefined;
  terms: string[];
  limit: number;
}) {
  if (typeof body.url === "string" && body.url.startsWith("http")) {
    return [{ title: body.url, link: body.url }] satisfies DiscoveryItem[];
  }

  if (!serperKey) {
    throw new Error("Missing SERPER_API_KEY for discovery mode. Send { url } for manual ingestion.");
  }

  return discoverStories(serperKey, terms, limit);
}

async function discoverStories(apiKey: string, terms: string[], limit: number) {
  const results: DiscoveryItem[] = [];

  for (const q of terms) {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q, gl: "br", hl: "pt-br", num: limit })
    });

    if (!response.ok) continue;
    const payload = await response.json();
    results.push(...(payload.organic ?? []));
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
            "Voce e um editor senior do Coop News, um jornal de marketing, criatividade e tecnologia para o cooperativismo brasileiro. Refine o texto em uma materia editorial e uma Web Story de 5 slides. Foque em insight, estrategia, agencia, tecnologia e impacto. Se o conteudo nao for relevante para marketing, criatividade, tecnologia, comunicacao ou cooperativismo, retorne apenas {\"verdict\":\"discard\"}."
        },
        {
          role: "user",
          content: JSON.stringify({
            expected_schema: {
              title: "string",
              slug: "kebab-case string",
              category: "Criatividade|Martech|IA|Comunicacao do Bem|Automacao|La Fora|Marketing Cooperativista",
              body_markdown: "4 to 8 short paragraphs in Portuguese",
              geo_location: "BR-SP, BR-RS etc or null",
              relevance_score: "0 to 1",
              publish: `boolean, true only when relevance_score >= ${input.publishThreshold}`,
              decision_log: {
                verdict: "publish|draft|discard",
                reasons: ["string"],
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
  if (parsed.verdict === "discard") return null;

  const relevanceScore = Number(parsed.relevance_score ?? 0);
  const title = clean(parsed.title) || input.scraped.title;

  return {
    title,
    slug: slugify(parsed.slug || title),
    body_markdown: clean(parsed.body_markdown),
    category: clean(parsed.category) || "Marketing Cooperativista",
    geo_location: clean(parsed.geo_location) || null,
    relevance_score: Number.isFinite(relevanceScore) ? relevanceScore : 0,
    publish: Boolean(parsed.publish && relevanceScore >= input.publishThreshold),
    decision_log: {
      verdict: parsed.publish && relevanceScore >= input.publishThreshold ? "publish" : "draft",
      reasons: Array.isArray(parsed.decision_log?.reasons) ? parsed.decision_log.reasons.map(String) : [],
      source_terms: input.sourceTerms,
      source_url: input.sourceUrl
    },
    story_json: normalizeSlides(parsed.story_json)
  };
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
