import { describe, expect, it } from "vitest";
import { extractTrackInfo, normalizeTrackData } from "@/lib/track-data";
import type { TrackData } from "@/lib/types";

// ── normalizeTrackData ───────────────────────────────────────────────────────

describe("normalizeTrackData", () => {
  it("returns null for null input", () => {
    expect(normalizeTrackData(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(normalizeTrackData(undefined)).toBeNull();
  });

  it("returns null for string input", () => {
    expect(normalizeTrackData("hello")).toBeNull();
  });

  it("returns null for number input", () => {
    expect(normalizeTrackData(42)).toBeNull();
  });

  it("extracts first item from { items: [track] } format", () => {
    const track = { name: "Song", artistName: "Artist" };
    const result = normalizeTrackData({ items: [track, { name: "Other" }] });
    expect(result).toBe(track);
  });

  it("falls through to direct object when items array is empty", () => {
    const data = { items: [] };
    const result = normalizeTrackData(data);
    expect(result).toBe(data);
  });

  it("extracts first item from { data: [track] } format", () => {
    const track = { name: "Song", artist: "Artist" };
    const result = normalizeTrackData({ data: [track] });
    expect(result).toBe(track);
  });

  it("extracts first element from direct array", () => {
    const track = { name: "Song" };
    const result = normalizeTrackData([track]);
    expect(result).toBe(track);
  });

  it("returns direct object when no items/data/array wrapper", () => {
    const track = { name: "Song", artistName: "Artist" };
    const result = normalizeTrackData(track);
    expect(result).toBe(track);
  });
});

// ── extractTrackInfo — format branches ───────────────────────────────────────

describe("extractTrackInfo", () => {
  describe("Format 1: name + artistName (primary)", () => {
    it("extracts song and artist", () => {
      const result = extractTrackInfo({ name: "Bohemian Rhapsody", artistName: "Queen" });
      expect(result.songName).toBe("Bohemian Rhapsody");
      expect(result.artistName).toBe("Queen");
    });
  });

  describe("Format 2: song + artist", () => {
    it("extracts song and artist", () => {
      const result = extractTrackInfo({ song: "Yesterday", artist: "The Beatles" });
      expect(result.songName).toBe("Yesterday");
      expect(result.artistName).toBe("The Beatles");
    });
  });

  describe("Format 3: nested track object", () => {
    it("extracts from track.name and track.artists", () => {
      const result = extractTrackInfo({
        track: { name: "Blinding Lights", artists: [{ name: "The Weeknd" }] },
      });
      expect(result.songName).toBe("Blinding Lights");
      expect(result.artistName).toBe("The Weeknd");
    });

    it("joins multiple track artists with comma", () => {
      const result = extractTrackInfo({
        track: {
          name: "Collab",
          artists: [{ name: "Artist A" }, { name: "Artist B" }],
        },
      });
      expect(result.artistName).toBe("Artist A, Artist B");
    });

    it("returns empty artist when track.artists is undefined", () => {
      const result = extractTrackInfo({ track: { name: "Solo" } });
      expect(result.songName).toBe("Solo");
      expect(result.artistName).toBe("");
    });
  });

  describe("Format 4: name + artist", () => {
    it("extracts song and artist", () => {
      const result = extractTrackInfo({ name: "Imagine", artist: "John Lennon" });
      expect(result.songName).toBe("Imagine");
      expect(result.artistName).toBe("John Lennon");
    });
  });

  describe("Format 5: title + artist", () => {
    it("extracts song and artist", () => {
      const result = extractTrackInfo({ title: "Thriller", artist: "Michael Jackson" });
      expect(result.songName).toBe("Thriller");
      expect(result.artistName).toBe("Michael Jackson");
    });
  });

  describe("Format 6: name + artists array", () => {
    it("joins string artists with comma", () => {
      const result = extractTrackInfo({ name: "Collab Track", artists: ["A", "B", "C"] });
      expect(result.songName).toBe("Collab Track");
      expect(result.artistName).toBe("A, B, C");
    });

    it("joins object artists with comma", () => {
      const result = extractTrackInfo({
        name: "Duo",
        artists: [{ name: "X" }, { name: "Y" }],
      });
      expect(result.songName).toBe("Duo");
      expect(result.artistName).toBe("X, Y");
    });

    it("handles single string in artists", () => {
      const result = extractTrackInfo({ name: "Song", artists: "Solo Artist" });
      expect(result.artistName).toBe("Solo Artist");
    });
  });

  describe("Format 7: fallback", () => {
    it("falls back to title when name is missing", () => {
      const result = extractTrackInfo({ title: "Only Title" } as TrackData);
      expect(result.songName).toBe("Only Title");
      expect(result.artistName).toBe("");
    });

    it("returns empty strings for empty object", () => {
      const result = extractTrackInfo({} as TrackData);
      expect(result.songName).toBe("");
      expect(result.artistName).toBe("");
    });

    it("falls back to artistName field when no name+artistName pair matches", () => {
      const result = extractTrackInfo({ artistName: "Lone Artist" } as TrackData);
      expect(result.songName).toBe("");
      expect(result.artistName).toBe("Lone Artist");
    });
  });

  // ── Metadata fields ──────────────────────────────────────────────────────

  it("extracts url and timestamp", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      url: "https://example.com/track",
      processedTimestamp: "2026-01-01T00:00:00Z",
    });
    expect(result.url).toBe("https://example.com/track");
    expect(result.timestamp).toBe("2026-01-01T00:00:00Z");
  });

  it("defaults url and timestamp to empty strings", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A" });
    expect(result.url).toBe("");
    expect(result.timestamp).toBe("");
  });
});

