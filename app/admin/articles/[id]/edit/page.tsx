import { notFound } from "next/navigation";
import { ComposerForm } from "@/components/admin/ComposerForm";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
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

  const { data: article } = await supabase
    .from("contents")
    .select(
      "id, title, slug, body_markdown, source_url, image_url, category, decision_log, editorial_state, status, source_type, author_id, last_edited_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!article) notFound();

  const decisionLog = (article.decision_log ?? {}) as Record<string, unknown>;
  const cmad = (decisionLog.cmad ?? {}) as Record<string, string>;
  const dek =
    typeof decisionLog.summary === "string" && decisionLog.summary.trim().length > 0
      ? decisionLog.summary
      : "";

  return (
    <main className="composer-page">
      <header className="composer-page-head">
        <span className="section-sub">
          Composer · Editar · {article.editorial_state ?? article.status} · {article.source_type ?? "ai_ingested"}
        </span>
        <h1>{article.title}</h1>
      </header>
      <ComposerForm
        initial={{
          id: article.id,
          title: article.title ?? "",
          slug: article.slug ?? "",
          dek,
          category: article.category ?? "Marketing Cooperativista",
          source_url: article.source_url ?? "",
          body_markdown: article.body_markdown ?? "",
          image_url: article.image_url ?? "",
          cmad_coop_business: cmad.coop_business ?? "",
          cmad_marketing: cmad.marketing ?? "",
          cmad_art_craft: cmad.art_craft ?? "",
          cmad_design_ux: cmad.design_ux ?? ""
        }}
        isReviewer={isReviewer}
        currentState={article.editorial_state ?? article.status}
        isOwner={article.author_id === user.id}
      />
    </main>
  );
}
