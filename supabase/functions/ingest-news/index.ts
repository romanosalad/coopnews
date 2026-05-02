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
  summary: string;
  body_markdown: string;
  category: string;
  geo_location: string | null;
  relevance_score: number;
  publish: boolean;
  decision_log: {
    verdict: "publish" | "draft" | "discard";
    reasons: string[];
    summary: string;
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
  "Arla cooperative brand campaign marketing",
  "\"B Corp\" \"brand campaign\" agency social impact",
  "\"ESG\" \"marketing campaign\" brand agency community",
  "\"purpose driven\" \"brand campaign\" cooperative inspiration",
  // CoopTech feed: tech / AI / automation that the editor will reframe with a
  // cooperative angle. These articles do not need to mention coops upfront.
  "\"AI agent\" marketing 2026 case",
  "\"agentic AI\" marketing automation",
  "\"AGI\" marketing brand strategy",
  "GPT marketing automation case study",
  "\"marketing automation\" AI 2026 case",
  "\"customer data platform\" AI 2026",
  "\"martech\" \"AI\" \"customer journey\" 2026",
  "\"low-code\" marketing operations 2026",
  "Salesforce Einstein marketing case 2026",
  "HubSpot AI marketing case 2026",
  "Adobe Sensei marketing case 2026"
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

      if (!hasExplicitCoopOrLaForaSignal(scraped.text, scraped.title)) {
        discarded.push({ url: item.link, reason: "coop_only_inferred_per_guidelines" });
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

      // C-MAD art direction: when the source article shipped no og:image,
      // call our internal creative-director agent to compose a cover via
      // OpenAI gpt-image-1, store it in Supabase Storage, and use that URL.
      const coverImageUrl = await ensureCoverImage({
        scrapedImageUrl: scraped.imageUrl,
        refined,
        slug: refined.slug || slugify(refined.title),
        supabase,
        openaiKey,
        dryRun
      });

      const record = {
        title: refined.title,
        slug: refined.slug || slugify(refined.title),
        body_markdown: refined.body_markdown,
        source_url: item.link,
        story_json: refined.story_json,
        image_url: coverImageUrl,
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
            "Voce e o Editor-Chefe do CoopNews. Sua escrita FUNDE tres referencias brasileiras de jornalismo de marketing: Meio & Mensagem (precisao factual, atribuicao de fonte, dado especifico, nome de marca, agencia, executivo), B9 (irreverencia, ironia leve, frases curtas, cinismo afetuoso, posicionamento autoral) e Mundo do Marketing (analise estrategica, leitura entre fato e consequencia, nomeia o movimento por tras do release).\n\n=== VOZ CANONICA (LEIA ATENTO) ===\nO leitor e CMO, head de comunicacao, planejador, redator publicitario, gerente de marketing de cooperativa. Fala com ele de igual para igual. Use 'voce' quando precisar. Use ironia. Use gancho. Cite agencia, autor de campanha, premio que ganhou, valor investido, share, ROI quando o release der.\n\nAbra a materia com:\n- um fato seco (\"A Sicredi tirou R$ 18 milhoes do digital pra colocar em radio AM. Sim, 2026.\")\n- ou uma cena (\"O briefing chegou as 22h de uma sexta. A campanha precisava ir ao ar na segunda.\")\n- ou um contraste (\"Enquanto bancos tradicionais demitiam CMOs, a Unicred contratou tres.\")\nNUNCA abra com 'No cenario atual', 'Em um mundo cada vez mais', 'Surge como', 'Uma nova', 'A crescente demanda', 'A inovacao nao se limita', 'Em meio a transformacoes'. Se voce escrever uma dessas, JOGUE FORA e refaca.\n\n=== ANTI-PADROES (BANIDOS) ===\n- Adjetivos vazios: 'disruptivo', 'inovador', 'revolucionario', 'estrategico' (sem dizer a estrategia), 'unico', 'pioneiro', 'visionario', 'sinergia', 'alavancar', 'potencializar'.\n- Frases moldadas em release: 'visa democratizar', 'busca posicionar-se', 'tem como objetivo', 'se propoe a', 'esta comprometida com', 'reforca seu compromisso'.\n- Generalidades sem prova: 'o mercado mudou', 'os consumidores estao exigentes', 'as marcas precisam se adaptar'.\n- Voz passiva tipo 'foi lancada', 'foi anunciada' quando da pra dizer quem lancou e por que.\n- Paragrafos jumbao com 6+ frases. Maximo 3 frases por paragrafo. Quase sempre 1 ou 2.\n\n=== RITMO ===\nAlterne paragrafo curto (1 frase) com paragrafo medio (2-3 frases). Use ponto final como pausa de cena. Frase curta vale ouro. Coloque um aposto ironico quando der.\n\nExemplo de ritmo desejado:\n\"A Coletiv nasceu de uma conta basica que ninguem queria fazer. Quanto fica pra agencia, quanto fica pra freela, quanto fica pra plataforma. No fim, sobra menos pra quem entrega.\n\nBeto Rogoski e Leticia Meira somaram 18 anos de DM9, F.biz e AlmapBBDO antes de bater na mesa. Em vez de abrir mais uma agencia, abriram uma cooperativa de servico criativo. Sem CLT, sem PJ predatorio, com divisao de lucro entre os 32 socios fundadores.\n\nA aposta e provocadora: se o mercado publicitario brasileiro fatura R$ 56 bilhoes por ano, por que o redator senior leva 0,3% do briefing que escreveu? A Coletiv responde com uma planilha aberta e um contrato curto.\"\n\n=== TITULO ===\nMaximo 75 caracteres. Use UM destes formatos:\n1. Pergunta provocativa: 'Por que o roxo do Nubank deixou de ser ousadia?'\n2. Tese forte: 'O fim do tom corporativo no marketing financeiro'\n3. Contraste: 'Mais marca, menos folder: como Sicredi virou referencia'\n4. Numero + insight: 'Em 90 dias, tres agencias provaram que cooperativismo vende'\n5. Cena curta: 'A coruja do Duolingo matou o tom institucional'\nProibido titulo tipo 'Empresa X lanca produto Y'. Proibido gerundio. Proibido voz passiva.\n\n=== PRE-RESUMO (summary) ===\nMaximo 160 caracteres. Sentenca editorial autonoma que antecipa a tensao OU a licao. Nao copie a primeira frase do body_markdown. Exemplo: 'Cor chama atencao no comeco. Sistema, voz e experiencia sustentam diferenciacao depois.'\n\n=== CORPO (body_markdown) ===\nPortugues do Brasil. 8 a 12 paragrafos curtos. Maximo 3 frases por paragrafo (tres frases curtas; nao tres frases longas). Para artigos longos use 2-3 H2 (## Titulo) com frase editorial de no maximo 55 caracteres - H2 e gancho, nao etiqueta. Use > para UMA frase de destaque (citacao real ou tese da materia). NAO use bullet list inline. Atribua fontes quando der ('segundo o release', 'a fundadora contou ao Meio & Mensagem'). Cite numeros, valores, nomes de pessoas e agencias.\n\nEstrutura recomendada:\n1. Fato seco ou cena (1 paragrafo curto)\n2. Quem fez, quanto custou, com quem ('A Sicredi assinou com a David Sao Paulo...')\n3. Por que isso importa AGORA (contexto rapido)\n4. Como funciona o movimento (descrita a estrategia)\n5. O que ja foi medido (ou onde o resultado vai aparecer)\n6. ## H2 - leitura estrategica (analise editorial, voz autoral)\n7. Comparacao com mercado ('a Cyrela tentou algo parecido em 2023; nao colou porque...')\n8. ## H2 - o que fica (takeaway pratico para o leitor)\n9. Frase de fechamento curta com peso\n\nPara CoopTech especificamente, o ultimo bloco DEVE ser '## O que isso significa para o coop' com 1-2 paragrafos aplicando a tecnologia a uma cooperativa brasileira de credito, agro, saude ou consumo. Nome do tipo de cooperativa. Movimento concreto que ela faria.\n\n=== C-MAD (obrigatorio) ===\nQuatro campos. Cada um e uma sentenca com sujeito + verbo + consequencia. Etiqueta vaga como 'branding forte' nao passa.\n- coop_business: o que muda para o cooperado, para a operacao ou para a marca cooperativa?\n- marketing: qual movimento de posicionamento, awareness ou competicao?\n- art_craft: o que tem de notavel em direcao de arte, copy, casting, fotografia?\n- design_ux: como afeta jornada, atendimento ou pertencimento?\n\n=== TRES CAMINHOS DE PUBLICACAO ===\n1. CAPA: fonte fala EXPLICITAMENTE de cooperativa, co-operative, co-op, credit union, mutual, building society, cooperative group ou marca cooperativa reconhecivel.\n2. LA FORA: fonte fala de B Corp, ESG, marca de proposito, impacto social, caso-icone (Duolingo, Patagonia, Mercado Livre, Ben & Jerry's). Reescreva extraindo o aprendizado para cooperativas.\n3. COOPTECH: fonte fala de IA, AGI, agentic AI, GPT/LLM, automacao, martech, CDP, low-code, RPA ou plataforma de dados aplicada a marketing. Voce DEVE incluir o bloco '## O que isso significa para o coop' no final.\n\nFora dessas tres rotas = verdict=discard. Roundups, SEO generico, '5 dicas para X' = descarte.\n\n=== CADERNOS PARA AI ===\nApenas Capa, CoopTech, La Fora. Vozes e Forum sao humanos.\n\n=== RESPOSTA ===\nSomente JSON valido. Se irrelevante: {\"verdict\":\"discard\"}."
        },
        {
          role: "user",
          content: JSON.stringify({
            expected_schema: {
              verdict: "publish|draft|discard",
              title: "EDITORIAL Brazilian Portuguese title, HARD LIMIT 75 chars. MUST follow one of the formats: question, thesis, contrast, number+insight, action+tension. NEVER literal translation. NEVER 'Brand X launches Y' style.",
              slug: "kebab-case string",
              summary: "pre-summary for feed, HARD LIMIT 160 chars, MUST anticipate tension or lesson, MUST be a standalone editorial sentence, MUST NOT copy or paraphrase the first sentence of body_markdown",
              category: "Criatividade|Martech|IA|Comunicacao do Bem|Automacao|La Fora|Marketing Cooperativista|Cooperativismo Global",
              body_markdown:
                "6 to 9 short paragraphs in Brazilian Portuguese, rewritten as an original Coop News article. MUST include >=2 H2 sections (## Section title) for any article >600 words. NO bullet lists. NO copied lead. NO source link inside body. Max 4 sentences per paragraph.",
              geo_location: "US, GB, CA, AU, NZ, DE, FR, NL, SE, JP, BR-SP etc or null",
              relevance_score: `0 to 1, use >= ${input.publishThreshold} only for complete and clearly relevant articles`,
              publish: `boolean, true only when verdict is publish and relevance_score >= ${input.publishThreshold}`,
              decision_log: {
                verdict: "publish|draft|discard",
                reasons: ["string"],
                desk: "Capa|CoopTech|La Fora",
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

  const title = enforceTitleLimit(clean(parsed.title) || input.scraped.title);
  const bodyMarkdown = clean(parsed.body_markdown);
  const rawSummary = enforceSummaryLimit(clean(parsed.summary));
  const firstParagraph = bodyMarkdown.split(/\n{2,}/)[0]?.trim() ?? "";
  const summary = isSummaryDuplicateOfBody(rawSummary, firstParagraph) ? "" : rawSummary;
  const slides = normalizeSlides(parsed.story_json);
  const rawScore = Number(parsed.relevance_score ?? parsed.relevanceScore ?? parsed.score);
  const hasCompleteArticle = bodyMarkdown.length >= 600;
  const hasCompleteStory = slides.length === 5 && slides.every((slide) => slide.title && slide.body);
  const passesEditorialVoice = passesEditorialVoiceCheck(bodyMarkdown);
  const inferredScore = hasCompleteArticle && hasCompleteStory ? 0.78 : 0;
  const baseScore = Number.isFinite(rawScore) && rawScore > 0 ? rawScore : inferredScore;
  const relevanceScore = passesEditorialVoice ? baseScore : Math.min(baseScore, 0.55);
  const shouldPublish =
    hasCompleteArticle &&
    hasCompleteStory &&
    passesEditorialVoice &&
    relevanceScore >= input.publishThreshold;

  return {
    title,
    slug: slugify(parsed.slug || title),
    summary,
    body_markdown: bodyMarkdown,
    category: clean(parsed.category) || "Marketing Cooperativista",
    geo_location: clean(parsed.geo_location) || null,
    relevance_score: Number.isFinite(relevanceScore) ? relevanceScore : 0,
    publish: shouldPublish,
    decision_log: {
      verdict: shouldPublish ? "publish" : "draft",
      reasons: [
        ...(Array.isArray(parsed.decision_log?.reasons) ? parsed.decision_log.reasons.map(String) : []),
        ...(passesEditorialVoice ? [] : ["editorial_voice_check_failed: release-style opener, banned phrases or jumbao paragraphs"])
      ],
      summary,
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

// Per GUIDELINES: Vozes is human opinion only, Forum is community ranking.
// AI ingestion must never publish into either; remap to the closest editorial
// desk so the editorial identity stays intact.
function normalizeDesk(value: unknown, category: unknown): RefinedStory["decision_log"]["desk"] {
  const normalized = clean(value || category).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("tech") || normalized.includes("martech") || normalized.includes("ia") || normalized.includes("automacao")) return "CoopTech";
  if (normalized.includes("fora") || normalized.includes("esg") || normalized.includes("b corp") || normalized.includes("bem")) return "La Fora";
  if (normalized.includes("vozes") || normalized.includes("opiniao") || normalized.includes("forum") || normalized.includes("ranking")) return "Capa";
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

// C-MAD ART DIRECTION AGENT
// When the source article has no usable cover, the editor-in-chief escalates
// to our internal creative-director persona. It synthesizes a brief from the
// C-MAD analysis (Coop Business / Marketing / Art-Craft / Design-UX) and
// drives gpt-image-1 to produce a 16:9 editorial cover. The output is uploaded
// to the public `article-covers` bucket and returned as a CDN URL ready for
// the homepage.
//
// Costs: gpt-image-1 medium quality at 1536x1024 is ~$0.04 per image. Only
// fires when scraped og:image is absent, so cost is bounded by the share of
// articles that ship without a cover.
async function ensureCoverImage(params: {
  scrapedImageUrl: string | null;
  refined: RefinedStory;
  slug: string;
  supabase: ReturnType<typeof createClient>;
  openaiKey: string;
  dryRun: boolean;
}): Promise<string | null> {
  const { scrapedImageUrl, refined, slug, supabase, openaiKey, dryRun } = params;

  if (scrapedImageUrl && (await isImageReachable(scrapedImageUrl))) {
    return scrapedImageUrl;
  }

  if (dryRun) {
    return scrapedImageUrl ?? null;
  }

  try {
    const brief = composeArtDirectionBrief(refined);
    const generated = await generateCoverWithOpenAI(openaiKey, brief);
    if (!generated) return scrapedImageUrl ?? null;

    const path = `${slug}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage.from("article-covers").upload(path, generated, {
      contentType: "image/png",
      upsert: true,
      cacheControl: "604800"
    });
    if (uploadError) {
      console.error("cover_upload_failed", uploadError);
      return scrapedImageUrl ?? null;
    }

    const { data } = supabase.storage.from("article-covers").getPublicUrl(path);
    return data?.publicUrl ?? scrapedImageUrl ?? null;
  } catch (error) {
    console.error("ensure_cover_failed", error);
    return scrapedImageUrl ?? null;
  }
}

async function isImageReachable(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!response.ok) return false;
    const contentType = response.headers.get("content-type") ?? "";
    return contentType.startsWith("image/");
  } catch {
    return false;
  }
}

// Brief follows the C-MAD matrix: Coop Business sets the subject, Marketing
// sets the tone, Art/Craft sets the visual language, Design/UX sets the
// composition. Hard constraints (no text, no logos, palette, ratio) are at
// the top so the model honours them even when prompt details overflow.
function composeArtDirectionBrief(refined: RefinedStory) {
  const cmad = refined.decision_log.cmad;
  const desk = refined.decision_log.desk;

  const moodByDesk: Record<string, string> = {
    Capa: "warm, market-savvy, human-centered. Conceptual editorial photography vibe.",
    CoopTech: "tech-forward, optimistic, slightly futuristic. Clean studio composition or abstract data visual.",
    "La Fora": "globally aspirational, brand-aware, refined. Modern lifestyle or product still life."
  };

  return [
    "Editorial cover image for CoopNews, a Brazilian cooperative-marketing magazine.",
    "ABSOLUTE CONSTRAINTS: no text, no letters, no typography, no logos, no watermarks, no captions inside the image. The frontend overlays text separately.",
    "Aspect ratio 16:9, centered subject with breathing room on the edges.",
    "Color palette: off-white #FAFAF7 paper or deep #0A0A0A ink as the base. Lime accent #C7F542 and coral accent #FF5A36 used sparingly for energy. Avoid muddy or over-saturated colors.",
    "Style reference: editorial covers from The Atlantic, Bloomberg Businessweek, B9, and Substack.",
    `Article title: ${refined.title}`,
    `Editorial summary: ${refined.summary}`,
    `Visual concept derived from C-MAD analysis:`,
    `- Subject (Coop Business): ${cmad.coop_business}`,
    `- Tone (Marketing): ${cmad.marketing}`,
    `- Craft (Art/Craft): ${cmad.art_craft}`,
    `- Composition (Design/UX): ${cmad.design_ux}`,
    `Mood: ${moodByDesk[desk] ?? moodByDesk.Capa}`,
    "Render as a single bold image, NOT a collage. High contrast. Magazine-cover quality."
  ].join("\n");
}

async function generateCoverWithOpenAI(apiKey: string, prompt: string): Promise<Uint8Array | null> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1536x1024",
      quality: "medium",
      n: 1
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("image_gen_failed", response.status, text.slice(0, 240));
    return null;
  }

  const payload = await response.json();
  const base64 = payload?.data?.[0]?.b64_json;
  if (!base64 || typeof base64 !== "string") return null;

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// GUIDELINES gate. Three valid editorial paths:
// 1. Coop signal -> publish as Capa or whichever desk fits.
// 2. La Fora signal (B Corp / ESG / purpose-driven) -> publish to La Fora.
// 3. CoopTech signal (AI, AGI, automation, martech, GPT, agents, dados
//    aplicados) -> publish to CoopTech AS COMPLEMENTARY READ for the coop
//    audience; the AI must add the cooperative angle in the rewrite.
// Articles with none of these signals are discarded before spending OpenAI
// tokens.
function hasExplicitCoopOrLaForaSignal(text: string, title: string) {
  const haystack = `${title} ${text}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  const coopKeywords = [
    "cooperativ",
    "co-operative",
    "cooperative",
    "co-op",
    "credit union",
    "mutual bank",
    "mutual society",
    "building society",
    "sicredi",
    "sicoob",
    "unicred",
    "unimed",
    "rabobank",
    "desjardins",
    "nationwide",
    "rei co-op",
    "the co-operative",
    "migros",
    "arla"
  ];

  const laForaKeywords = ["b corp", "b-corp", "esg", "purpose driven", "purpose-driven", "social impact"];

  const coopTechKeywords = [
    "artificial intelligence",
    "inteligencia artificial",
    " ai ",
    " ia ",
    " agi ",
    "agentic",
    "ai agent",
    "agente de ia",
    "llm",
    "gpt",
    "openai",
    "anthropic",
    "claude",
    "gemini",
    "copilot",
    "machine learning",
    "deep learning",
    "automation",
    "automacao",
    "marketing automation",
    "martech",
    "ad tech",
    "crm platform",
    "customer data platform",
    "no-code",
    "low-code",
    "rpa",
    "saas",
    "data platform",
    "data pipeline"
  ];

  return [...coopKeywords, ...laForaKeywords, ...coopTechKeywords].some((keyword) => haystack.includes(keyword));
}

// Editorial voice gate. Catches the most common ways the model slips back
// into release-style writing: bureaucratic openers, jumbao paragraphs,
// banned adjective dump. An article that fails the gate is downgraded to
// draft so the team can rewrite or discard before it hits the homepage.
const BANNED_OPENERS = [
  "no cenario atual",
  "no cenário atual",
  "em um mundo cada vez mais",
  "surge como uma",
  "surge como o",
  "uma nova alternativa",
  "a crescente demanda",
  "a inovacao nao se limita",
  "a inovação não se limita",
  "em meio a transformacoes",
  "em meio a transformações",
  "no contexto atual"
];

const BANNED_PHRASES = [
  "visa democratizar",
  "busca posicionar",
  "tem como objetivo",
  "se propoe a",
  "se propõe a",
  "esta comprometida com",
  "está comprometida com",
  "reforca seu compromisso",
  "reforça seu compromisso",
  "alavancar resultados",
  "potencializar resultados",
  "abordagem disruptiva",
  "solucao inovadora",
  "solução inovadora"
];

function passesEditorialVoiceCheck(markdown: string): boolean {
  const normalized = markdown
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

  const firstParagraph = normalized.split(/\n{2,}/)[0] ?? "";
  const opensWithBannedPhrase = BANNED_OPENERS.some((phrase) => firstParagraph.startsWith(phrase));
  if (opensWithBannedPhrase) return false;

  const bannedHits = BANNED_PHRASES.filter((phrase) => normalized.includes(phrase)).length;
  if (bannedHits >= 2) return false;

  // Paragraph length check: at most 1 jumbao paragraph (>=5 sentences) is
  // tolerated; more than that signals release-mode writing.
  const paragraphs = markdown.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  const jumbaoCount = paragraphs.filter((p) => {
    const sentenceCount = (p.match(/[.!?]+(\s|$)/g) ?? []).length;
    return sentenceCount >= 5;
  }).length;
  if (jumbaoCount >= 2) return false;

  return true;
}

// GUIDELINES: cover titles <= 75 chars. Trim at last whitespace, append no
// ellipsis (titles must read as headlines, not truncations).
function enforceTitleLimit(value: string) {
  if (value.length <= 75) return value;
  const trimmed = value.slice(0, 75).replace(/\s+\S*$/, "").trim();
  return trimmed.length >= 30 ? trimmed : value.slice(0, 75);
}

// GUIDELINES: feed lead <= 160 chars.
function enforceSummaryLimit(value: string) {
  if (value.length <= 160) return value;
  return `${value.slice(0, 157).replace(/\s+\S*$/, "")}...`;
}

function isSummaryDuplicateOfBody(summary: string, firstParagraph: string) {
  if (!summary || !firstParagraph) return false;
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const normalizedSummary = normalize(summary);
  const normalizedHead = normalize(firstParagraph).slice(0, normalizedSummary.length);
  if (normalizedSummary.length < 30) return false;
  return normalizedHead === normalizedSummary || normalizedHead.startsWith(normalizedSummary.slice(0, 60));
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
