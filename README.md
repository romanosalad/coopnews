# NewsCoop Creative Engine

Phase 1 scaffold for a cooperative marketing feed with AI ingestion, TabNews-style voting, and Web Story rendering.

## Modules

- `supabase/migrations/20260501000000_newscoop_phase1.sql` creates `contents`, `votes`, ranking, and atomic voting RPC.
- `supabase/functions/ingest-news/index.ts` discovers stories with Serper, scrapes article content, refines with AI, and inserts publishable stories.
- `app/page.tsx` renders the ranked community feed.
- `app/contents/[slug]/page.tsx` renders the full markdown article.
- `app/stories/[slug]/page.tsx` renders the 5-slide story experience with NewsArticle metadata.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase setup

```bash
supabase db push
supabase functions deploy ingest-news
supabase secrets set SERPER_API_KEY=... OPENAI_API_KEY=... OPENAI_MODEL=...
```

Invoke ingestion:

```bash
supabase functions invoke ingest-news --body '{"limit":3}'
```
