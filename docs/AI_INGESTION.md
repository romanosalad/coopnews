# CoopNews AI ingestion

This project keeps the approved editorial layout static by default, then lets Supabase feed real articles into `contents`.

## What the ingestion does

The Supabase Edge Function `ingest-news` can run in two modes:

- Manual URL ingestion: send one article URL and let AI refine it.
- Discovery ingestion: use Serper.dev search terms, scrape discovered URLs, then let AI decide publish/draft/discard.

For every accepted article it stores:

- `title`
- `slug`
- `body_markdown`
- `source_url`
- `story_json`
- `image_url` from `og:image`, `twitter:image`, or first article image
- `category`
- `geo_location`
- `relevance_score`
- `decision_log`
- `status`

## Supabase setup

Use the Supabase project named `CoopNews`.

1. In Supabase Dashboard, open SQL Editor.
2. Run the migration in:

```txt
supabase/migrations/20260501000000_newscoop_phase1.sql
```

3. Deploy the Edge Function:

```bash
npx supabase@latest functions deploy ingest-news --project-ref YOUR_PROJECT_REF
```

4. Add Edge Function secrets in Supabase:

```bash
npx supabase@latest secrets set \
  SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
  OPENAI_API_KEY="YOUR_OPENAI_API_KEY" \
  OPENAI_MODEL="gpt-4o-mini" \
  SERPER_API_KEY="YOUR_SERPER_API_KEY" \
  --project-ref YOUR_PROJECT_REF
```

Do not place `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, or `SERPER_API_KEY` in Vercel public env vars.

## Vercel env vars

Set only the public frontend variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

## Test manual ingestion

Use manual ingestion first. It does not require Serper.

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/ingest-news" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/article-url","dry_run":true}'
```

If the result looks good, run without `dry_run`:

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/ingest-news" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/article-url"}'
```

## Test discovery ingestion

Discovery requires `SERPER_API_KEY`.

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/ingest-news" \
  -H "Content-Type: application/json" \
  -d '{"limit":3,"terms":["campanha publicidade cooperativa","marketing cooperativista campanha brasil"]}'
```

## Safety defaults

- `publish_threshold` defaults to `0.72`.
- `dry_run: true` returns the records without inserting them.
- If AI marks the article irrelevant, the function discards it.
- Real article images come from the scraped article. Local geometric visuals remain fallback placeholders only.
