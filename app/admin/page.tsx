import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase-server";

type AdminContent = {
  id: string;
  slug: string;
  title: string;
  editorial_state: string | null;
  status: string;
  source_type: string | null;
  category: string | null;
  last_edited_at: string | null;
  created_at: string;
  author_id: string | null;
  approved_at: string | null;
  view_count: number | null;
  click_count: number | null;
};

const STATE_LABELS: Record<string, string> = {
  draft: "Rascunho",
  review: "Em revisão",
  approved: "Aprovado",
  published: "Publicado",
  archived: "Arquivado"
};

const SOURCE_LABELS: Record<string, string> = {
  ai_ingested: "IA",
  human_written: "Humano"
};

export default async function AdminDashboardPage() {
  const supabase = await getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: editor } = await supabase
    .from("editors")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = editor?.role ?? "editor";
  const isReviewer = role === "chief_editor" || role === "admin";

  const { data: contents } = await supabase
    .from("contents")
    .select(
      "id, slug, title, editorial_state, status, source_type, category, last_edited_at, created_at, author_id, approved_at, view_count, click_count"
    )
    .order("last_edited_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);

  const list = (contents ?? []) as AdminContent[];
  const inReview = list.filter((c) => c.editorial_state === "review");
  const myDrafts = list.filter((c) => c.editorial_state === "draft" && c.author_id === user.id);
  const approved = list.filter((c) => c.editorial_state === "approved");
  const published = list.filter((c) => c.editorial_state === "published" || c.status === "published");

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-head">
        <div>
          <span className="section-sub">Painel editorial</span>
          <h1>Olá, {user.email?.split("@")[0]}</h1>
          <p className="admin-dashboard-sub">
            {isReviewer
              ? "Você revisa, aprova e publica. Veja a fila abaixo."
              : "Suas matérias em rascunho e o status das que você submeteu."}
          </p>
        </div>
        <Link href="/admin/articles/new" className="admin-nav-cta">+ Nova matéria</Link>
      </header>

      {isReviewer ? (
        <Section title="Em revisão" hint="Aguardando sua aprovação" rows={inReview} emptyText="Nada para revisar agora." showSubmittedBy />
      ) : null}

      <Section title="Meus rascunhos" hint="Suas matérias em construção" rows={myDrafts} emptyText="Nenhum rascunho. Comece em + Nova matéria." />

      {isReviewer ? (
        <>
          <Section title="Aprovadas — aguardando publicação" rows={approved} emptyText="Sem aprovações pendentes." />
          <Section
            title="Publicadas recentes"
            rows={published.slice(0, 20)}
            emptyText="Nada publicado ainda."
            showMetrics
          />
        </>
      ) : null}
    </main>
  );
}

function Section({
  title,
  hint,
  rows,
  emptyText,
  showSubmittedBy = false,
  showMetrics = false
}: {
  title: string;
  hint?: string;
  rows: AdminContent[];
  emptyText: string;
  showSubmittedBy?: boolean;
  showMetrics?: boolean;
}) {
  return (
    <section className="admin-section">
      <header className="admin-section-head">
        <h2>{title}</h2>
        {hint ? <span>{hint}</span> : null}
        <span className="admin-section-count">{rows.length}</span>
      </header>
      {rows.length === 0 ? (
        <p className="admin-section-empty">{emptyText}</p>
      ) : (
        <ul className="admin-section-list">
          {rows.map((row) => (
            <li key={row.id} className="admin-row">
              <Link href={`/admin/articles/${row.id}/edit`} className="admin-row-title">
                {row.title || row.slug}
              </Link>
              <div className="admin-row-meta">
                <span className={`admin-pill admin-pill-${row.editorial_state ?? row.status}`}>
                  {STATE_LABELS[row.editorial_state ?? row.status] ?? row.status}
                </span>
                <span className="admin-row-source">{SOURCE_LABELS[row.source_type ?? "ai_ingested"]}</span>
                {row.category ? <span>{row.category}</span> : null}
                {showSubmittedBy && row.author_id ? <span>por {row.author_id.slice(0, 8)}…</span> : null}
                <span className="admin-row-date">{formatDate(row.last_edited_at ?? row.created_at)}</span>
                {showMetrics ? (
                  <span className="admin-row-metrics">
                    {row.view_count ?? 0} views · {row.click_count ?? 0} cliques
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
