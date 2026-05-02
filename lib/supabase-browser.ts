"use client";

import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_SUPABASE_URL = "https://vgjbkoxjphgpovtxdvlu.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnamJrb3hqcGhncG92dHhkdmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMyMzksImV4cCI6MjA5MzIzOTIzOX0.I_jSIPwUnCenvgi-RQWTfstNany_mwFDcwXn7V18Rl4";

export function getBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY
  );
}
