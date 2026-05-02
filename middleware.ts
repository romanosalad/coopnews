import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const FALLBACK_SUPABASE_URL = "https://vgjbkoxjphgpovtxdvlu.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnamJrb3hqcGhncG92dHhkdmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMyMzksImV4cCI6MjA5MzIzOTIzOX0.I_jSIPwUnCenvgi-RQWTfstNany_mwFDcwXn7V18Rl4";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login" || path.startsWith("/auth/");

  if (isAdminRoute && !isAdminLogin && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(loginUrl);
  }

  // Bypass the "logged-in users go to /admin" redirect when an error is in
  // the URL — otherwise we infinite-loop with a session that has no editors
  // row. The unauthorized page itself shows a Sair button.
  const hasError = request.nextUrl.searchParams.has("error");
  if (path === "/admin/login" && user && !hasError) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"]
};
