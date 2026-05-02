-- Storage bucket for AI-generated editorial covers. The CoopNews ingest-news
-- function calls the C-MAD art direction agent (OpenAI gpt-image-1) when the
-- scraped article has no usable og:image, then uploads the resulting cover
-- here. Bucket is public-read so the frontend can hotlink without auth.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-covers',
  'article-covers',
  true,
  10485760, -- 10 MB cap, gpt-image-1 medium quality is ~1.5 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read.
drop policy if exists "Public read article covers" on storage.objects;
create policy "Public read article covers"
on storage.objects for select
to public
using (bucket_id = 'article-covers');

-- Service role full control.
drop policy if exists "Service role manages article covers" on storage.objects;
create policy "Service role manages article covers"
on storage.objects for all
to service_role
using (bucket_id = 'article-covers')
with check (bucket_id = 'article-covers');
