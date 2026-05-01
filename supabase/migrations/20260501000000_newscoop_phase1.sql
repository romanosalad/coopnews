create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type public.content_status as enum ('draft', 'published');
  end if;
end $$;

create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_id uuid references auth.users(id) on delete set null,
  title text not null,
  slug text not null unique,
  body_markdown text not null,
  source_url text,
  story_json jsonb not null default '[]'::jsonb,
  image_url text,
  tab_cash integer not null default 0,
  status public.content_status not null default 'draft',
  geo_location text,
  category text not null default 'Publicidade Cooperativa',
  relevance_score numeric(4, 3) not null default 0,
  decision_log jsonb not null default '{}'::jsonb,
  published_at timestamptz
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null,
  content_id uuid not null references public.contents(id) on delete cascade,
  vote_type smallint not null check (vote_type in (-1, 1)),
  unique (user_id, content_id)
);

create index if not exists contents_status_created_at_idx
  on public.contents (status, created_at desc);

create index if not exists contents_geo_location_idx
  on public.contents (geo_location);

create index if not exists votes_content_id_idx
  on public.votes (content_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contents_touch_updated_at on public.contents;
create trigger contents_touch_updated_at
before update on public.contents
for each row execute function public.touch_updated_at();

create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(input, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.cast_content_vote(
  p_content_id uuid,
  p_user_id uuid,
  p_vote_type smallint
)
returns table(content_id uuid, tab_cash integer, user_vote smallint)
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_vote smallint;
  delta integer;
begin
  if p_vote_type not in (-1, 1) then
    raise exception 'vote_type must be 1 or -1';
  end if;

  select vote_type into previous_vote
  from public.votes
  where user_id = p_user_id and content_id = p_content_id
  for update;

  if previous_vote is null then
    insert into public.votes (user_id, content_id, vote_type)
    values (p_user_id, p_content_id, p_vote_type);
    delta := p_vote_type;
  elsif previous_vote = p_vote_type then
    delete from public.votes
    where user_id = p_user_id and content_id = p_content_id;
    delta := -p_vote_type;
    p_vote_type := 0;
  else
    update public.votes
    set vote_type = p_vote_type
    where user_id = p_user_id and content_id = p_content_id;
    delta := p_vote_type - previous_vote;
  end if;

  update public.contents
  set tab_cash = tab_cash + delta
  where id = p_content_id
  returning id, contents.tab_cash into content_id, tab_cash;

  user_vote := p_vote_type;
  return next;
end;
$$;

create or replace function public.ranked_contents()
returns setof public.contents
language sql
stable
as $$
  select c.*
  from public.contents c
  where c.status = 'published'
  order by
    (
      greatest(c.tab_cash, 0) + 1
    ) / power(
      extract(epoch from (now() - coalesce(c.published_at, c.created_at))) / 3600 + 2,
      1.35
    ) desc,
    coalesce(c.published_at, c.created_at) desc;
$$;

alter table public.contents enable row level security;
alter table public.votes enable row level security;

drop policy if exists "Published contents are readable" on public.contents;
create policy "Published contents are readable"
on public.contents for select
using (status = 'published');

drop policy if exists "Service role can manage contents" on public.contents;
create policy "Service role can manage contents"
on public.contents for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "Votes are writable through RPC" on public.votes;
create policy "Votes are writable through RPC"
on public.votes for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

grant execute on function public.cast_content_vote(uuid, uuid, smallint) to anon, authenticated;
grant execute on function public.ranked_contents() to anon, authenticated;
