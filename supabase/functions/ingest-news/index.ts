import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

type StorySlide = {
  kicker: string;
  title: string;
  body: string;
};

type RefinedStory = {
  title: string;
  slug: string;
  body_markdown: string;
  geo_location: string | null;
  relevance_score: number;
  publish: boolean;
  decision_log: {
    verdict: "publish" | "draft" | "discard";
    reasons: string[];
    source_terms: string[];
  };
  story_json: StorySlide[];
};

const DEFAULT_TERMS = [
  "campanha publicidade cooperativa",
  "cooperativa campanha marketing agencia",
  "publicidade cooperativismo campanha brasil"
];

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Use POST" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const serperKey = Deno.env.get("SERPER_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!supabaseUrl || !serviceKey || !serperKey || !openaiKey) {
    return json({ error: "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SERPER_API_KEY or OPENAI_API_KEY" }, 500);
  }

  const body = await request.json().catch(() => ({}));
  const terms = Array.isArray(body.terms) && body.terms.length > 0 ? body.terms : DEFAULT_TERMS;
  const limit = Number(body.limit ?? 3);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  const discovered = await discoverStories(serperKey, terms, limit);
  const inserted = [];
  const discarded = [];

  for (const item of discovered) {
    const scraped = await scrapeArticle(item.link);
    if (!scraped.text || scraped.text.length < 500) {
      discarded.push({ url: item.link, reason: "scraped_text_too_short" });
      continue;
    }

  const refined = await refineWithOpenAI(openaiKey, Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini", {
      ...scraped,
      sourceUrl: item.link,
      sourceTerms: terms
    });

    if (!refined || refined.decision_log.verdict === "discard") {
      discarded.push({ url: item.link, reason: "ai_marked_irrelevant" });
      continue;
    }

    const { data, error } = await supabase
      .from("contents")
      .upsert(
        {
          title: refined.title,
          slug: refined.slug,
          body_markdown: refined.body_markdown,
          source_url: item.link,
          story_json: refined.story_json,
          image_url: scraped.imageUrl,
          status: refined.publish ? "published" : "draft",
          geo_location: refined.geo_location,
          relevance_score: refined.relevance_score,
          decision_log: refined.decision_log,
          published_at: refined.publish ? new Date().toISOString() : null
        },
        { onConflict: "slug" }
      )
      .select("id, slug, status, relevance_score")
      .single();

    if (error) {
      discarded.push({ url: item.link, reason: error.message });
    } else {
      inserted.push(data);
    }
  }

  return json({ inserted, discarded });
});

async function discoverStories(apiKey: string, terms: string[], limit: number) {
  const results: Array<{ title: string; link: string; snippet?: string }> = [];

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

async function scrapeArticle(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "NewsCoopBot/0.1 (+https://newscoop.local)"
    }
  });
  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, iframe, noscript, aside, form, [class*='ad'], [id*='ad']").remove();

  const title =
    $("meta[property='og:title']").attr("content") ??
    $("h1").first().text().trim() ??
    $("title").text().trim();

  const imageUrl =
    $("meta[property='og:image']").attr("content") ??
    $("meta[name='twitter:image']").attr("content") ??
    null;

  const paragraphs = $("article p, main p, p")
    .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
    .get()
    .filter((text) => text.length > 80);

  return {
    title,
    imageUrl: imageUrl ? new URL(imageUrl, url).toString() : null,
    text: paragraphs.slice(0, 18).join("\n\n")
  };
}

async function refineWithOpenAI(
  apiKey: string,
  model: string,
  input: { title: string; text: string; sourceUrl: string; sourceTerms: string[] }
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
            "Voce e um editor do Mundo do Marketing. Transforme o texto em 5 slides de Web Story. Foque em: Insight, Estrategia, Agencia e Impacto. Se o conteudo for irrelevante para o mercado publicitario, retorne {\"verdict\":\"discard\"}."
        },
        {
          role: "user",
          content: JSON.stringify({
            expected_schema: {
              title: "string",
              slug: "kebab-case string",
              body_markdown: "string",
              geo_location: "BR-SP or null",
              relevance_score: "0 to 1",
              publish: "boolean, true only when relevance_score >= 0.72",
              decision_log: { verdict: "publish|draft|discard", reasons: ["string"], source_terms: input.sourceTerms },
              story_json: [{ kicker: "string", title: "string", body: "string" }]
            },
            source_url: input.sourceUrl,
            title: input.title,
            text: input.text
          })
        }
      ]
    })
  });

  if (!response.ok) return null;

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content);
  if (parsed.verdict === "discard") return null;

  return {
    ...parsed,
    publish: Boolean(parsed.publish && parsed.relevance_score >= 0.72),
    story_json: Array.isArray(parsed.story_json) ? parsed.story_json.slice(0, 5) : []
  };
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
