"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase-server";

const DECISOR_COOKIE = "briefing_decisor";
const DECISOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

export type DecisorVertical = "credito" | "agro" | "saude" | "consumo" | "outro";

export type RegisterDecisorInput = {
  name: string;
  email: string;
  cargo: string;
  vertical: DecisorVertical;
  source_slug?: string;
  source_caderno?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export type RegisterDecisorResult = { ok: true } | { error: string };

export async function registerDecisor(input: RegisterDecisorInput): Promise<RegisterDecisorResult> {
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const cargo = (input.cargo ?? "").trim();
  const vertical = input.vertical;

  if (!name || name.length < 2) return { error: "Nome obrigatório." };
  if (!isValidEmail(email)) return { error: "E-mail inválido." };
  if (!cargo || cargo.length < 2) return { error: "Cargo obrigatório." };
  if (!isValidVertical(vertical)) return { error: "Selecione uma vertical." };

  const supabase = await getServerSupabase();

  // ON CONFLICT manual: tenta INSERT; se já existe pelo email, considera
  // sucesso (lead retorna sem perfumaria; Camada 2 é grátis e idempotente).
  const { error } = await supabase.from("leads").insert({
    name,
    email,
    cargo,
    vertical,
    source_slug: input.source_slug ?? null,
    source_caderno: input.source_caderno ?? null,
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null
  });

  if (error && !isUniqueViolation(error)) {
    return { error: error.message };
  }

  await setDecisorCookie();

  if (input.source_slug) {
    revalidatePath(`/materias/${input.source_slug}`);
  }

  return { ok: true };
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

// Camada 3 — assinante Elite. Stripe Checkout entra na Fase 2 e setará
// o cookie httpOnly briefing_assinante_elite=1. Por enquanto retorna
// false sempre (todo mundo vê o paywall do Dossiê). Quando Stripe estiver
// no ar, troca a lógica pra ler o cookie + cruzar com tabela subscriptions
// no Supabase.
const ELITE_COOKIE = "briefing_assinante_elite";

export async function isAssinanteElite(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ELITE_COOKIE)?.value === "1";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

function isValidVertical(value: string): value is DecisorVertical {
  return ["credito", "agro", "saude", "consumo", "outro"].includes(value);
}

function isUniqueViolation(error: unknown) {
  return Boolean(error) && typeof error === "object" && (error as { code?: string }).code === "23505";
}
