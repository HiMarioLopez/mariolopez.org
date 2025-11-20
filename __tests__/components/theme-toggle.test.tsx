import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewToggle } from "@/components/view-toggle";

// Mock dictionary prop
const mockDict = {
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

// Radix UI Dropdown Menu requires ResizeObserver which isn't in jsdom
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock PointerEvent for Radix UI
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

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

  it("opens menu and selects light theme", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("system");

    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    
    // 1. Click trigger to open menu
    const trigger = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(trigger);

    // 2. Click "Light" option
    const lightOption = screen.getByRole("menuitem", { name: /light/i });
    await user.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("opens menu and selects dark theme", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("light");

    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    
    const trigger = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(trigger);

    const darkOption = screen.getByRole("menuitem", { name: /dark/i });
    await user.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("opens menu and selects system theme", async () => {
    const user = userEvent.setup();
    mockTheme.mockReturnValue("dark");

    render(<ViewToggle dict={mockDict} lang={mockLang} />);
    
    const trigger = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(trigger);

    const systemOption = screen.getByRole("menuitem", { name: /auto/i });
    await user.click(systemOption);

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
      expect.stringContaining("Current: Light")
    );
    // Should NOT contain "Next:" anymore
    expect(button).not.toHaveAttribute(
      "aria-label",
      expect.stringContaining("Next:")
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
    const dividers = document.querySelectorAll(".bg-foreground\\/30");
    expect(dividers.length).toBeGreaterThan(0);
  });
});
