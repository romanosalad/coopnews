-- FASE 0 — BLINDAGEM TÉCNICA da função public.editor_role(uuid).
--
-- A função foi criada em 20260503160000_fix_editors_recursion.sql como
-- SECURITY DEFINER pra resolver recursão de RLS. SECURITY DEFINER bypassa
-- RLS — necessário pra evitar loop, mas exige isolamento rigoroso pra
-- não virar vetor de escalation.
--
-- Auditoria identificou 3 vetores de abuso na versão original:
--   1. GRANT EXECUTE ... TO anon  → permite enumeração de admins sem auth
--   2. Aceita qualquer uuid no parâmetro → permite recon de outros users
--      a partir de uma sessão authenticated qualquer
--   3. Sem STRICT → NULL em uid retorna NULL silencioso (false negative
--      em policies que comparam com 'admin')
--
-- Esta migration:
--   - Revoga EXECUTE de anon (vetor 1)
--   - Restringe a versão (uuid) ao service_role apenas (vetor 2)
--   - Cria overload zero-arg public.editor_role() que SEMPRE usa
--     auth.uid() internamente — única exposta a authenticated
--   - Adiciona STRICT (vetor 3)
--   - Adiciona COMMENT de warning pra qualquer engenheiro futuro
--   - Reissue das policies que usavam editor_role(auth.uid()) pra
--     editor_role() (zero-arg) — sem mudança de comportamento legítimo
--
-- Senha do romano@baiaku.com.br fica como está (decisão do founder pra
-- avaliação interna nesta fase).

-- 1. Revogar exposição da versão (uuid) ao mundo público.
revoke execute on function public.editor_role(uuid) from anon, authenticated, public;
grant execute on function public.editor_role(uuid) to service_role;

-- 2. Comentário de aviso permanente na função (uuid).
comment on function public.editor_role(uuid) is
  'SECURITY DEFINER. NEVER expose to user-controlled input. Restricted to service_role only. Authenticated users must call public.editor_role() (zero-arg) which auto-binds to auth.uid().';

-- 3. Overload zero-arg — única forma authenticated descobre o próprio
--    role. Bloqueia recon de terceiros por construção.
create or replace function public.editor_role()
returns editor_role
language plpgsql
stable
strict
security definer
set search_path = public
as $$
declare
  resolved_uid uuid := auth.uid();
  resolved_role editor_role;
begin
  if resolved_uid is null then
    return null;
  end if;
  select role into resolved_role from public.editors where user_id = resolved_uid;
  return resolved_role;
end;
$$;

revoke execute on function public.editor_role() from public;
grant execute on function public.editor_role() to authenticated, service_role;

comment on function public.editor_role() is
  'SECURITY DEFINER. Returns the editor role of the CURRENT authenticated user (auth.uid() bound internally). Safe to expose to authenticated. Returns NULL if no session or no editors row.';

-- 4. Reissue das policies pra usar a versão zero-arg.
--    Comportamento idêntico — auth.uid() é resolvido dentro da função
--    em vez de explicitamente, mas resultado é o mesmo pro user logado.

-- editors table
drop policy if exists "editors_admin_insert" on public.editors;
create policy "editors_admin_insert" on public.editors
  for insert to authenticated
  with check (public.editor_role() = 'admin');

drop policy if exists "editors_admin_update" on public.editors;
create policy "editors_admin_update" on public.editors
  for update to authenticated
  using (public.editor_role() = 'admin')
  with check (public.editor_role() = 'admin');

drop policy if exists "editors_admin_delete" on public.editors;
create policy "editors_admin_delete" on public.editors
  for delete to authenticated
  using (public.editor_role() = 'admin');

-- contents table
drop policy if exists "contents_editor_read_drafts" on public.contents;
create policy "contents_editor_read_drafts" on public.contents
  for select to authenticated
  using (
    editorial_state = 'published'
    or author_id = auth.uid()
    or public.editor_role() in ('chief_editor', 'admin')
  );

drop policy if exists "contents_editor_update" on public.contents;
create policy "contents_editor_update" on public.contents
  for update to authenticated
  using (
    (author_id = auth.uid() and editorial_state in ('draft', 'review'))
    or public.editor_role() in ('chief_editor', 'admin')
  );

-- leads table
drop policy if exists "leads_admin_read" on public.leads;
create policy "leads_admin_read" on public.leads
  for select to authenticated
  using (public.editor_role() in ('chief_editor', 'admin'));