// ── Platform extraction ──────────────────────────────────────────────────────

describe("extractTrackInfo — platform", () => {
  it('maps source "apple" to "Apple Music"', () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", source: "apple" });
    expect(result.platform).toBe("Apple Music");
  });

  it('maps source "spotify" to "Spotify"', () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", source: "spotify" });
    expect(result.platform).toBe("Spotify");
  });

  it('capitalizes unknown source "tidal" to "Tidal"', () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", source: "tidal" });
    expect(result.platform).toBe("Tidal");
  });

  it('defaults empty source to "Apple Music"', () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", source: "" });
    expect(result.platform).toBe("Apple Music");
  });

  it('defaults missing source to "Apple Music"', () => {
    const result = extractTrackInfo({ name: "S", artistName: "A" });
    expect(result.platform).toBe("Apple Music");
  });
});

// ── Duration extraction ──────────────────────────────────────────────────────

describe("extractTrackInfo — durationMs", () => {
  it("extracts from durationMs field", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", durationMs: 240000 });
    expect(result.durationMs).toBe(240000);
  });

  it("extracts from durationInMillis field", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", durationInMillis: 180000 });
    expect(result.durationMs).toBe(180000);
  });

  it("extracts from duration field", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", duration: 300000 });
    expect(result.durationMs).toBe(300000);
  });

  it("extracts from track.duration_ms field", () => {
    const result = extractTrackInfo({
      track: { name: "X", duration_ms: 200000 },
    });
    expect(result.durationMs).toBe(200000);
  });

  it("parses string duration to number", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", durationMs: "240000" });
    expect(result.durationMs).toBe(240000);
  });

  it("returns undefined for zero duration", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", durationMs: 0 });
    expect(result.durationMs).toBeUndefined();
  });

  it("returns undefined for negative duration", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", durationMs: -100 });
    expect(result.durationMs).toBeUndefined();
  });

  it("returns undefined for NaN string duration", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", durationMs: "not-a-number" });
    expect(result.durationMs).toBeUndefined();
  });

  it("returns undefined when no duration fields exist", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A" });
    expect(result.durationMs).toBeUndefined();
  });

  it("prefers durationMs over durationInMillis", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      durationMs: 100000,
      durationInMillis: 200000,
    });
    expect(result.durationMs).toBe(100000);
  });
});

// ── Artwork URL extraction ───────────────────────────────────────────────────

describe("extractTrackInfo — artworkUrl", () => {
  it("extracts from artworkUrl field", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkUrl: "https://example.com/art.jpg",
    });
    expect(result.artworkUrl).toBe("https://example.com/art.jpg");
  });

  it("extracts from artwork.url field", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artwork: { url: "https://example.com/artwork.png" },
    });
    expect(result.artworkUrl).toBe("https://example.com/artwork.png");
  });

  it("trims whitespace from artwork URL", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkUrl: "  https://example.com/art.jpg  ",
    });
    expect(result.artworkUrl).toBe("https://example.com/art.jpg");
  });

  it("returns undefined for empty string artworkUrl", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", artworkUrl: "" });
    expect(result.artworkUrl).toBeUndefined();
  });

  it("returns undefined for whitespace-only artworkUrl", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A", artworkUrl: "   " });
    expect(result.artworkUrl).toBeUndefined();
  });

  it("returns undefined when no artwork fields exist", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A" });
    expect(result.artworkUrl).toBeUndefined();
  });

  it("prefers artworkUrl over artwork.url", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkUrl: "https://first.com/art.jpg",
      artwork: { url: "https://second.com/art.jpg" },
    });
    expect(result.artworkUrl).toBe("https://first.com/art.jpg");
  });
});

