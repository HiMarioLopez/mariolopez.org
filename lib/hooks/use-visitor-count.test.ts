import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { useVisitorCount } from "@/lib/hooks/use-visitor-count";

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock TanStack Query's useQuery to isolate hook logic from network/cache
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

// We need the actual mock reference to configure per-test
import { useQuery } from "@tanstack/react-query";

const mockUseQuery = useQuery as Mock;

beforeEach(() => {
  mockUseQuery.mockReset();
  mockUseQuery.mockReturnValue({ data: null, isLoading: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("useVisitorCount", () => {
  it('passes increment: false by default and uses "read" query key', () => {
    renderHook(() => useVisitorCount());

    expect(mockUseQuery).toHaveBeenCalledTimes(1);
    const config = mockUseQuery.mock.calls[0][0];

    expect(config.queryKey).toEqual(["visitor-count", "read"]);
  });

  it('passes increment query key as "increment" when increment is true', () => {
    renderHook(() => useVisitorCount({ increment: true }));

    expect(mockUseQuery).toHaveBeenCalledTimes(1);
    const config = mockUseQuery.mock.calls[0][0];

    expect(config.queryKey).toEqual(["visitor-count", "increment"]);
  });

  it("uses distinct query keys for read vs increment to avoid cache collisions", () => {
    const { unmount } = renderHook(() => useVisitorCount());
    const readConfig = mockUseQuery.mock.calls[0][0];

    unmount();
    mockUseQuery.mockClear();

    renderHook(() => useVisitorCount({ increment: true }));
    const incrementConfig = mockUseQuery.mock.calls[0][0];

    expect(readConfig.queryKey).not.toEqual(incrementConfig.queryKey);
  });

  it("returns data from useQuery", () => {
    mockUseQuery.mockReturnValue({ data: 42, isLoading: false });

    const { result } = renderHook(() => useVisitorCount({ increment: true }));

    expect(result.current.data).toBe(42);
  });
});

describe("useVisitorCount queryFn behavior", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    // Restore real useQuery behavior for integration-style queryFn tests
    mockUseQuery.mockRestore();
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("queryFn calls GET /api/visitor-count when increment is false", () => {
    // Re-mock useQuery to capture the queryFn
    mockUseQuery.mockImplementation(
      (config: { queryFn: (ctx: { signal?: AbortSignal }) => Promise<number | null> }) => {
        // Just capture, don't call
        return { data: null, isLoading: true };
      },
    );

    renderHook(() => useVisitorCount());

    const config = mockUseQuery.mock.calls[0][0];
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 100 }),
    });
    globalThis.fetch = mockFetch;

    // Execute the queryFn
    config.queryFn({ signal: undefined });

    expect(mockFetch).toHaveBeenCalledWith("/api/visitor-count", { signal: undefined });
  });

  it("queryFn calls POST /api/visitor-count when increment is true", () => {
    mockUseQuery.mockImplementation(
      (config: { queryFn: (ctx: { signal?: AbortSignal }) => Promise<number | null> }) => {
        return { data: null, isLoading: true };
      },
    );

    renderHook(() => useVisitorCount({ increment: true }));

    const config = mockUseQuery.mock.calls[0][0];
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 101 }),
    });
    globalThis.fetch = mockFetch;

    // Execute the queryFn
    config.queryFn({ signal: undefined });

    expect(mockFetch).toHaveBeenCalledWith("/api/visitor-count", {
      method: "POST",
      signal: undefined,
    });
  });
});
