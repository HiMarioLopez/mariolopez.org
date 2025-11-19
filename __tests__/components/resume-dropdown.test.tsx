import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResumeDropdown } from "@/components/resume-dropdown";
import { LINKS } from "@/lib/constants";

describe("ResumeDropdown", () => {
  beforeEach(() => {
    // Mock window.matchMedia for Radix UI components
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("renders the resume button", () => {
    render(<ResumeDropdown />);
    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
  });

  it("has touch-manipulation class for mobile support", () => {
    const { container } = render(<ResumeDropdown />);
    const wrapper = container.querySelector(".touch-manipulation");
    expect(wrapper).toBeInTheDocument();
  });

  it("opens dropdown on click (touch/mobile interaction)", async () => {
    const user = userEvent.setup();
    render(<ResumeDropdown />);

    const button = screen.getByRole("button", { name: /resume/i });
    expect(button).toBeInTheDocument();

    // Dropdown should not be visible initially
    expect(screen.queryByText("PDF")).not.toBeInTheDocument();
    expect(screen.queryByText("DOCX")).not.toBeInTheDocument();

    // Click to open (simulating touch)
    await user.click(button);

    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText("PDF")).toBeInTheDocument();
      expect(screen.getByText("DOCX")).toBeInTheDocument();
    });
  });

  it("opens and closes dropdown on click", async () => {
    const user = userEvent.setup();
    render(<ResumeDropdown />);

    const button = screen.getByRole("button", { name: /resume/i });

    // Click opens the dropdown
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByText("PDF")).toBeInTheDocument();
    });

    // Clicking outside should close it (simulated by clicking document body)
    await user.click(document.body);
    await waitFor(
      () => {
        expect(screen.queryByText("PDF")).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it("opens dropdown on mouse enter (desktop hover)", async () => {
    render(<ResumeDropdown />);

    const button = screen.getByRole("button", { name: /resume/i });
    const wrapper = button.closest(".touch-manipulation");

    expect(wrapper).toBeInTheDocument();

    // Use fireEvent to properly trigger React event handlers
    fireEvent.mouseEnter(wrapper!);

    await waitFor(() => {
      expect(screen.getByText("PDF")).toBeInTheDocument();
      expect(screen.getByText("DOCX")).toBeInTheDocument();
    });
  });

  it("renders PDF and DOCX links with correct hrefs", async () => {
    const user = userEvent.setup();
    render(<ResumeDropdown />);

    const button = screen.getByRole("button", { name: /resume/i });
    await user.click(button);

    await waitFor(() => {
      // Links are rendered as menuitems inside the dropdown menu
      const pdfLink = screen.getByRole("menuitem", { name: /pdf/i });
      const docxLink = screen.getByRole("menuitem", { name: /docx/i });

      expect(pdfLink).toBeInTheDocument();
      expect(pdfLink).toHaveAttribute("href", LINKS.RESUME_PDF);

      expect(docxLink).toBeInTheDocument();
      expect(docxLink).toHaveAttribute("href", LINKS.RESUME_DOCX);
    });
  });

  it("renders FileText icons in menu items", async () => {
    const user = userEvent.setup();
    render(<ResumeDropdown />);

    const button = screen.getByRole("button", { name: /resume/i });
    await user.click(button);

    await waitFor(() => {
      // Check for SVG elements (lucide-react icons)
      const svgs = document.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});

