import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { invokeAgent } from "@/lib/ai/agent-client";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/social/posts/{id}/generate — genera caption + hashtag per un
// post esistente. Il topic/platform/tone vengono letti qui (scoped a RLS
// "social_posts_owner", quindi già verificato che il post appartenga
// all'utente) e passati come input all'agente: l'agente stesso persiste il
// risultato tramite il tool save_social_content — vedi
// supabase/functions/agent-orchestrator.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "unauthorized", meta: null }, { status: 401 });
  }

  const { data: post, error } = await supabase
    .from("social_posts")
    .select("id, platform, topic, tone")
    .eq("id", id)
    .single();

  if (error || !post) {
    return NextResponse.json({ data: null, error: "not_found", meta: null }, { status: 404 });
  }

  const input = JSON.stringify({
    post_id: post.id,
    platform: post.platform,
    topic: post.topic,
    tone: post.tone ?? "professionale",
  });

  const result = await invokeAgent("social_content_creator", input);

  if (result.error) {
    return NextResponse.json({ data: null, error: result.error, meta: null }, { status: 502 });
  }

  const { data: updated } = await supabase
    .from("social_posts")
    .select("id, platform, topic, tone, caption, hashtags, status, scheduled_at, created_at")
    .eq("id", id)
    .single();

  return NextResponse.json({
    data: { post: updated, agent_response: result.data?.response ?? null },
    error: null,
    meta: result.meta,
  });
}
