import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const FALLBACK_SUPABASE_URL = "https://vgjbkoxjphgpovtxdvlu.supabase.co";

// One-click unsubscribe: aceita GET (link clicado em email) E POST (header
// List-Unsubscribe-Post=One-Click do Gmail/Apple). Idempotente.

async function handle(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return jsonOrPage("Token inválido.", 400);
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
  if (!serviceKey) return jsonOrPage("Configuração de servidor incompleta.", 500);

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("leads")
    .update({ subscribed_newsletter: false, unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .select("email")
    .maybeSingle();

  if (error) return jsonOrPage(error.message, 500);
  if (!data) return jsonOrPage("Esse link de cancelamento já não está mais ativo.", 404);

  return new NextResponse(renderUnsubscribePage(data.email), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

function jsonOrPage(message: string, status: number) {
  return new NextResponse(renderUnsubscribePage(null, message), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

function renderUnsubscribePage(email: string | null, errorMessage?: string) {
  const title = errorMessage ? "Não foi possível cancelar" : "Inscrição cancelada";
  const headline = errorMessage
    ? errorMessage
    : email
      ? `Pronto. ${email} não vai mais receber o Briefing.Co.`
      : "Pronto. Você não vai mais receber o Briefing.Co.";
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} · Briefing.Co</title>
<style>
  :root { --ink:#0A0A0A; --paper:#FAFAF7; --brand:#C7F542; --mute:#5C5C58; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: var(--paper); color: var(--ink); font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; min-height: 100vh; display: grid; place-items: center; }
  .card { width: 100%; max-width: 480px; padding: 44px 36px; margin: 24px; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-top: 4px solid ${errorMessage ? "#FF5A36" : "var(--brand)"}; }
  .tag { display: inline-block; padding: 4px 10px 3px; background: var(--ink); color: var(--brand); font-size: 10px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; }
  h1 { margin: 14px 0 10px; font-family: Georgia, serif; font-weight: 700; font-size: 32px; line-height: 1.12; }
  p { margin: 0 0 18px; font-size: 15px; line-height: 1.55; color: var(--mute); }
  a { display: inline-block; margin-top: 10px; padding: 12px 20px; background: var(--ink); color: var(--brand); text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; }
  a:hover { background: var(--brand); color: var(--ink); }
</style>
</head>
<body>
  <main class="card">
    <span class="tag">Briefing.Co</span>
    <h1>${headline}</h1>
    ${errorMessage ? "" : "<p>Se foi sem querer, o cadastro continua valendo no portal — basta responder esse email pra reativar a newsletter.</p>"}
    <a href="https://coopnews-9gbm.vercel.app">Voltar ao portal</a>
  </main>
</body>
</html>`;
}
