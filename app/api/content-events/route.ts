import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const body = JSON.parse(rawBody || "{}");
  const contentId = String(body.contentId ?? "");
  const eventType = String(body.eventType ?? "");
  const sessionId = String(body.sessionId ?? "");

  if (!contentId || !eventType || !sessionId) {
    return NextResponse.json({ error: "Missing contentId, eventType or sessionId" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("record_content_event", {
    p_content_id: contentId,
    p_event_type: eventType,
    p_session_id: sessionId,
    p_engaged_seconds: Number(body.engagedSeconds ?? 0),
    p_scroll_depth: Number(body.scrollDepth ?? 0)
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
