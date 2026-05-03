"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { render } from "@react-email/render";
import WelcomeDecisor from "@/emails/WelcomeDecisor";
import { BRAND } from "@/lib/brand";
import { getServerSupabase } from "@/lib/supabase-server";

const DECISOR_COOKIE = "briefing_decisor";
const DECISOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano
const ELITE_COOKIE = "briefing_assinante_elite";

export type DecisorVertical = "credito" | "agro" | "saude" | "consumo" | "outro";

// Camada 2 simplificada — só email libera o Protocolo. name/cargo/vertical
// ficam opcionais (preenchidos depois via /admin/login). O lead é gravado,
// o cookie é setado, e um email de boas-vindas dispara via Resend.
//
// "Welcome failed" não bloqueia: leitor já desbloqueou Protocolo no cookie.
// Resend cair = dropamos o email pra observability mas o leitor segue lendo.
export type RegisterDecisorInput = {
  email: string;
  name?: string;
  cargo?: string;
  vertical?: DecisorVertical;
  source_slug?: string;
  source_caderno?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export type RegisterDecisorResult = { ok: true } | { error: string };

export async function registerDecisor(input: RegisterDecisorInput): Promise<RegisterDecisorResult> {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) return { error: "E-mail inválido." };

  const supabase = await getServerSupabase();

  // Insert idempotente: unique violation (23505) é tratado como sucesso —
  // visitante que tenta de novo não vê erro, só re-libera cookie.
  const { error: insertError } = await supabase.from("leads").insert({
    email,
    name: input.name?.trim() || null,
    cargo: input.cargo?.trim() || null,
    vertical: input.vertical ?? null,
    source_slug: input.source_slug ?? null,
    source_caderno: input.source_caderno ?? null,
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null
  });

  if (insertError && !isUniqueViolation(insertError)) {
    return { error: insertError.message };
  }

  await setDecisorCookie();

  // Welcome email é fire-and-forget no contexto da UX (mas a gente await
  // pra capturar erros em log). Se Resend cair, leitor já está liberado.
  await sendWelcomeEmail({
    email,
    sourceSlug: input.source_slug,
    sourceCaderno: input.source_caderno
  }).catch((err) => {
    console.error("welcome_email_failed", { email, error: String(err) });
  });

  if (input.source_slug) {
    revalidatePath(`/materias/${input.source_slug}`);
  }

  return { ok: true };
}

async function sendWelcomeEmail(params: { email: string; sourceSlug?: string; sourceCaderno?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing — welcome email skipped");
    return;
  }

  const supabase = await getServerSupabase();
  const { data: lead } = await supabase
    .from("leads")
    .select("unsubscribe_token")
    .eq("email", params.email)
    .maybeSingle();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? BRAND.primary_domain;
  const unsubscribeUrl = lead?.unsubscribe_token
    ? `${siteUrl}/api/newsletter/unsubscribe?token=${lead.unsubscribe_token}`
    : `${siteUrl}/api/newsletter/unsubscribe`;
  const completeProfileUrl = `${siteUrl}/admin/login`;

  const html = await render(
    WelcomeDecisor({
      email: params.email,
      source_slug: params.sourceSlug ?? null,
      source_caderno: params.sourceCaderno ?? "Protocolo",
      site_url: siteUrl,
      unsubscribe_url: unsubscribeUrl,
      complete_profile_url: completeProfileUrl
    })
  );

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? BRAND.email_from,
    to: params.email,
    subject: "Pronto. Seu Protocolo do Briefing.Co está aberto.",
    html,
    headers: lead?.unsubscribe_token
      ? {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
        }
      : undefined
  });
}

async function setDecisorCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: DECISOR_COOKIE,
    value: "1",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: DECISOR_COOKIE_MAX_AGE
  });
}

export async function isDecisor(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(DECISOR_COOKIE)?.value === "1";
}

export async function isAssinanteElite(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ELITE_COOKIE)?.value === "1";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

function isUniqueViolation(error: unknown) {
  return Boolean(error) && typeof error === "object" && (error as { code?: string }).code === "23505";
}
