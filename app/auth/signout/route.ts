import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

async function signOutAndRedirect(request: Request) {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}

// Convenience GET so you can paste /auth/signout in the URL bar to escape a
// stuck session without opening devtools.
export async function GET(request: Request) {
  return signOutAndRedirect(request);
}
