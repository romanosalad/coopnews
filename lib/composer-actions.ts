"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server";

export type ComposerInput = {
  id?: string;
  title: string;
  slug: string;
  dek: string;
  category: string;
  source_url: string;
  body_markdown: string;
  image_url: string;
  cmad_coop_business: string;
  cmad_marketing: string;
  cmad_art_craft: string;
  cmad_design_ux: string;
};

type SaveAction = "draft" | "review";

export async function saveArticle(input: ComposerInput, action: SaveAction) {
  const supabase = await getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthenticated" };
  }

  if (!input.title.trim() || !input.body_markdown.trim()) {
    return { error: "Título e corpo são obrigatórios." };
  }

  const slug = (input.slug || slugify(input.title)).slice(0, 90);
  const editorial_state = action === "review" ? "review" : "draft";
  const status = "draft"; // human articles only go live via approve flow
  const now = new Date().toISOString();

  const decision_log = {
    verdict: editorial_state,
    summary: input.dek,
    cmad: {
      coop_business: input.cmad_coop_business,
      marketing: input.cmad_marketing,
      art_craft: input.cmad_art_craft,
      design_ux: input.cmad_design_ux
    },
    desk: deskFromCategory(input.category),
    reasons: ["human_written"],
    source_terms: ["human"],
    source_url: input.source_url || null,
    written_by: user.email
  };

  const payload = {
    title: input.title.trim(),
    slug,
    body_markdown: input.body_markdown,
    source_url: input.source_url || null,
    image_url: input.image_url || null,
    category: input.category || "Marketing Cooperativista",
    decision_log,
    story_json: [],
    relevance_score: 0.85,
    status,
    editorial_state,
    source_type: "human_written",
    author_id: user.id,
    submitted_at: action === "review" ? now : null,
    last_edited_at: now
  };

  if (input.id) {
    const { error } = await supabase.from("contents").update(payload).eq("id", input.id);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    redirect(`/admin/articles/${input.id}/edit?saved=${action}`);
  } else {
    const { data, error } = await supabase.from("contents").insert(payload).select("id").single();
    if (error) return { error: error.message };
    revalidatePath("/admin");
    redirect(`/admin/articles/${data.id}/edit?saved=${action}`);
  }
}

export async function transitionArticle(id: string, target: "review" | "approved" | "published" | "draft" | "archived") {
  const supabase = await getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const { data: editor } = await supabase
    .from("editors")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = editor?.role ?? "editor";
  const isReviewer = role === "chief_editor" || role === "admin";

  if ((target === "approved" || target === "published" || target === "archived") && !isReviewer) {
    return { error: "Apenas chief_editor ou admin pode aprovar/publicar/arquivar." };
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    editorial_state: target,
    last_edited_at: now
  };

  if (target === "review") update.submitted_at = now;
  if (target === "approved") {
    update.approved_by = user.id;
    update.approved_at = now;
  }
  if (target === "published") {
    update.status = "published";
    update.published_at = now;
    update.approved_by = user.id;
    update.approved_at = now;
  }
  if (target === "draft") {
    update.submitted_at = null;
    update.approved_by = null;
    update.approved_at = null;
  }
  if (target === "archived") {
    update.status = "draft";
  }

  const { error } = await supabase.from("contents").update(update).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath(`/admin/articles/${id}/edit`);
  return { ok: true };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

function deskFromCategory(category: string) {
  const normalized = category
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (normalized.includes("tech") || normalized.includes("ia") || normalized.includes("automacao") || normalized.includes("martech")) return "CoopTech";
  if (normalized.includes("fora") || normalized.includes("bem") || normalized.includes("global")) return "La Fora";
  return "Capa";
}
