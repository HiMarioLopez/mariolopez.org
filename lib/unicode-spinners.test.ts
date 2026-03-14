import { describe, expect, it } from "vitest";
import type { UnicodeSpinnerDefinition, UnicodeSpinnerName } from "@/lib/unicode-spinners";
import { UNICODE_SPINNERS } from "@/lib/unicode-spinners";

// ── UNICODE_SPINNERS ─────────────────────────────────────────────────────────

describe("UNICODE_SPINNERS", () => {
  it('has a "waverows" key', () => {
    expect(UNICODE_SPINNERS).toHaveProperty("waverows");
  });

  it("waverows.frames is an array with 16 entries", () => {
    expect(UNICODE_SPINNERS.waverows.frames).toHaveLength(16);
  });

  it("waverows.interval is 90", () => {
    expect(UNICODE_SPINNERS.waverows.interval).toBe(90);
  });

  it("every frame is a non-empty string", () => {
    for (const frame of UNICODE_SPINNERS.waverows.frames) {
      expect(typeof frame).toBe("string");
      expect(frame.length).toBeGreaterThan(0);
    }
  });

  it("all frames are unique (no duplicates)", () => {
    const unique = new Set(UNICODE_SPINNERS.waverows.frames);
    expect(unique.size).toBe(UNICODE_SPINNERS.waverows.frames.length);
  });

  it("interval is a positive number", () => {
    expect(UNICODE_SPINNERS.waverows.interval).toBeGreaterThan(0);
  });
});

// ── Type exports ─────────────────────────────────────────────────────────────

describe("type exports", () => {
  it("UnicodeSpinnerName is assignable from 'waverows'", () => {
    const name: UnicodeSpinnerName = "waverows";
    expect(name).toBe("waverows");
  });

  it("UnicodeSpinnerDefinition describes spinner shape", () => {
    const def: UnicodeSpinnerDefinition = UNICODE_SPINNERS.waverows;
    expect(def).toHaveProperty("frames");
    expect(def).toHaveProperty("interval");
  });
});
