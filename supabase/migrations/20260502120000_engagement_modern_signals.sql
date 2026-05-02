-- Modern engagement signals: scroll milestones (25/50/75/100), read completion, share counter.
-- Inspired by NYT/Substack/Stripe analytics models where "completed read" weighs more than raw views.

alter table public.contents
  add column if not exists completed_read_count integer not null default 0,
  add column if not exists share_count integer not null default 0,
  add column if not exists scroll_25_count integer not null default 0,
  add column if not exists scroll_50_count integer not null default 0,
  add column if not exists scroll_75_count integer not null default 0,
  add column if not exists scroll_100_count integer not null default 0;

alter table public.content_engagements
  add column if not exists completed_read boolean not null default false,
  add column if not exists shared boolean not null default false,
  add column if not exists reached_25 boolean not null default false,
  add column if not exists reached_50 boolean not null default false,
  add column if not exists reached_75 boolean not null default false,
  add column if not exists reached_100 boolean not null default false;

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
  share_delta integer := 0;
  completed_delta integer := 0;
  scroll_25_delta integer := 0;
  scroll_50_delta integer := 0;
  scroll_75_delta integer := 0;
  scroll_100_delta integer := 0;
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
  elsif normalized_event = 'share' and not engagement.shared then
    share_delta := 1;
    engagement.shared := true;
  elsif normalized_event = 'engagement' then
    engaged_delta := greatest(0, safe_engaged - engagement.engaged_seconds);
    scroll_delta := greatest(0, safe_scroll - engagement.max_scroll_percent);
    if engagement.engaged_seconds < 15 and safe_engaged >= 15 then
      quality_delta := 1;
    end if;
    if not engagement.reached_25 and safe_scroll >= 25 then
      scroll_25_delta := 1;
      engagement.reached_25 := true;
    end if;
    if not engagement.reached_50 and safe_scroll >= 50 then
      scroll_50_delta := 1;
      engagement.reached_50 := true;
    end if;
    if not engagement.reached_75 and safe_scroll >= 75 then
      scroll_75_delta := 1;
      engagement.reached_75 := true;
    end if;
    if not engagement.reached_100 and safe_scroll >= 95 then
      scroll_100_delta := 1;
      engagement.reached_100 := true;
    end if;
    if not engagement.completed_read and safe_scroll >= 75 and greatest(safe_engaged, engagement.engaged_seconds) >= 30 then
      completed_delta := 1;
      engagement.completed_read := true;
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
    completed_read = engagement.completed_read,
    shared = engagement.shared,
    reached_25 = engagement.reached_25,
    reached_50 = engagement.reached_50,
    reached_75 = engagement.reached_75,
    reached_100 = engagement.reached_100,
    updated_at = now()
  where id = engagement.id;

  update public.contents
  set
    view_count = view_count + view_delta,
    click_count = click_count + click_delta,
    total_engaged_seconds = total_engaged_seconds + engaged_delta,
    quality_view_count = quality_view_count + quality_delta,
    total_scroll_depth = total_scroll_depth + scroll_delta,
    completed_read_count = completed_read_count + completed_delta,
    share_count = share_count + share_delta,
    scroll_25_count = scroll_25_count + scroll_25_delta,
    scroll_50_count = scroll_50_count + scroll_50_delta,
    scroll_75_count = scroll_75_count + scroll_75_delta,
    scroll_100_count = scroll_100_count + scroll_100_delta
  where id = p_content_id
  returning * into updated_content;

  return updated_content;
end;
$$;

grant execute on function public.record_content_event(uuid, text, text, integer, integer) to anon, authenticated;

-- Modern popularity score:
--   Base = clicks * 4 + views + qualityViews * 6 + completions * 10 + shares * 15
--   + engaged_seconds capped, + scroll-depth signal, + tab_cash boost
--   / time decay (half-life ~ 1 day for "Mês" view; the route may filter further).
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
      (greatest(c.completed_read_count, 0) * 10.0) +
      (greatest(c.share_count, 0) * 15.0) +
      least(greatest(c.total_engaged_seconds, 0) / 30.0, 800.0) +
      (case when c.view_count > 0 then greatest(c.scroll_75_count, 0)::numeric / c.view_count else 0 end * 25.0) +
      greatest(c.tab_cash, 0)
    )
    / power(extract(epoch from (now() - coalesce(c.published_at, c.created_at))) / 3600 + 2, 1.35) desc,
    c.created_at desc
  limit 20;
$$;

grant execute on function public.popular_contents() to anon, authenticated;
