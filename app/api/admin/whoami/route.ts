import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const supabaseCookies = allCookies
    .filter((c) => c.name.includes("sb-") || c.name.includes("supabase"))
    .map((c) => ({ name: c.name, value_length: c.value.length, preview: c.value.slice(0, 24) + "..." }));

  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  const editorByUserId = user
    ? await supabase.from("editors").select("user_id, email, role").eq("user_id", user.id).maybeSingle()
    : null;

  const editorByEmail = user?.email
    ? await supabase.from("editors").select("user_id, email, role").eq("email", user.email).maybeSingle()
    : null;

  return NextResponse.json({
    cookies_received: {
      total: allCookies.length,
      supabase_count: supabaseCookies.length,
      supabase_cookies: supabaseCookies,
      all_names: allCookies.map((c) => c.name)
    },
    auth_user: user ? { id: user.id, email: user.email } : null,
    auth_error: userError?.message ?? null,
    editor_by_user_id: editorByUserId?.data ?? null,
    editor_by_user_id_error: editorByUserId?.error?.message ?? null,
    editor_by_email: editorByEmail?.data ?? null,
    editor_by_email_error: editorByEmail?.error?.message ?? null
  });
}
