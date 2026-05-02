-- Bloco C / Newsletter: estende a tabela `leads` (criada no Bloco B item 4)
-- com 2 campos pra distribuição via Resend:
--
-- - subscribed_newsletter: opt-out granular. Default true (Camada 2 = consent
--   implícito ao se cadastrar pra Decisor). One-click unsubscribe via token.
-- - unsubscribe_token: uuid criptograficamente seguro pra link público
--   /api/newsletter/unsubscribe?token=... — não exige autenticação,
--   compliance LGPD + List-Unsubscribe header (Gmail, Apple Mail).
--
-- SSOT respeitado: zero nova tabela. `leads` continua sendo a fonte única
-- de identidade da Camada 2.

alter table public.leads
  add column if not exists subscribed_newsletter boolean not null default true,
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists unsubscribed_at timestamptz;

-- Backfill: leads existentes ganham token único pra unsubscribe imediato.
update public.leads
set unsubscribe_token = gen_random_uuid()
where unsubscribe_token is null;

-- Lookup do token na rota pública precisa ser O(1).
create unique index if not exists leads_unsubscribe_token_idx
  on public.leads (unsubscribe_token);

-- Índice parcial pra a query principal do n8n: "quem recebe a newsletter da
-- semana, filtrado por vertical". Evita full scan quando a base crescer.
create index if not exists leads_subscribed_vertical_idx
  on public.leads (vertical)
  where subscribed_newsletter = true;
