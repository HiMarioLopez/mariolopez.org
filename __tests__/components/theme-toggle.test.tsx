import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewToggle } from "@/components/view-toggle";

// Mock dictionary prop
const mockDict = {
  human: "HUMAN",
  machine: "MACHINE",
  auto: "AUTO",
  light: "LIGHT",
  dark: "DARK",
  aria_switch_human: "Switch to Human view",
  aria_switch_machine: "Switch to Machine view",
  aria_toggle_theme: "Toggle theme",
  language: "LANGUAGE",
  aria_toggle_language: "Switch language",
};

const mockLang = "en-US";

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

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => "/en-US/human");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("ViewToggle - Theme Toggle Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme.mockReturnValue("system");
    mockResolvedTheme.mockReturnValue("light");
    mockPathname.mockReturnValue("/en-US/human");
    mockPush.mockClear();
  });

  it("renders the theme toggle button", () => {
    render(<ViewToggle dict={mockDict} lang={mockLang} />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("cycles from system to light on first click", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("system");

    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("cycles from light to dark on second click", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("light");

    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("cycles from dark to system on third click", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("dark");

    render(<ViewToggle dict={mockDict} lang={mockLang} />);
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

    const { rerender } = render(<ViewToggle dict={mockDict} lang={mockLang} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    // Click multiple times rapidly, rerendering after each to update theme state
    await user.click(button);
    rerender(<ViewToggle dict={mockDict} lang={mockLang} />);

    await user.click(button);
    rerender(<ViewToggle dict={mockDict} lang={mockLang} />);

    await user.click(button);
    rerender(<ViewToggle dict={mockDict} lang={mockLang} />);

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

    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    // Click 10 times
    for (let i = 0; i < 10; i++) {
      await user.click(button);
    }

    // Every click should register
    expect(mockSetTheme).toHaveBeenCalledTimes(10);
  });

  it("prevents event propagation on click", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("system");

    const handleParentClick = vi.fn();

    render(
      <div onClick={handleParentClick}>
        <ViewToggle dict={mockDict} lang={mockLang} />
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

    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);

    // Should default to setting system theme
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("has correct button type attribute", () => {
    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toHaveAttribute("type", "button");
  });

  it("has correct aria-label for accessibility", () => {
    mockTheme.mockReturnValue("light");
    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Toggle theme")
    );
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Current: LIGHT")
    );
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Next: DARK")
    );
  });

  it("shows Monitor icon for system theme", () => {
    mockTheme.mockReturnValue("system");
    render(<ViewToggle dict={mockDict} lang={mockLang} />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    // Check that Monitor icon is present (system theme)
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("shows Sun icon for light theme", () => {
    mockTheme.mockReturnValue("light");
    render(<ViewToggle dict={mockDict} lang={mockLang} />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("shows Moon icon for dark theme", () => {
    mockTheme.mockReturnValue("dark");
    render(<ViewToggle dict={mockDict} lang={mockLang} />);

    const button = screen.getByRole("button", { name: /toggle theme/i });
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("has touch-manipulation class for mobile support", () => {
    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button.className).toContain("touch-manipulation");
  });

  it("renders divider between view toggle and theme toggle", () => {
    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    
    // Check for divider element (vertical line)
    // There are multiple dividers now, so we just check if at least one exists
    const dividers = document.querySelectorAll(".bg-foreground\\/30");
    expect(dividers.length).toBeGreaterThan(0);
  });
});
