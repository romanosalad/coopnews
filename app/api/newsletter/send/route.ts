import { NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { createClient } from "@supabase/supabase-js";
import NewsletterDigest, {
  type NewsletterArticle,
  type NewsletterDigestProps
} from "@/emails/NewsletterDigest";
import { inferCaderno } from "@/components/ui/CadrinhoBadge";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FALLBACK_SUPABASE_URL = "https://vgjbkoxjphgpovtxdvlu.supabase.co";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Briefing.Co <briefing@briefing.co>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coopnews-9gbm.vercel.app";

type SendRequest = {
  // Acionado pelo n8n: dispara digest semanal pra base.
  // - article_ids: lista de slugs / uuids publicados na semana.
  // - vertical: filtra leads pela vertical (credito|agro|saude|consumo|outro|"all").
  // - edition_label: rótulo humano da edição ("Edição #14 — semana de 5 de mai").
  // - dry_run: renderiza e devolve preview sem enviar.
  // - test_recipient: força envio só pra esse email (homologação).
  // - api_key: secret compartilhado com n8n pra autenticar a request.
  api_key: string;
  article_ids: string[];
  vertical?: "credito" | "agro" | "saude" | "consumo" | "outro" | "all";
  edition_label?: string;
  dry_run?: boolean;
  test_recipient?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<SendRequest>;

  const expectedKey = process.env.NEWSLETTER_API_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: "missing NEWSLETTER_API_KEY env var" }, { status: 500 });
  }
  if (body.api_key !== expectedKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!Array.isArray(body.article_ids) || body.article_ids.length === 0) {
    return NextResponse.json({ error: "article_ids is required" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
  if (!resendKey) return NextResponse.json({ error: "missing RESEND_API_KEY" }, { status: 500 });
  if (!serviceKey) return NextResponse.json({ error: "missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Carrega artigos da semana. Aceita ids OU slugs via OR — n8n pode mandar
  // qualquer dos dois, evita query duplicada.
  const { data: contents, error: contentsError } = await supabase
    .from("contents")
    .select("id, slug, title, body_markdown, decision_log, image_url, category, tldr")
    .or(body.article_ids.map((id) => `id.eq.${id},slug.eq.${id}`).join(","));

  if (contentsError) {
    return NextResponse.json({ error: contentsError.message }, { status: 500 });
  }
  if (!contents || contents.length === 0) {
    return NextResponse.json({ error: "no articles matched" }, { status: 404 });
  }

  const articles: NewsletterArticle[] = contents.map((c) => {
    const decision = (c.decision_log ?? {}) as Record<string, unknown>;
    const dek = typeof decision.summary === "string" ? decision.summary : c.tldr ?? c.title;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      dek: String(dek),
      caderno: inferCaderno(c.body_markdown ?? "", c.category ?? ""),
      category: c.category ?? "Marketing Cooperativista",
      read_time: estimateReadTime(c.body_markdown ?? ""),
      image_url: c.image_url
    };
  });

  // Lista de destinatários: opt-in ainda ativo + filtro por vertical.
  let recipientsQuery = supabase
    .from("leads")
    .select("name, email, vertical, unsubscribe_token")
    .eq("subscribed_newsletter", true);

  if (body.test_recipient) {
    recipientsQuery = recipientsQuery.eq("email", body.test_recipient.toLowerCase());
  } else if (body.vertical && body.vertical !== "all") {
    recipientsQuery = recipientsQuery.eq("vertical", body.vertical);
  }

  const { data: recipients, error: recipientsError } = await recipientsQuery.limit(2000);
  if (recipientsError) {
    return NextResponse.json({ error: recipientsError.message }, { status: 500 });
  }
  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ error: "no recipients matched filter" }, { status: 404 });
  }

  const editionLabel = body.edition_label ?? "Edição da semana";

  if (body.dry_run) {
    const sampleProps: NewsletterDigestProps = {
      recipientName: recipients[0].name?.split(" ")[0] ?? "decisor",
      vertical: recipients[0].vertical ?? "todas",
      edition_label: editionLabel,
      articles,
      unsubscribe_url: `${SITE_URL}/api/newsletter/unsubscribe?token=${recipients[0].unsubscribe_token}`,
      site_url: SITE_URL
    };
    const html = await render(NewsletterDigest(sampleProps));
    return NextResponse.json({
      dry_run: true,
      would_send_to: recipients.length,
      sample_html_preview_chars: html.length,
      sample_subject: composeSubject(editionLabel, articles[0]?.title)
    });
  }

  const resend = new Resend(resendKey);

  const sent: string[] = [];
  const failed: { email: string; reason: string }[] = [];

  for (const recipient of recipients) {
    try {
      const props: NewsletterDigestProps = {
        recipientName: recipient.name?.split(" ")[0] ?? "decisor",
        vertical: recipient.vertical ?? "todas",
        edition_label: editionLabel,
        articles,
        unsubscribe_url: `${SITE_URL}/api/newsletter/unsubscribe?token=${recipient.unsubscribe_token}`,
        site_url: SITE_URL
      };
      const html = await render(NewsletterDigest(props));
      const subject = composeSubject(editionLabel, articles[0]?.title);

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: recipient.email,
        subject,
        html,
        // List-Unsubscribe: requer Gmail/Apple pra mostrar o botão "Cancelar
        // inscrição" diretamente na inbox. Fechado por one-click POST.
        headers: {
          "List-Unsubscribe": `<${SITE_URL}/api/newsletter/unsubscribe?token=${recipient.unsubscribe_token}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
        }
      });

      if (error) {
        failed.push({ email: recipient.email, reason: error.message });
      } else {
        sent.push(recipient.email);
      }
    } catch (err) {
      failed.push({
        email: recipient.email,
        reason: err instanceof Error ? err.message : "unknown_error"
      });
    }
  }

  return NextResponse.json({
    edition_label: editionLabel,
    article_count: articles.length,
    sent_count: sent.length,
    failed_count: failed.length,
    failed: failed.slice(0, 20)
  });
}

function composeSubject(editionLabel: string, leadTitle?: string) {
  if (leadTitle) return `${editionLabel}: ${leadTitle}`.slice(0, 110);
  return `Briefing.Co — ${editionLabel}`;
}

function estimateReadTime(markdown: string) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  if (words === 0) return null;
  return `${Math.max(3, Math.ceil(words / 180))} min`;
}
