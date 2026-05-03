import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FALLBACK_SUPABASE_URL = "https://vgjbkoxjphgpovtxdvlu.supabase.co";

// Cadência oficial (decisão do founder): Terça 07h BRT + Quinta 07h BRT.
// Vercel Cron está em UTC → schedule: "0 10 * * 2" e "0 10 * * 4"
// (configurado em vercel.json).
//
// O n8n continua sendo o orquestrador primário (decisão arquitetural).
// Este cron é uma SAFETY NET: dispara automaticamente se o n8n cair, mas
// só executa quando NEWSLETTER_CRON_ENABLED=true. Por padrão fica off pra
// não duplicar o envio do n8n. Liga via env var quando precisar.

export async function GET(request: Request) {
  // Vercel Cron envia Authorization: Bearer <CRON_SECRET>. Bloqueio
  // qualquer request externa que tente disparar a newsletter manualmente
  // sem o secret correto.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (process.env.NEWSLETTER_CRON_ENABLED !== "true") {
    return NextResponse.json({
      skipped: true,
      reason: "NEWSLETTER_CRON_ENABLED is not 'true' — n8n is the primary dispatcher"
    });
  }

  const newsletterApiKey = process.env.NEWSLETTER_API_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
  if (!newsletterApiKey || !serviceKey) {
    return NextResponse.json({ error: "missing NEWSLETTER_API_KEY or SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const day = searchParams.get("day") ?? "tuesday";

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Janela: últimos 7 dias (cobre os dois disparos por semana sem perder
  // matérias publicadas entre Ter e Qui).
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recent, error: recentError } = await supabase
    .from("contents")
    .select("id, slug, title, published_at")
    .eq("status", "published")
    .gte("published_at", sevenDaysAgo)
    .order("published_at", { ascending: false })
    .limit(8);

  if (recentError) return NextResponse.json({ error: recentError.message }, { status: 500 });
  if (!recent || recent.length === 0) {
    return NextResponse.json({ skipped: true, reason: "no fresh content this week", day });
  }

  const editionLabel = composeEditionLabel(day);
  const sendUrl = new URL("/api/newsletter/send", request.url);

  const sendResponse = await fetch(sendUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: newsletterApiKey,
      article_ids: recent.map((r) => r.id),
      vertical: "all",
      edition_label: editionLabel,
      dry_run: false
    })
  });

  const sendBody = await sendResponse.json().catch(() => ({}));
  return NextResponse.json({
    triggered_by: "vercel_cron",
    day,
    edition_label: editionLabel,
    article_count: recent.length,
    send_status: sendResponse.status,
    send_body: sendBody
  });
}

function composeEditionLabel(day: string) {
  const now = new Date();
  const month = now.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  const dayLabel = day === "thursday" ? "Edição de quinta" : "Edição de terça";
  return `${dayLabel} — ${now.getDate()} de ${month}`;
}
