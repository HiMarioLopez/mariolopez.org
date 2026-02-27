import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { StatusBarFlyoutId } from "@/components/status-bar";
import { StatusBarLeftControls } from "@/components/status-bar-left-controls";
import { StatusBarRightControls } from "@/components/status-bar-right-controls";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/en-US",
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  // biome-ignore lint/performance/noImgElement: test mock for next/image
  // biome-ignore lint/a11y/useAltText: props are spread which includes alt
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

// ── Shared props ─────────────────────────────────────────────────────────────

const rightControlsProps = {
  lang: "en-US",
  autoLabel: "Auto",
  lightLabel: "Light",
  darkLabel: "Dark",
  ariaToggleTheme: "Toggle theme",
  languageLabel: "Language",
  ariaToggleLanguage: "Toggle language",
};

const leftControlsProps = {
  lang: "en-US",
  mode: "human" as const,
  locale: "en-US" as const,
  availabilityStatus: "cranking" as const,
  visitorCount: 42,
  humanLabel: "human",
  machineLabel: "machine",
  ariaSwitchHuman: "Switch to human",
  ariaSwitchMachine: "Switch to machine",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function RightControlsHarness({ initialFlyout = null }: { initialFlyout?: StatusBarFlyoutId }) {
  const [openFlyout, setOpenFlyout] = useState<StatusBarFlyoutId>(initialFlyout);
  return (
    <StatusBarRightControls
      {...rightControlsProps}
      openFlyout={openFlyout}
      setOpenFlyout={setOpenFlyout}
    />
  );
}

function LeftControlsHarness({ initialFlyout = null }: { initialFlyout?: StatusBarFlyoutId }) {
  const [openFlyout, setOpenFlyout] = useState<StatusBarFlyoutId>(initialFlyout);
  return (
    <StatusBarLeftControls
      {...leftControlsProps}
      openFlyout={openFlyout}
      setOpenFlyout={setOpenFlyout}
    />
  );
}

function CoordinatedHarness() {
  const [openFlyout, setOpenFlyout] = useState<StatusBarFlyoutId>(null);
  return (
    <div>
      <StatusBarLeftControls
        {...leftControlsProps}
        openFlyout={openFlyout}
        setOpenFlyout={setOpenFlyout}
      />
      <StatusBarRightControls
        {...rightControlsProps}
        openFlyout={openFlyout}
        setOpenFlyout={setOpenFlyout}
      />
    </div>
  );
}

// ── Tests: Right Controls ────────────────────────────────────────────────────

describe("StatusBarRightControls flyout mutual exclusion", () => {
  it("opens the theme dropdown when theme trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<RightControlsHarness />);

    await user.click(screen.getByLabelText("Toggle theme"));

    expect(screen.getAllByRole("menuitemradio").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("opens the language dropdown when language trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<RightControlsHarness />);

    await user.click(screen.getByLabelText("Toggle language"));

    expect(screen.getAllByRole("menuitemradio").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
  });

  it("closes theme and opens language when switching", async () => {
    const user = userEvent.setup();
    render(<RightControlsHarness />);

    // Open theme first
    await user.click(screen.getByLabelText("Toggle theme"));
    expect(screen.getByText("Auto")).toBeInTheDocument();

    // Dismiss theme, then open language
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByText("Light")).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Toggle language"));

    // Language items should be visible
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
    // Theme items should be gone
    expect(screen.queryByText("Light")).not.toBeInTheDocument();
    expect(screen.queryByText("Dark")).not.toBeInTheDocument();
  });

  it("closes language and opens theme when switching", async () => {
    const user = userEvent.setup();
    render(<RightControlsHarness />);

    // Open language first
    await user.click(screen.getByLabelText("Toggle language"));
    expect(screen.getByText("English")).toBeInTheDocument();

    // Dismiss language, then open theme
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByText("English")).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Toggle theme"));

    // Theme items should be visible
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    // Language items should be gone
    expect(screen.queryByText("English")).not.toBeInTheDocument();
    expect(screen.queryByText("Español")).not.toBeInTheDocument();
  });

  it("switches between dropdowns via controlled props (mutual exclusion)", () => {
    const setOpenFlyout = vi.fn();

    const { rerender } = render(
      <StatusBarRightControls
        {...rightControlsProps}
        openFlyout="theme"
        setOpenFlyout={setOpenFlyout}
      />,
    );

    // Theme content visible
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();

    // Switch to language via controlled prop
    rerender(
      <StatusBarRightControls
        {...rightControlsProps}
        openFlyout="language"
        setOpenFlyout={setOpenFlyout}
      />,
    );

    // Language content visible, theme gone
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
    expect(screen.queryByText("Light")).not.toBeInTheDocument();
    expect(screen.queryByText("Dark")).not.toBeInTheDocument();
  });

  it("closes the open dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">outside</div>
        <RightControlsHarness />
      </div>,
    );

    // Open theme
    await user.click(screen.getByLabelText("Toggle theme"));
    expect(screen.getByText("Auto")).toBeInTheDocument();

    // Click outside
    await user.click(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByText("Light")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("Dark")).not.toBeInTheDocument();
  });
});

