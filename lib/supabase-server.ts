import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const FALLBACK_SUPABASE_URL = "https://vgjbkoxjphgpovtxdvlu.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnamJrb3hqcGhncG92dHhkdmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMyMzksImV4cCI6MjA5MzIzOTIzOX0.I_jSIPwUnCenvgi-RQWTfstNany_mwFDcwXn7V18Rl4";

export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Calling cookieStore.set inside a Server Component throws by
              // design; the middleware refresh handles cookie writes instead.
            }
          }
        }
      }
    }
  );
}
