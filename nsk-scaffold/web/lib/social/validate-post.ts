import type { Platform } from "@/lib/validators/social";

/**
 * Limiti tecnici noti delle piattaforme (non stime/best practice, i valori
 * effettivamente imposti dalle API/app al momento in cui questo file è stato
 * scritto). Le piattaforme cambiano queste soglie senza preavviso: se in
 * futuro un utente segnala un limite superato che qui risulta "ok", il primo
 * sospetto è che uno di questi numeri sia cambiato, non un bug nella
 * funzione di calcolo.
 */
export const PLATFORM_LIMITS: Record<
  Platform,
  { captionMaxChars: number; hashtagsMaxCount: number | null }
> = {
  instagram: { captionMaxChars: 2200, hashtagsMaxCount: 30 },
  tiktok: { captionMaxChars: 2200, hashtagsMaxCount: null },
  linkedin: { captionMaxChars: 3000, hashtagsMaxCount: null },
  facebook: { captionMaxChars: 63206, hashtagsMaxCount: null },
};

export interface PostLimitCheck {
  captionLength: number;
  captionMaxChars: number;
  captionOverLimit: boolean;
  hashtagsCount: number;
  hashtagsMaxCount: number | null;
  hashtagsOverLimit: boolean;
}

export function checkPostLimits(
  platform: Platform,
  caption: string,
  hashtags: string[]
): PostLimitCheck {
  const limits = PLATFORM_LIMITS[platform];
  const captionLength = caption.length;
  const hashtagsCount = hashtags.length;

  return {
    captionLength,
    captionMaxChars: limits.captionMaxChars,
    captionOverLimit: captionLength > limits.captionMaxChars,
    hashtagsCount,
    hashtagsMaxCount: limits.hashtagsMaxCount,
    hashtagsOverLimit:
      limits.hashtagsMaxCount !== null && hashtagsCount > limits.hashtagsMaxCount,
  };
}

// Normalizza hashtag inseriti a mano o generati dall'AI: rimuove "#" duplicati,
// spazi, e voci vuote/duplicate — non tocca maiuscole/minuscole (CamelCase è
// leggibile ed è una scelta stilistica dell'utente, non un errore da correggere).
export function normalizeHashtags(raw: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of raw) {
    const cleaned = item.trim().replace(/^#+/, "").replace(/\s+/g, "");
    if (!cleaned) continue;

    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(cleaned);
  }

  return result;
}
