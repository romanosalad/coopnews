import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePlaceholder({ params }: Props) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data: article } = await supabase
    .from("contents")
    .select("title, slug, editorial_state, status, source_type, category, body_markdown")
    .eq("id", id)
    .maybeSingle();

  if (!article) notFound();

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-head">
        <div>
          <span className="section-sub">{article.editorial_state ?? article.status} · {article.source_type ?? "ai_ingested"}</span>
          <h1>{article.title}</h1>
          <p className="admin-dashboard-sub">
            O composer de edição completa entra na Fase 2. Por enquanto, leitura rápida do conteúdo.
          </p>
        </div>
        <Link href="/admin" className="admin-nav-cta">← Voltar</Link>
      </header>
      <section className="admin-section">
        <header className="admin-section-head"><h2>Conteúdo atual</h2></header>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-body)", lineHeight: 1.6, fontSize: 15, padding: 20, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", maxHeight: 600, overflow: "auto" }}>
          {article.body_markdown}
        </pre>
      </section>
    </main>
  );
}
