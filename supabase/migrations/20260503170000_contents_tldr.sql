-- Smart Brevity TL;DR field. Per fa.md V3.1, every Briefing.Co article (Radar
-- included) must carry an "Em Resumo" block right after the lead. The n8n
-- Crews already generate this field on publication; we just need a column
-- where the orchestrator can write to.
--
-- Stored as plain text. Rendering layer handles bullet detection:
--   - Lines beginning with "- ", "* " or "• " render as <li>
--   - Otherwise the whole text renders as a paragraph
-- Empty / null → frontend skips the block entirely.

alter table public.contents
  add column if not exists tldr text;
