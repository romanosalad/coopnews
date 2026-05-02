alter table public.contents
  add column if not exists view_count integer not null default 0,
  add column if not exists click_count integer not null default 0,
  add column if not exists total_engaged_seconds integer not null default 0,
  add column if not exists quality_view_count integer not null default 0,
  add column if not exists total_scroll_depth integer not null default 0;

create table if not exists public.content_engagements (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  session_id text not null,
  view_count integer not null default 0,
  click_count integer not null default 0,
  engaged_seconds integer not null default 0,
  max_scroll_percent integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_id, session_id)
);

create index if not exists content_engagements_content_id_idx
  on public.content_engagements (content_id);

alter table public.content_engagements enable row level security;

drop policy if exists "Service role can manage content engagements" on public.content_engagements;
create policy "Service role can manage content engagements"
on public.content_engagements for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create or replace function public.record_content_event(
  p_content_id uuid,
  p_event_type text,
  p_session_id text,
  p_engaged_seconds integer default 0,
  p_scroll_depth integer default 0
)
returns public.contents
language plpgsql
security definer
set search_path = public
as $$
declare
  engagement public.content_engagements;
  normalized_event text := lower(coalesce(p_event_type, ''));
  safe_engaged integer := greatest(0, least(coalesce(p_engaged_seconds, 0), 86400));
  safe_scroll integer := greatest(0, least(coalesce(p_scroll_depth, 0), 100));
  engaged_delta integer := 0;
  scroll_delta integer := 0;
  view_delta integer := 0;
  click_delta integer := 0;
  quality_delta integer := 0;
  updated_content public.contents;
begin
  if p_session_id is null or length(trim(p_session_id)) = 0 then
    raise exception 'session_id is required';
  end if;

  insert into public.content_engagements (content_id, session_id)
  values (p_content_id, p_session_id)
  on conflict (content_id, session_id) do update
    set updated_at = now()
  returning * into engagement;

  if normalized_event = 'view' and engagement.view_count = 0 then
    view_delta := 1;
    engagement.view_count := 1;
  elsif normalized_event = 'click' then
    click_delta := 1;
    engagement.click_count := engagement.click_count + 1;
  elsif normalized_event = 'engagement' then
    engaged_delta := greatest(0, safe_engaged - engagement.engaged_seconds);
    scroll_delta := greatest(0, safe_scroll - engagement.max_scroll_percent);
    if engagement.engaged_seconds < 15 and safe_engaged >= 15 then
      quality_delta := 1;
    end if;
    engagement.engaged_seconds := greatest(engagement.engaged_seconds, safe_engaged);
    engagement.max_scroll_percent := greatest(engagement.max_scroll_percent, safe_scroll);
  else
    raise exception 'unsupported event type %', p_event_type;
  end if;

  update public.content_engagements
  set
    view_count = engagement.view_count,
    click_count = engagement.click_count,
    engaged_seconds = engagement.engaged_seconds,
    max_scroll_percent = engagement.max_scroll_percent,
    updated_at = now()
  where id = engagement.id;

  update public.contents
  set
    view_count = view_count + view_delta,
    click_count = click_count + click_delta,
    total_engaged_seconds = total_engaged_seconds + engaged_delta,
    quality_view_count = quality_view_count + quality_delta,
    total_scroll_depth = total_scroll_depth + scroll_delta
  where id = p_content_id
  returning * into updated_content;

  return updated_content;
end;
$$;

grant execute on function public.record_content_event(uuid, text, text, integer, integer) to anon, authenticated;

create or replace function public.popular_contents()
returns setof public.contents
language sql
stable
security definer
set search_path = public
as $$
  select c.*
  from public.contents c
  where c.status = 'published'
  order by
    (
      (greatest(c.click_count, 0) * 4.0) +
      greatest(c.view_count, 0) +
      (greatest(c.quality_view_count, 0) * 6.0) +
      least(greatest(c.total_engaged_seconds, 0) / 30.0, 500.0) +
      (case when c.view_count > 0 then greatest(c.total_scroll_depth, 0)::numeric / c.view_count else 0 end / 10.0) +
      greatest(c.tab_cash, 0)
    )
    / power(extract(epoch from (now() - coalesce(c.published_at, c.created_at))) / 3600 + 2, 1.35) desc,
    c.created_at desc
  limit 20;
$$;

grant execute on function public.popular_contents() to anon, authenticated;
