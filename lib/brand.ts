// Fonte canônica da marca. Qualquer string visível ao usuário ou cliente
// de email deve importar daqui pra evitar drift. Mudou a marca? Mexe aqui
// uma vez e tudo refresca.

export const BRAND = {
  name: "Briefing.Co",
  // Mark = parte renderizada com peso editorial. "Briefing" + "." + "Co"
  // pra preservar a estética do wordmark com accent na partícula final.
  mark_prefix: "Briefing",
  mark_separator: ".",
  mark_accent: "Co",
  tagline:
    "Inteligência editorial em marketing, IA e estratégia para o mercado cooperativista.",
  short_description:
    "O motor de inteligência editorial do mercado cooperativista. Marketing, IA e estratégia com Vantagem Injusta.",
  founder_byline: "Um projeto Baiaku",
  city_byline: "Porto Alegre · São Paulo",
  copyright_year: 2026,
  redaction_label: "Redação Briefing.Co",
  email_from: "Briefing.Co <briefing@briefing.co>",
  // Domínio canônico publicamente comunicável. Usado em fallbacks de URL
  // (server actions, emails, share). Trocar quando o DNS de briefing.co
  // estiver verificado.
  primary_domain: "https://coopnews-9gbm.vercel.app"
} as const;
