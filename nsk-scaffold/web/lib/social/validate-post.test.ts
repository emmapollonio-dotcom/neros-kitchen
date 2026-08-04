import { describe, it, expect } from "vitest";
import { checkPostLimits, normalizeHashtags } from "./validate-post";

describe("checkPostLimits", () => {
  it("segnala didascalia entro i limiti come ok", () => {
    const result = checkPostLimits("instagram", "Un piatto delizioso", ["food", "chef"]);
    expect(result.captionOverLimit).toBe(false);
    expect(result.hashtagsOverLimit).toBe(false);
    expect(result.captionLength).toBe(19);
    expect(result.hashtagsCount).toBe(2);
  });

  it("segnala didascalia oltre il limite Instagram (2200 caratteri)", () => {
    const longCaption = "a".repeat(2201);
    const result = checkPostLimits("instagram", longCaption, []);
    expect(result.captionOverLimit).toBe(true);
    expect(result.captionMaxChars).toBe(2200);
  });

  it("segnala più di 30 hashtag su Instagram come oltre il limite", () => {
    const hashtags = Array.from({ length: 31 }, (_, i) => `tag${i}`);
    const result = checkPostLimits("instagram", "caption", hashtags);
    expect(result.hashtagsOverLimit).toBe(true);
  });

  it("TikTok non ha un limite separato di hashtag (null = nessun tetto tecnico)", () => {
    const hashtags = Array.from({ length: 50 }, (_, i) => `tag${i}`);
    const result = checkPostLimits("tiktok", "caption", hashtags);
    expect(result.hashtagsMaxCount).toBeNull();
    expect(result.hashtagsOverLimit).toBe(false);
  });

  it("LinkedIn ha un limite di 3000 caratteri", () => {
    const result = checkPostLimits("linkedin", "a".repeat(3001), []);
    expect(result.captionOverLimit).toBe(true);
    expect(result.captionMaxChars).toBe(3000);
  });
});

describe("normalizeHashtags", () => {
  it("rimuove il cancelletto iniziale e gli spazi", () => {
    expect(normalizeHashtags(["#FoodLover", " chef life "])).toEqual(["FoodLover", "cheflife"]);
  });

  it("rimuove duplicati case-insensitive mantenendo la prima occorrenza", () => {
    expect(normalizeHashtags(["Food", "food", "FOOD"])).toEqual(["Food"]);
  });

  it("ignora voci vuote", () => {
    expect(normalizeHashtags(["", "  ", "#", "chef"])).toEqual(["chef"]);
  });

  it("con lista vuota ritorna array vuoto", () => {
    expect(normalizeHashtags([])).toEqual([]);
  });
});
