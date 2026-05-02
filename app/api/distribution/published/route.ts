import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const FALLBACK_SUPABASE_URL = "https://vgjbkoxjphgpovtxdvlu.supabase.co";

// Bloco C — webhook de distribuição. Acionado pelo n8n quando uma matéria
// muda para status='published'. Resolve o artigo, busca metadados,
// monta payloads canônicos e devolve em formato pronto pro n8n disparar
// nas próximas etapas (LinkedIn API · Substack API/RSS · Newsletter
// transactional). O envio em si fica nos workflows do n8n; aqui é só o
// hub que entrega tudo formatado num lugar só.
//
// Esse contrato evita que o n8n precise consultar várias rotas: 1 webhook,
// vários canais. Quando a integração com LinkedIn/Substack ficar pronta,
// basta o n8n consumir os campos `linkedin_payload` / `substack_payload`.

type PublishedRequest = {
  api_key: string;
  // Aceita id ou slug. Mais robusto que pedir um único formato ao n8n.
  article_id?: string;
  article_slug?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<PublishedRequest>;

  const expectedKey = process.env.NEWSLETTER_API_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: "missing NEWSLETTER_API_KEY env var" }, { status: 500 });
  }
  if (body.api_key !== expectedKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const identifier = body.article_id ?? body.article_slug;
  if (!identifier) {
    return NextResponse.json({ error: "article_id or article_slug required" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
  if (!serviceKey) {
    return NextResponse.json({ error: "missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: article, error } = await supabase
    .from("contents")
    .select("id, slug, title, body_markdown, decision_log, image_url, category, tldr, published_at, status")
    .or(`id.eq.${identifier},slug.eq.${identifier}`)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!article) return NextResponse.json({ error: "article not found" }, { status: 404 });
  if (article.status !== "published") {
    return NextResponse.json({ error: "article is not published yet" }, { status: 409 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coopnews-9gbm.vercel.app";
  const decision = (article.decision_log ?? {}) as Record<string, unknown>;
  const dek = typeof decision.summary === "string" ? decision.summary : (article.tldr ?? article.title);
  const articleUrl = (channel: string) =>
    `${siteUrl}/materias/${article.slug}?utm_source=${channel}&utm_medium=auto_publish&utm_campaign=briefing-co`;

  // LinkedIn: máximo 3000 caracteres no post de share. Usa hashtags
  // derivadas da categoria pra alcance temático. Versão resumida.
  const linkedin_payload = {
    text: composeLinkedInText({
      title: article.title,
      dek: String(dek),
      url: articleUrl("linkedin"),
      hashtags: hashtagsFor(article.category)
    }),
    canonical_url: articleUrl("linkedin")
  };

  // Substack: API ou RSS push. Estrutura semelhante a um post normal.
  const substack_payload = {
    title: article.title,
    subtitle: String(dek).slice(0, 280),
    body_markdown: article.body_markdown,
    canonical_url: articleUrl("substack"),
    cover_image: article.image_url
  };

  return NextResponse.json({
    article: {
      id: article.id,
      slug: article.slug,
      title: article.title,
      published_at: article.published_at,
      site_url: `${siteUrl}/materias/${article.slug}`
    },
    linkedin_payload,
    substack_payload
  });
}

function composeLinkedInText(params: { title: string; dek: string; url: string; hashtags: string[] }) {
  const lines = [params.title, "", params.dek, "", `Leia o briefing completo: ${params.url}`, "", params.hashtags.join(" ")];
  return lines.join("\n").slice(0, 3000);
}

function hashtagsFor(category: string | null) {
  const base = ["#cooperativismo", "#marketingcooperativista", "#briefingco"];
  const normalized = (category ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (normalized.includes("ia") || normalized.includes("tech") || normalized.includes("automacao")) base.push("#cooptech", "#martech");
  if (normalized.includes("bem") || normalized.includes("esg") || normalized.includes("fora")) base.push("#esg", "#purposedriven");
  return base;
}
