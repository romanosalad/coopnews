-- Editor portal: human contributors workspace.
-- Three roles: editor (writes drafts), chief_editor (approves and publishes),
-- admin (manages other editors). Linked to auth.users so login lives entirely
-- inside Supabase Auth (magic-link OTP for now).

create type editor_role as enum ('editor', 'chief_editor', 'admin');

create table public.editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role editor_role not null default 'editor',
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index editors_role_idx on public.editors(role);

alter table public.editors enable row level security;

-- Anyone authenticated can read the roster (so dashboards show "submitted by X").
create policy "editors_select_authenticated" on public.editors
  for select to authenticated using (true);

-- Only admins manage the roster. Self-row updates handled via service role.
create policy "editors_admin_manage" on public.editors
  for all to authenticated
  using (exists (select 1 from public.editors me where me.user_id = auth.uid() and me.role = 'admin'))
  with check (exists (select 1 from public.editors me where me.user_id = auth.uid() and me.role = 'admin'));

-- Auto-provision an editors row when a new auth.users record is created. Role
-- defaults to 'editor'; chief_editor / admin assignment is manual or done via
-- the seeding section below.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.editors (user_id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Editorial workflow on contents.
create type editorial_state as enum ('draft', 'review', 'approved', 'published', 'archived');
create type content_source_type as enum ('ai_ingested', 'human_written');

alter table public.contents
  add column if not exists author_id uuid references public.editors(user_id) on delete set null,
  add column if not exists editorial_state editorial_state,
  add column if not exists submitted_at timestamptz,
  add column if not exists approved_by uuid references public.editors(user_id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists last_edited_at timestamptz default now(),
  add column if not exists source_type content_source_type;

-- Backfill existing rows so they map cleanly to the new state machine.
update public.contents set source_type = 'ai_ingested' where source_type is null;
update public.contents set editorial_state = 'published' where status = 'published' and editorial_state is null;
update public.contents set editorial_state = 'draft' where status = 'draft' and editorial_state is null;

-- Keep last_edited_at fresh on every update.
create or replace function public.touch_content_edited()
returns trigger
language plpgsql
as $$
begin
  new.last_edited_at := now();
  return new;
end;
$$;

drop trigger if exists contents_touch_edited on public.contents;
create trigger contents_touch_edited
  before update on public.contents
  for each row execute function public.touch_content_edited();

-- RLS for editor workflow on contents.
-- Public site continues reading via existing anon / service role pathways.
-- These new policies are scoped to authenticated portal users.
drop policy if exists "contents_editor_read_drafts" on public.contents;
create policy "contents_editor_read_drafts" on public.contents
  for select to authenticated
  using (
    -- anyone authenticated sees published; editors see their own drafts;
    -- chief_editor / admin see everything.
    editorial_state = 'published'
    or author_id = auth.uid()
    or exists (
      select 1 from public.editors me
      where me.user_id = auth.uid()
      and me.role in ('chief_editor', 'admin')
    )
  );

drop policy if exists "contents_editor_insert" on public.contents;
create policy "contents_editor_insert" on public.contents
  for insert to authenticated
  with check (
    exists (select 1 from public.editors me where me.user_id = auth.uid())
    and author_id = auth.uid()
  );

drop policy if exists "contents_editor_update" on public.contents;
create policy "contents_editor_update" on public.contents
  for update to authenticated
  using (
    -- author can edit while in draft / review; chief_editor / admin always.
    (author_id = auth.uid() and editorial_state in ('draft', 'review'))
    or exists (
      select 1 from public.editors me
      where me.user_id = auth.uid()
      and me.role in ('chief_editor', 'admin')
    )
  );

-- Seed the first chief_editor by email so the team can log in immediately
-- after the first magic link arrives. Idempotent.
do $$
declare
  seed_email text := 'romano@baiaku.com.br';
  seed_user_id uuid;
begin
  select id into seed_user_id from auth.users where email = seed_email limit 1;

  if seed_user_id is not null then
    insert into public.editors (user_id, email, role, display_name)
    values (seed_user_id, seed_email, 'chief_editor', 'Romano')
    on conflict (user_id) do update set role = 'chief_editor';
  end if;
end;
$$;
