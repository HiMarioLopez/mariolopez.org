import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAvailabilityStatus } from "@/lib/hooks/use-availability-status";

// ── Helpers ──────────────────────────────────────────────────────────────────
// Winter dates use 2025-01-xx (CST = UTC-6), summer dates use 2025-06-xx (CDT = UTC-5).
// To land on hour H CT: winter → UTC H+6, summer → UTC H+5.

function setCentralTime(utcIso: string): void {
  vi.setSystemTime(new Date(utcIso));
}

// ── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ── Cranking (Mon–Fri, 8 AM – 4:59 PM CT) ───────────────────────────────────

describe("cranking — weekday work hours", () => {
  it("returns cranking on Wednesday 10 AM CT", () => {
    // Wed 2025-01-15 10:00 CT  →  UTC 16:00 (CST, +6)
    setCentralTime("2025-01-15T16:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("cranking");
  });

  it("returns cranking at boundary start — Monday 8:00 AM CT", () => {
    // Mon 2025-01-13 08:00 CT  →  UTC 14:00
    setCentralTime("2025-01-13T14:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("cranking");
  });

  it("returns cranking at boundary end — Friday 4:59 PM CT (hour 16)", () => {
    // Fri 2025-01-17 16:59 CT  →  UTC 22:59
    setCentralTime("2025-01-17T22:59:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("cranking");
  });
});

// ── Away (waking hours outside work) ─────────────────────────────────────────

describe("away — waking hours outside work", () => {
  it("returns away on Saturday 2 PM CT (weekend daytime)", () => {
    // Sat 2025-01-18 14:00 CT  →  UTC 20:00
    setCentralTime("2025-01-18T20:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("away");
  });

  it("returns away on Wednesday 6 PM CT (weekday evening, hour 18)", () => {
    // Wed 2025-01-15 18:00 CT  →  UTC 00:00 next day
    setCentralTime("2025-01-16T00:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("away");
  });

  it("returns away on Sunday 10 AM CT (weekend morning, CDT)", () => {
    // Sun 2025-06-15 10:00 CT  →  UTC 15:00 (CDT, +5)
    setCentralTime("2025-06-15T15:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("away");
  });

  it("returns away on weekday 5 PM CT (first away hour after work, hour 17)", () => {
    // Wed 2025-01-15 17:00 CT  →  UTC 23:00
    setCentralTime("2025-01-15T23:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("away");
  });

  it("returns away at boundary — Saturday 8:00 AM CT (weekend, waking)", () => {
    // Sat 2025-01-18 08:00 CT  →  UTC 14:00
    setCentralTime("2025-01-18T14:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("away");
  });
});

// ── Offline (late night / early morning) ─────────────────────────────────────

describe("offline — sleeping hours", () => {
  it("returns offline at 11 PM CT (hour 23)", () => {
    // Wed 2025-01-15 23:00 CT  →  UTC 05:00 next day
    setCentralTime("2025-01-16T05:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("offline");
  });

  it("returns offline at 3 AM CT", () => {
    // Wed 2025-01-15 03:00 CT  →  UTC 09:00
    setCentralTime("2025-01-15T09:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("offline");
  });

  it("returns offline at midnight CT (hour 0)", () => {
    // Wed 2025-01-15 00:00 CT  →  UTC 06:00
    setCentralTime("2025-01-15T06:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("offline");
  });

  it("returns offline at Saturday 7 AM CT (hour 7, last offline hour)", () => {
    // Sat 2025-01-18 07:00 CT  →  UTC 13:00
    setCentralTime("2025-01-18T13:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("offline");
  });
});

// ── Boundary transitions ─────────────────────────────────────────────────────

describe("boundary transitions", () => {
  it("exactly 8 AM weekday is cranking (not offline)", () => {
    // Mon 2025-01-13 08:00 CT  →  UTC 14:00
    setCentralTime("2025-01-13T14:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("cranking");
  });

  it("exactly 5 PM (17:00) weekday is away (not cranking)", () => {
    // Fri 2025-01-17 17:00 CT  →  UTC 23:00
    setCentralTime("2025-01-17T23:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("away");
  });

  it("exactly 11 PM (23:00) is offline", () => {
    // Sat 2025-01-18 23:00 CT  →  UTC 05:00 next day
    setCentralTime("2025-01-19T05:00:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("offline");
  });
});

// ── Interval re-evaluation ───────────────────────────────────────────────────

describe("interval re-evaluation", () => {
  it("re-evaluates status every 60 seconds", () => {
    // Start at Wed 2025-01-15 16:59 CT (cranking) → UTC 22:59
    setCentralTime("2025-01-15T22:59:00Z");

    const { result } = renderHook(() => useAvailabilityStatus());
    expect(result.current).toBe("cranking");

    // Advance 60 seconds → 17:00 CT (away)
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current).toBe("away");
  });

  it("cleans up interval on unmount", () => {
    setCentralTime("2025-01-15T16:00:00Z");
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = renderHook(() => useAvailabilityStatus());
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    clearIntervalSpy.mockRestore();
  });
});
