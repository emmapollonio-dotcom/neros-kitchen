"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin"] as const;
type Platform = (typeof PLATFORMS)[number];

// Duplicazione minima e intenzionale di web/lib/social/validate-post.ts:
// qui serve solo per il badge di anteprima lato client, la fonte di verità
// per l'agente resta il system prompt in agent-orchestrator/agents.ts.
const PLATFORM_LIMITS: Record<Platform, { captionMaxChars: number; hashtagsMaxCount: number | null }> = {
  instagram: { captionMaxChars: 2200, hashtagsMaxCount: 30 },
  tiktok: { captionMaxChars: 2200, hashtagsMaxCount: null },
  linkedin: { captionMaxChars: 3000, hashtagsMaxCount: null },
  facebook: { captionMaxChars: 63206, hashtagsMaxCount: null },
};

const TONES = ["professionale", "amichevole", "elegante", "divertente"] as const;
type Tone = (typeof TONES)[number];

type PostStatus = "draft" | "ready" | "scheduled" | "published";

interface SocialPost {
  id: string;
  platform: Platform;
  topic: string;
  tone: Tone | null;
  caption: string | null;
  hashtags: string[];
  status: PostStatus;
  created_at: string;
}

// Studio Social: form di creazione + generazione AI on-demand + lista post.
// Ogni scrittura passa da /api/v1/social/*, che si appoggia a RLS
// ("social_posts_owner") come unica fonte di verità sui permessi.
export function SocialStudio() {
  const t = useTranslations("socialStudio");
  const PLATFORM_LABELS: Record<Platform, string> = {
    instagram: t("platformInstagram"),
    facebook: t("platformFacebook"),
    tiktok: t("platformTiktok"),
    linkedin: t("platformLinkedin"),
  };
  const TONE_LABELS: Record<Tone, string> = {
    professionale: t("toneProfessional"),
    amichevole: t("toneFriendly"),
    elegante: t("toneElegant"),
    divertente: t("toneFun"),
  };
  const STATUS_LABELS: Record<PostStatus, string> = {
    draft: t("statusDraft"),
    ready: t("statusReady"),
    scheduled: t("statusScheduled"),
    published: t("statusPublished"),
  };
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [platform, setPlatform] = useState<Platform>("instagram");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professionale");
  const [generatingNew, setGeneratingNew] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  async function loadPosts() {
    setLoading(true);
    const res = await fetch("/api/v1/social/posts");
    if (res.ok) {
      const body = await res.json();
      setPosts(body.data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleCreateAndGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setGeneratingNew(true);
    setError(null);

    const createRes = await fetch("/api/v1/social/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, topic: topic.trim(), tone }),
    });

    const createBody = await createRes.json().catch(() => null);
    if (!createRes.ok) {
      setError(typeof createBody?.error === "string" ? createBody.error : t("errorCreatingPost"));
      setGeneratingNew(false);
      return;
    }

    const postId = createBody.data.id as string;
    setGeneratingId(postId);

    const genRes = await fetch(`/api/v1/social/posts/${postId}/generate`, { method: "POST" });
    if (!genRes.ok) {
      const genBody = await genRes.json().catch(() => null);
      setError(typeof genBody?.error === "string" ? genBody.error : t("errorGeneratingAi"));
    } else {
      setTopic("");
    }

    setGeneratingId(null);
    setGeneratingNew(false);
    await loadPosts();
  }

  async function handleRegenerate(id: string) {
    setGeneratingId(id);
    setError(null);
    const res = await fetch(`/api/v1/social/posts/${id}/generate`, { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : t("errorGeneratingAi"));
    }
    setGeneratingId(null);
    await loadPosts();
  }

  async function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/v1/social/posts/${id}`, { method: "DELETE" });
    await loadPosts();
  }

  async function handleCopy(post: SocialPost) {
    const hashtagsText = post.hashtags.map((h) => `#${h}`).join(" ");
    const text = [post.caption, hashtagsText].filter(Boolean).join("\n\n");
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreateAndGenerate}
        className="space-y-4 rounded-nsk border border-smoke/15 bg-white p-4"
      >
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="font-body text-xs text-smoke">{t("platformLabel")}</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-body text-xs text-smoke">{t("toneLabel")}</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="mt-1 rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
            >
              {TONES.map((tn) => (
                <option key={tn} value={tn}>
                  {TONE_LABELS[tn]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="font-body text-xs text-smoke">{t("topicLabel")}</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t("topicPlaceholder")}
            required
            className="mt-1 w-full rounded-nsk border border-smoke/30 px-3 py-2 font-body text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={generatingNew}
          className="rounded-nsk bg-teal px-5 py-2 font-body text-sm text-white hover:bg-teal-dark disabled:opacity-50"
        >
          {generatingNew ? t("generating") : t("generatePostAi")}
        </button>
      </form>

      {error && <p className="font-body text-sm text-red-600">{error}</p>}
      {loading && <p className="font-body text-sm text-smoke">{t("loading")}</p>}
      {!loading && posts.length === 0 && (
        <p className="font-body text-sm text-smoke">{t("noPostsYet")}</p>
      )}

      <ul className="space-y-4">
        {posts.map((post) => {
          const limits = PLATFORM_LIMITS[post.platform];
          const captionLength = post.caption?.length ?? 0;
          const overCaption = captionLength > limits.captionMaxChars;
          const overHashtags =
            limits.hashtagsMaxCount !== null && post.hashtags.length > limits.hashtagsMaxCount;

          return (
            <li key={post.id} className="rounded-nsk border border-smoke/15 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-body text-xs uppercase tracking-wide text-teal">
                    {PLATFORM_LABELS[post.platform]} · {STATUS_LABELS[post.status]}
                  </p>
                  <p className="mt-1 font-body font-semibold text-charcoal">{post.topic}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRegenerate(post.id)}
                    disabled={generatingId === post.id}
                    className="rounded-nsk border border-teal px-3 py-1.5 font-body text-xs text-charcoal hover:bg-teal/10 disabled:opacity-50"
                  >
                    {generatingId === post.id ? t("generating") : post.caption ? t("regenerate") : t("generate")}
                  </button>
                  {post.caption && (
                    <button
                      type="button"
                      onClick={() => handleCopy(post)}
                      className="rounded-nsk border border-smoke/30 px-3 py-1.5 font-body text-xs text-charcoal hover:border-teal"
                    >
                      {t("copy")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    className="rounded-nsk border border-smoke/30 px-3 py-1.5 font-body text-xs text-smoke hover:border-red-400 hover:text-red-600"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>

              {post.caption && (
                <div className="mt-4 space-y-2 border-t border-smoke/10 pt-4">
                  <p className="whitespace-pre-wrap font-body text-sm text-charcoal">
                    {post.caption}
                  </p>
                  {post.hashtags.length > 0 && (
                    <p className="font-body text-sm text-teal">
                      {post.hashtags.map((h) => `#${h}`).join(" ")}
                    </p>
                  )}
                  <p className={`font-body text-xs ${overCaption || overHashtags ? "text-red-600" : "text-smoke"}`}>
                    {captionLength}/{limits.captionMaxChars} {t("charactersUnit")}
                    {limits.hashtagsMaxCount !== null &&
                      ` · ${post.hashtags.length}/${limits.hashtagsMaxCount} ${t("hashtagsUnit")}`}
                    {(overCaption || overHashtags) && ` — ${t("overLimit")}`}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
