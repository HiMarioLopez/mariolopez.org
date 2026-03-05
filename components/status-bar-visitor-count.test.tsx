import { describe, expect, it, type Mock, vi } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock all hooks and child components to isolate the useVisitorCount call
vi.mock("@/lib/hooks/use-visitor-count", () => ({
  useVisitorCount: vi.fn().mockReturnValue({ data: 42 }),
}));

vi.mock("@/lib/hooks/use-availability-status", () => ({
  useAvailabilityStatus: vi.fn().mockReturnValue("cranking"),
}));

vi.mock("@/lib/hooks/use-recently-played", () => ({
  useRecentlyPlayed: vi.fn().mockReturnValue({ data: null, isPending: false }),
}));

vi.mock("@/lib/hooks/use-buffered-recently-played", () => ({
  useBufferedRecentlyPlayed: vi.fn().mockReturnValue({
    recentlyPlayed: null,
    playbackSnapshot: null,
  }),
}));

vi.mock("@/components/status-bar-left-controls", () => ({
  StatusBarLeftControls: (props: Record<string, unknown>) => (
    <div data-testid="left-controls" data-visitor-count={props.visitorCount} />
  ),
}));

vi.mock("@/components/status-bar-music-strip", () => ({
  StatusBarMusicStrip: () => <div data-testid="music-strip" />,
}));

vi.mock("@/components/status-bar-right-controls", () => ({
  StatusBarRightControls: () => <div data-testid="right-controls" />,
}));

import { render, screen } from "@testing-library/react";
import { StatusBar } from "@/components/status-bar";
import { useVisitorCount } from "@/lib/hooks/use-visitor-count";

const mockUseVisitorCount = useVisitorCount as Mock;

const defaultDict = {
  human: "HUMAN",
  machine: "MACHINE",
  auto: "Auto",
  light: "Light",
  dark: "Dark",
  aria_switch_human: "Switch to Human view",
  aria_switch_machine: "Switch to Machine view",
  aria_toggle_theme: "Toggle theme",
  language: "LANGUAGE",
  aria_toggle_language: "Switch language",
  music: {
    now_playing_on: "Now Playing on",
    last_played_on: "Last played on",
    open_track: "Open track",
    unknown_duration: "estimated window",
  },
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("StatusBar visitor count integration", () => {
  it("calls useVisitorCount with increment: true to ensure hits are counted", () => {
    render(<StatusBar lang="en-US" mode="human" dict={defaultDict} />);

    // This is the critical regression test:
    // The counter MUST be called with increment: true so visits are recorded.
    // If someone changes this back to increment: false (or omits it),
    // the counter will only read and never write — breaking hit tracking.
    expect(mockUseVisitorCount).toHaveBeenCalledWith({ increment: true });
  });

  it("passes the resolved visitor count to StatusBarLeftControls", () => {
    mockUseVisitorCount.mockReturnValue({ data: 1337 });

    render(<StatusBar lang="en-US" mode="human" dict={defaultDict} />);

    const leftControls = screen.getByTestId("left-controls");
    expect(leftControls).toHaveAttribute("data-visitor-count", "1337");
  });

  it("passes null when visitor count data is not a number", () => {
    mockUseVisitorCount.mockReturnValue({ data: undefined });

    render(<StatusBar lang="en-US" mode="human" dict={defaultDict} />);

    const leftControls = screen.getByTestId("left-controls");
    // When data is undefined, resolvedVisitorCount is null.
    // React omits attributes set to null, so the attribute should not exist.
    expect(leftControls).not.toHaveAttribute("data-visitor-count");
  });
});
