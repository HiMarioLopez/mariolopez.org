import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/theme-toggle";

// Mock next-themes
const mockSetTheme = vi.fn();
const mockTheme = vi.fn(() => "system");
const mockResolvedTheme = vi.fn(() => "light");

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme(),
    setTheme: mockSetTheme,
    resolvedTheme: mockResolvedTheme(),
  }),
}));

// Mock the ASCII component to avoid Three.js complexity in tests
vi.mock("@/components/ui/ascii-text", () => ({
  default: () => <div data-testid="ascii-text">💡</div>,
  invalidateFontCache: vi.fn(),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme.mockReturnValue("system");
    mockResolvedTheme.mockReturnValue("light");

    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor(
        public callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit
      ) {
        // Immediately call callback with intersecting entry
        setTimeout(() => {
          callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as IntersectionObserver
          );
        }, 0);
      }

      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = "";
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("renders the theme toggle button", async () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("cycles from system to light on first click", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("system");

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("cycles from light to dark on second click", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("light");

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("cycles from dark to system on third click", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("dark");

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("handles multiple rapid clicks correctly", async () => {
    const user = userEvent.setup();

    // Simulate theme changes by updating mock return value
    let currentTheme = "system";
    mockTheme.mockImplementation(() => currentTheme);
    mockSetTheme.mockImplementation((newTheme) => {
      currentTheme = newTheme as string;
    });

    const { rerender } = render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    // Click multiple times rapidly, rerendering after each to update theme state
    await user.click(button);
    rerender(<ThemeToggle />);

    await user.click(button);
    rerender(<ThemeToggle />);

    await user.click(button);
    rerender(<ThemeToggle />);

    await user.click(button);

    // Should have been called 4 times
    expect(mockSetTheme).toHaveBeenCalledTimes(4);

    // Verify the sequence: system -> light -> dark -> system -> light
    expect(mockSetTheme).toHaveBeenNthCalledWith(1, "light");
    expect(mockSetTheme).toHaveBeenNthCalledWith(2, "dark");
    expect(mockSetTheme).toHaveBeenNthCalledWith(3, "system");
    expect(mockSetTheme).toHaveBeenNthCalledWith(4, "light");
  });

  it("handles 10 consecutive clicks without missing any", async () => {
    const user = userEvent.setup();

    let currentTheme = "system";
    mockTheme.mockImplementation(() => currentTheme);
    mockSetTheme.mockImplementation((newTheme) => {
      currentTheme = newTheme as string;
    });

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    // Click 10 times
    for (let i = 0; i < 10; i++) {
      await user.click(button);
    }

    // Every click should register
    expect(mockSetTheme).toHaveBeenCalledTimes(10);
  });

  it("handles clicks on different parts of the button", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("system");

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    // Click the button multiple times to verify all clicks register
    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledTimes(1);

    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledTimes(2);

    await user.click(button);

    // All clicks should register
    expect(mockSetTheme).toHaveBeenCalledTimes(3);
  });

  it("prevents event propagation on click", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("system");

    const handleParentClick = vi.fn();

    render(
      <div onClick={handleParentClick}>
        <ThemeToggle />
      </div>
    );

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    // Theme should change
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    // Parent click handler should not be called due to stopPropagation
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it("works correctly when theme is undefined", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue(undefined as unknown as string);

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);

    // Should default to setting system theme
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("has correct button type attribute", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toHaveAttribute("type", "button");
  });

  it("has correct aria-label for accessibility", () => {
    mockTheme.mockReturnValue("light");
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Toggle theme")
    );
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Current: Light")
    );
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Next: Dark")
    );
  });

  it("shows current theme label always visible", () => {
    mockTheme.mockReturnValue("light");
    render(<ThemeToggle />);

    // Current theme should be visible
    expect(screen.getByText("Light")).toBeInTheDocument();
    // Next theme indicator should be visible
    expect(screen.getByText(/→ Dark/i)).toBeInTheDocument();
  });

  it("shows system theme label when system is selected", () => {
    mockTheme.mockReturnValue("system");
    mockResolvedTheme.mockReturnValue("dark");

    render(<ThemeToggle />);

    // Should show "System" when system theme is selected
    expect(screen.getByText("System")).toBeInTheDocument();
    // Next theme indicator should show Light
    expect(screen.getByText(/→ Light/i)).toBeInTheDocument();
  });

  it("shows correct labels for all theme states", () => {
    // Test Light theme
    mockTheme.mockReturnValue("light");
    const { rerender } = render(<ThemeToggle />);
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText(/→ Dark/i)).toBeInTheDocument();

    // Test Dark theme
    mockTheme.mockReturnValue("dark");
    rerender(<ThemeToggle />);
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText(/→ System/i)).toBeInTheDocument();

    // Test System theme
    mockTheme.mockReturnValue("system");
    mockResolvedTheme.mockReturnValue("light");
    rerender(<ThemeToggle />);
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText(/→ Light/i)).toBeInTheDocument();
  });

  it("applies correct opacity based on theme", () => {
    mockTheme.mockReturnValue("light");
    const { rerender } = render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    // Light theme should have opacity-100
    expect(button.className).toContain("opacity-100");

    // Dark theme should have opacity-70
    mockTheme.mockReturnValue("dark");
    rerender(<ThemeToggle />);
    expect(button.className).toContain("opacity-70");

    // System theme should have opacity-85
    mockTheme.mockReturnValue("system");
    rerender(<ThemeToggle />);
    expect(button.className).toContain("opacity-85");
  });

  it("updates labels when theme changes", () => {
    mockTheme.mockReturnValue("light");
    const { rerender } = render(<ThemeToggle />);

    // Initial state: Light
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText(/→ Dark/i)).toBeInTheDocument();

    // Change theme to dark
    mockTheme.mockReturnValue("dark");
    rerender(<ThemeToggle />);

    // Should update to Dark
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText(/→ System/i)).toBeInTheDocument();
  });

  it("has touch-manipulation class for mobile support", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button.className).toContain("touch-manipulation");
  });
});
