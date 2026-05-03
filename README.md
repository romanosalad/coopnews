# Briefing.Co

Inteligência editorial em marketing, IA e estratégia para o mercado cooperativista. Motor de ingestão por IA, três cadernos (Radar / Protocolo / Dossiê), modo neurodivergente, captura de leads (Camada 2) e distribuição via newsletter Resend.

## Stack

- **Frontend:** Next.js 15 (App Router) + Vanilla CSS + React Server Components
- **Banco:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth (email + password no MVP)
- **Email:** Resend + React Email
- **Orquestração editorial:** n8n (servidor dedicado, fora deste repo)
- **Deploy:** Vercel

## Módulos principais

- `app/page.tsx` — home com Hero + Colunistas + CoopTech + Mais Populares + Lá Fora.
- `app/materias/[slug]/page.tsx` — template editorial (CadrinhoBadge, TL;DR, Modo Foco, ShareBar, DecidorGate).
- `app/admin/*` — painel da redação (login, dashboard, composer, newsletter dispatcher).
- `app/api/newsletter/*` — endpoints de envio + unsubscribe.
- `app/api/distribution/published` — webhook unificado consumido pelo n8n.
- `emails/NewsletterDigest.tsx` — template React Email do digest semanal.
- `lib/brand.ts` — fonte canônica de strings de marca (SSOT).
- `n8n-workflows/` — exports dos workflows Crew Radar / CoopTech / Lá Fora.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase setup

```bash
npx supabase@latest db push --linked --include-all
npx supabase@latest functions deploy ingest-news
```

## Variáveis de ambiente (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEWSLETTER_API_KEY
OPENAI_API_KEY (sidebar de IA do composer)
RESEND_FROM_EMAIL (opcional)
NEXT_PUBLIC_SITE_URL (opcional)
```

## Documentação

- `BRIEFINGCO_MASTER_BLUEPRINT.md` — SSOT estratégica.
- `fa.md` — V3.1, regras editoriais e glossário banido.
- `crews_architecture.md` — arquitetura das Crews.
- `john_prd_briefingco.md` — PRD do produto.
