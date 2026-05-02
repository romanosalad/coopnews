-- Camada 2 (Decisor): captura de leads para liberar Protocolos.
-- Per fa.md V3.1 + Master Blueprint: Radar livre, Protocolo cadastro
-- gratuito, Dossiê assinatura paga. Esta tabela cobre a Camada 2.
--
-- Insert anônimo permitido (qualquer visitante pode se cadastrar).
-- Select restrito a chief_editor / admin (auditoria de funil).

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  cargo text not null,
  vertical text not null check (vertical in ('credito', 'agro', 'saude', 'consumo', 'outro')),
  source_slug text,
  source_caderno text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (email)
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_vertical_idx on public.leads (vertical);

alter table public.leads enable row level security;

-- Cadastro anônimo (anon role) e autenticado: qualquer visitante pode
-- inserir 1 lead. ON CONFLICT (email) é tratado pelo Server Action.
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert to anon, authenticated
  with check (true);

-- Leitura: apenas chief_editor / admin via helper editor_role do
-- migration 20260503160000. Anon não enxerga lista.
drop policy if exists "leads_admin_read" on public.leads;
create policy "leads_admin_read" on public.leads
  for select to authenticated
  using (public.editor_role(auth.uid()) in ('chief_editor', 'admin'));

-- Service role bypassa RLS por padrão; nada a fazer.
