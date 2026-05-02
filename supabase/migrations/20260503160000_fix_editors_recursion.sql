-- The editors_admin_manage policy referenced public.editors from inside its
-- own USING clause, which triggered Postgres "infinite recursion detected in
-- policy" on every SELECT against editors (and against contents, since
-- contents policies also do an EXISTS over editors).
--
-- Replaces the recursive policy with a SECURITY DEFINER helper function that
-- bypasses RLS to look up a role, then uses that helper in any policy that
-- needs to check "is current user an admin / chief_editor".

drop policy if exists "editors_admin_manage" on public.editors;
drop policy if exists "contents_editor_read_drafts" on public.contents;
drop policy if exists "contents_editor_update" on public.contents;

create or replace function public.editor_role(uid uuid)
returns editor_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.editors where user_id = uid;
$$;

grant execute on function public.editor_role(uuid) to authenticated, anon;

-- Editors table: keep the broad authenticated SELECT (needed for "submitted
-- by X" badges and dashboards), and gate writes through the helper.
create policy "editors_admin_insert" on public.editors
  for insert to authenticated
  with check (public.editor_role(auth.uid()) = 'admin');

create policy "editors_admin_update" on public.editors
  for update to authenticated
  using (public.editor_role(auth.uid()) = 'admin')
  with check (public.editor_role(auth.uid()) = 'admin');

create policy "editors_admin_delete" on public.editors
  for delete to authenticated
  using (public.editor_role(auth.uid()) = 'admin');

-- Contents table: rebuild the editor read / update policies using the helper
-- so they no longer pull from public.editors directly.
create policy "contents_editor_read_drafts" on public.contents
  for select to authenticated
  using (
    editorial_state = 'published'
    or author_id = auth.uid()
    or public.editor_role(auth.uid()) in ('chief_editor', 'admin')
  );

create policy "contents_editor_update" on public.contents
  for update to authenticated
  using (
    (author_id = auth.uid() and editorial_state in ('draft', 'review'))
    or public.editor_role(auth.uid()) in ('chief_editor', 'admin')
  );
