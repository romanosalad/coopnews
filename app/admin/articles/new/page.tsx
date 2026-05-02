import { ComposerForm } from "@/components/admin/ComposerForm";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const supabase = await getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: editor } = await supabase
    .from("editors")
    .select("role")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const role = editor?.role ?? "editor";
  const isReviewer = role === "chief_editor" || role === "admin";

  return (
    <main className="composer-page">
      <header className="composer-page-head">
        <span className="section-sub">Composer · Nova matéria</span>
        <h1>Escrever para o CoopNews</h1>
      </header>
      <ComposerForm
        initial={{
          title: "",
          slug: "",
          dek: "",
          category: "Marketing Cooperativista",
          source_url: "",
          body_markdown: "",
          image_url: "",
          cmad_coop_business: "",
          cmad_marketing: "",
          cmad_art_craft: "",
          cmad_design_ux: ""
        }}
        isReviewer={isReviewer}
        currentState={null}
        isOwner={true}
      />
    </main>
  );
}