// ── Artwork colors extraction ────────────────────────────────────────────────

describe("extractTrackInfo — artworkColors", () => {
  it("extracts from artworkColors with standard fields", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkColors: { backgroundColor: "#ff0000", textColor1: "#00ff00" },
    });
    expect(result.artworkColors).toBeDefined();
    expect(result.artworkColors?.backgroundColor).toBe("#ff0000");
    expect(result.artworkColors?.textColor1).toBe("#00ff00");
  });

  it("maps colors.bgColor and colors.primaryColor to backgroundColor and textColor1", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      colors: { bgColor: "#abc", primaryColor: "#def" },
    });
    expect(result.artworkColors).toBeDefined();
    expect(result.artworkColors?.backgroundColor).toBe("#abc");
    expect(result.artworkColors?.textColor1).toBe("#def");
  });

  it("normalizes hex without hash prefix", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkColors: { backgroundColor: "ff0000" },
    });
    expect(result.artworkColors?.backgroundColor).toBe("#ff0000");
  });

  it("lowercases hex values", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkColors: { backgroundColor: "#FF0000" },
    });
    expect(result.artworkColors?.backgroundColor).toBe("#ff0000");
  });

  it("supports 3-digit hex", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkColors: { backgroundColor: "#abc" },
    });
    expect(result.artworkColors?.backgroundColor).toBe("#abc");
  });

  it("returns undefined colors for invalid hex", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkColors: { backgroundColor: "not-a-color" },
    });
    expect(result.artworkColors).toBeUndefined();
  });

  it("returns undefined colors for empty string values", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkColors: { backgroundColor: "" },
    });
    expect(result.artworkColors).toBeUndefined();
  });

  it("returns undefined when no color fields exist", () => {
    const result = extractTrackInfo({ name: "S", artistName: "A" });
    expect(result.artworkColors).toBeUndefined();
  });

  it("prioritizes artworkColors over colors", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkColors: { backgroundColor: "#111111" },
      colors: { backgroundColor: "#222222" },
    });
    expect(result.artworkColors?.backgroundColor).toBe("#111111");
  });

  it("falls back through priority chain: artworkColors > colors > artwork > single fields", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      backgroundColor: "#aabbcc",
    });
    expect(result.artworkColors?.backgroundColor).toBe("#aabbcc");
  });

  it("merges from multiple sources when higher-priority is partial", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      artworkColors: { backgroundColor: "#111111" },
      colors: { primaryColor: "#222222" },
    });
    expect(result.artworkColors?.backgroundColor).toBe("#111111");
    expect(result.artworkColors?.textColor1).toBe("#222222");
  });

  it("extracts primaryColor from single fields as textColor1", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      primaryColor: "#abcdef",
    });
    expect(result.artworkColors?.textColor1).toBe("#abcdef");
  });

  it("extracts dominantColor as textColor1 fallback", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      dominantColor: "#123456",
    });
    expect(result.artworkColors?.textColor1).toBe("#123456");
  });

  it("extracts secondaryColor as textColor2", () => {
    const result = extractTrackInfo({
      name: "S",
      artistName: "A",
      secondaryColor: "#654321",
    });
    expect(result.artworkColors?.textColor2).toBe("#654321");
  });
});

// ── Artist name extraction ───────────────────────────────────────────────────

describe("extractTrackInfo — artist name extraction", () => {
  it("joins string artists in array", () => {
    const result = extractTrackInfo({ name: "S", artists: ["A", "B"] });
    expect(result.artistName).toBe("A, B");
  });

  it("joins object artists in array", () => {
    const result = extractTrackInfo({
      name: "S",
      artists: [{ name: "A" }, { name: "B" }],
    });
    expect(result.artistName).toBe("A, B");
  });

  it("handles mixed string and object artists in track.artists", () => {
    const result = extractTrackInfo({
      track: { name: "X", artists: ["A", { name: "B" }] },
    });
    expect(result.artistName).toBe("A, B");
  });

  it("handles single string artist field", () => {
    const result = extractTrackInfo({ name: "S", artist: "Solo" });
    expect(result.artistName).toBe("Solo");
  });

  it("returns empty string for missing artist", () => {
    const result = extractTrackInfo({} as TrackData);
    expect(result.artistName).toBe("");
  });
});