// ── Tests: Left Controls ─────────────────────────────────────────────────────

describe("StatusBarLeftControls availability popover", () => {
  it("opens the availability popover when the availability button is clicked", async () => {
    const user = userEvent.setup();
    render(<LeftControlsHarness />);

    await user.click(screen.getByLabelText("View availability schedule"));

    expect(screen.getByText("Availability")).toBeInTheDocument();
  });

  it("shows availability content when openFlyout is set via controlled props", () => {
    const setOpenFlyout = vi.fn();

    render(
      <StatusBarLeftControls
        {...leftControlsProps}
        openFlyout="availability"
        setOpenFlyout={setOpenFlyout}
      />,
    );

    expect(screen.getByText("Availability")).toBeInTheDocument();
  });

  it("closes the availability popover when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">outside</div>
        <LeftControlsHarness />
      </div>,
    );

    // Open popover
    await user.click(screen.getByLabelText("View availability schedule"));
    expect(screen.getByText("Availability")).toBeInTheDocument();

    // Click outside
    await user.click(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByText("Availability")).not.toBeInTheDocument();
    });
  });
});

// ── Tests: Cross-component coordination ──────────────────────────────────────

describe("StatusBar flyout coordination across left and right controls", () => {
  it("only renders one flyout content at a time with controlled openFlyout prop", () => {
    const setOpenFlyout = vi.fn();

    // Render with availability open
    const { rerender } = render(
      <div>
        <StatusBarLeftControls
          {...leftControlsProps}
          openFlyout="availability"
          setOpenFlyout={setOpenFlyout}
        />
        <StatusBarRightControls
          {...rightControlsProps}
          openFlyout="availability"
          setOpenFlyout={setOpenFlyout}
        />
      </div>,
    );

    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.queryByText("Auto")).not.toBeInTheDocument();
    expect(screen.queryByText("English")).not.toBeInTheDocument();

    // Switch to theme
    rerender(
      <div>
        <StatusBarLeftControls
          {...leftControlsProps}
          openFlyout="theme"
          setOpenFlyout={setOpenFlyout}
        />
        <StatusBarRightControls
          {...rightControlsProps}
          openFlyout="theme"
          setOpenFlyout={setOpenFlyout}
        />
      </div>,
    );

    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.queryByText("Availability")).not.toBeInTheDocument();
    expect(screen.queryByText("English")).not.toBeInTheDocument();

    // Switch to language
    rerender(
      <div>
        <StatusBarLeftControls
          {...leftControlsProps}
          openFlyout="language"
          setOpenFlyout={setOpenFlyout}
        />
        <StatusBarRightControls
          {...rightControlsProps}
          openFlyout="language"
          setOpenFlyout={setOpenFlyout}
        />
      </div>,
    );

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.queryByText("Auto")).not.toBeInTheDocument();
    expect(screen.queryByText("Availability")).not.toBeInTheDocument();
  });

  it("cycles through flyouts via user interaction confirming mutual exclusion", async () => {
    const user = userEvent.setup();
    render(<CoordinatedHarness />);

    // Open availability
    await user.click(screen.getByLabelText("View availability schedule"));
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.queryByText("Auto")).not.toBeInTheDocument();
    expect(screen.queryByText("English")).not.toBeInTheDocument();

    // Dismiss and open theme
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByText("Availability")).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Toggle theme"));
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.queryByText("Availability")).not.toBeInTheDocument();
    expect(screen.queryByText("English")).not.toBeInTheDocument();

    // Dismiss and open language
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByText("Auto")).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Toggle language"));
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.queryByText("Auto")).not.toBeInTheDocument();
    expect(screen.queryByText("Availability")).not.toBeInTheDocument();
  });

  it("closes availability when switching to theme via shared state", async () => {
    const user = userEvent.setup();
    render(<CoordinatedHarness />);

    // Open availability
    await user.click(screen.getByLabelText("View availability schedule"));
    expect(screen.getByText("Availability")).toBeInTheDocument();

    // Dismiss and open theme
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByText("Availability")).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Toggle theme"));
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.queryByText("Availability")).not.toBeInTheDocument();
  });

  it("closes theme when switching to availability via shared state", async () => {
    const user = userEvent.setup();
    render(<CoordinatedHarness />);

    // Open theme
    await user.click(screen.getByLabelText("Toggle theme"));
    expect(screen.getByText("Auto")).toBeInTheDocument();

    // Dismiss and open availability
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByText("Auto")).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("View availability schedule"));
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.queryByText("Auto")).not.toBeInTheDocument();
  });
});
