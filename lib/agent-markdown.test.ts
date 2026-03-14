import { describe, expect, it, vi } from "vitest";
import {
  generateAgentMarkdown,
  generateAgentSitemapMarkdown,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from "@/lib/agent-markdown";
import { LINKS } from "@/lib/constants";

vi.mock("@/lib/utils", () => ({
  formatTimeAgo: vi.fn(() => "5 minutes ago"),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const MACHINE_FIXTURE = {
  header: "Mario Lopez - Platform Architect",
  about_section:
    "I currently work in a %s at %s, helping %s build better web experiences. Check out our %s.",
  resume_section: {
    intro: "Experienced engineer with a focus on web platforms.",
    experience_title: "Experience",
    jobs: [
      {
        title: "Platform Architect @ Vercel",
        date: "2023 - Present",
        description: "Building the future of the web.",
      },
      {
        title: "Senior Engineer @ Acme",
        date: "2020 - 2023",
        description: "Led frontend architecture.",
      },
    ],
    leadership_title: "Leadership",
    leadership: [
      {
        title: "Open Source Maintainer",
        date: "2019 - Present",
        description: "Maintaining several open-source projects.",
      },
    ],
    education_title: "Education",
    education: "B.S. Computer Science, Baylor University",
  },
  contact_section: {
    text: "Feel free to reach out!",
    email_label: "Email:",
  },
  socials_labels: {
    github: "GitHub:",
    linkedin: "LinkedIn:",
    twitter: "Twitter:",
    backpocket: "Backpocket:",
    resume_pdf: "Resume (PDF):",
    resume_docx: "Resume (DOCX):",
  },
  projects_labels: {
    chaos_recipe_enhancer: "Chaos Recipe Enhancer:",
    now_playing: "Now Playing:",
    blog: "Blog:",
    create_mlpz_lambda: "create-mlpz-lambda:",
    vercel_bulk_waf_rules: "vercel-bulk-waf-rules:",
    backpocket: "Backpocket:",
    cordstruck: "Cordstruck:",
    guesschella: "Guesschella:",
    building_status: "(building)",
  },
  footer_label: "Source code:",
  recently_played_template:
    'My most recently played song on %platform% is "%song%" by %artist% (played %timeAgo%).\n\nListen: %url%',
};

const RECENTLY_PLAYED_FIXTURE = {
  song: "Starlight",
  artist: "Muse",
  platform: "Spotify",
  url: "https://open.spotify.com/track/abc123",
  timestamp: "2025-06-15T11:55:00.000Z",
};

const BASE_OPTIONS = {
  lang: "en-US" as const,
  machine: MACHINE_FIXTURE,
  recentlyPlayed: RECENTLY_PLAYED_FIXTURE,
  canonicalUrl: "https://mariolopez.org/en-US.md",
  generatedAt: "2025-06-15T12:00:00.000Z",
};

// ── SUPPORTED_LOCALES ────────────────────────────────────────────────────────

describe("SUPPORTED_LOCALES", () => {
  it("contains en-US and es-MX", () => {
    expect(SUPPORTED_LOCALES).toContain("en-US");
    expect(SUPPORTED_LOCALES).toContain("es-MX");
  });

  it("has exactly 2 entries", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(2);
  });
});

// ── isSupportedLocale ────────────────────────────────────────────────────────

describe("isSupportedLocale", () => {
  it('returns true for "en-US"', () => {
    expect(isSupportedLocale("en-US")).toBe(true);
  });

  it('returns true for "es-MX"', () => {
    expect(isSupportedLocale("es-MX")).toBe(true);
  });

  it('returns false for "fr-FR"', () => {
    expect(isSupportedLocale("fr-FR")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isSupportedLocale("")).toBe(false);
  });

  it('returns false for "en-us" (wrong case)', () => {
    expect(isSupportedLocale("en-us")).toBe(false);
  });
});

// ── generateAgentSitemapMarkdown ─────────────────────────────────────────────

describe("generateAgentSitemapMarkdown", () => {
  const sitemapOptions = {
    lang: "en-US" as const,
    baseUrl: "https://mariolopez.org",
    generatedAt: "2025-06-15T12:00:00.000Z",
  };

  it("generates valid frontmatter with url, title, date, lang", () => {
    const result = generateAgentSitemapMarkdown(sitemapOptions);
    expect(result).toContain("---\n");
    expect(result).toContain("url: https://mariolopez.org/en-US/sitemap.md");
    expect(result).toContain('title: "mariolopez.org agent sitemap (en-US)"');
    expect(result).toContain("date: 2025-06-15T12:00:00.000Z");
    expect(result).toContain("lang: en-US");
  });

  it("contains all 4 resource URLs", () => {
    const result = generateAgentSitemapMarkdown(sitemapOptions);
    expect(result).toContain("profile_html: https://mariolopez.org/en-US");
    expect(result).toContain("profile_markdown: https://mariolopez.org/en-US.md");
    expect(result).toContain("machine_html: https://mariolopez.org/en-US/machine");
    expect(result).toContain("sitemap_markdown: https://mariolopez.org/en-US/sitemap.md");
  });

  it("handles baseUrl with trailing slash (normalized)", () => {
    const result = generateAgentSitemapMarkdown({
      ...sitemapOptions,
      baseUrl: "https://mariolopez.org/",
    });
    expect(result).toContain("profile_html: https://mariolopez.org/en-US");
    expect(result).not.toContain("mariolopez.org//");
  });

  it("handles baseUrl without trailing slash", () => {
    const result = generateAgentSitemapMarkdown(sitemapOptions);
    expect(result).toContain("profile_html: https://mariolopez.org/en-US");
  });

  it("produces correct URLs for es-MX locale", () => {
    const result = generateAgentSitemapMarkdown({ ...sitemapOptions, lang: "es-MX" });
    expect(result).toContain("profile_html: https://mariolopez.org/es-MX");
    expect(result).toContain("profile_markdown: https://mariolopez.org/es-MX.md");
    expect(result).toContain("machine_html: https://mariolopez.org/es-MX/machine");
    expect(result).toContain("sitemap_markdown: https://mariolopez.org/es-MX/sitemap.md");
    expect(result).toContain("lang: es-MX");
  });
});

// ── generateAgentMarkdown ────────────────────────────────────────────────────

describe("generateAgentMarkdown", () => {
  // ── Frontmatter ──────────────────────────────────────────────────────────

  describe("frontmatter", () => {
    it("includes url, title, date, and lang", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toMatch(/^---\n/);
      expect(result).toContain("url: https://mariolopez.org/en-US.md");
      expect(result).toContain('title: "Mario Lopez - Platform Architect"');
      expect(result).toContain("date: 2025-06-15T12:00:00.000Z");
      expect(result).toContain("lang: en-US");
    });

    it("escapes quotes in title", () => {
      const machine = { ...MACHINE_FIXTURE, header: 'Mario "The Architect" Lopez' };
      const result = generateAgentMarkdown({ ...BASE_OPTIONS, machine });
      expect(result).toContain('title: "Mario \\"The Architect\\" Lopez"');
    });
  });

  // ── Section headers ──────────────────────────────────────────────────────

  describe("section headers (en-US)", () => {
    it("includes all expected section headers", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toContain("## About");
      expect(result).toContain("## Recently played");
      expect(result).toContain("## Resume");
      expect(result).toContain("## Contact");
      expect(result).toContain("## Socials");
      expect(result).toContain("## Projects");
      expect(result).toContain("## Source");
    });
  });

  // ── About section ────────────────────────────────────────────────────────

  describe("about section", () => {
    it("replaces %s placeholders with proper markdown links", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toContain(`[platform architect role](${LINKS.VERCEL_CAREERS})`);
      expect(result).toContain(`[Vercel](${LINKS.VERCEL})`);
      expect(result).toContain(`[Vercel customers](${LINKS.VERCEL_CUSTOMERS})`);
      expect(result).toContain(`[open roles](${LINKS.VERCEL_FIELD_ENGINEERING})`);
      // No remaining %s placeholders
      const aboutLine = result.split("## About\n")[1]?.split("\n\n## ")[0];
      expect(aboutLine).not.toContain("%s");
    });
  });

  // ── Recently played section ──────────────────────────────────────────────

  describe("recently played section", () => {
    it("formats recently played data with template substitutions", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toContain("Spotify");
      expect(result).toContain('"Starlight"');
      expect(result).toContain("Muse");
      expect(result).toContain("5 minutes ago");
      expect(result).toContain("https://open.spotify.com/track/abc123");
    });

    it("shows unavailable message when recentlyPlayed is null", () => {
      const result = generateAgentMarkdown({ ...BASE_OPTIONS, recentlyPlayed: null });
      expect(result).toContain("No recent listening activity is available right now.");
    });

    it("shows unavailable message when recentlyPlayed has no timestamp", () => {
      const recentlyPlayed = { ...RECENTLY_PLAYED_FIXTURE, timestamp: "" };
      const result = generateAgentMarkdown({ ...BASE_OPTIONS, recentlyPlayed });
      expect(result).toContain("No recent listening activity is available right now.");
    });
  });

  // ── Resume section ───────────────────────────────────────────────────────

  describe("resume section", () => {
    it("formats jobs with #### headings", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toContain("#### Platform Architect @ Vercel");
      expect(result).toContain("2023 - Present");
      expect(result).toContain("Building the future of the web.");
      expect(result).toContain("#### Senior Engineer @ Acme");
    });

    it("formats leadership items", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toContain("#### Open Source Maintainer");
      expect(result).toContain("Maintaining several open-source projects.");
    });
  });

  // ── Contact section ──────────────────────────────────────────────────────

  describe("contact section", () => {
    it("includes email link", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toContain(`[${LINKS.EMAIL_MACHINE}](mailto:${LINKS.EMAIL_MACHINE})`);
    });
  });

  // ── Socials section ──────────────────────────────────────────────────────

  describe("socials section", () => {
    it("includes GitHub, LinkedIn, and Twitter links", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toContain(LINKS.GITHUB);
      expect(result).toContain(LINKS.LINKEDIN);
      expect(result).toContain(LINKS.TWITTER);
    });
  });

  // ── Projects section ─────────────────────────────────────────────────────

  describe("projects section", () => {
    it("includes project links", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toContain(LINKS.CHAOS_RECIPE_ENHANCER);
      expect(result).toContain(LINKS.MUSIC);
      expect(result).toContain(LINKS.BLOG);
      expect(result).toContain(LINKS.CREATE_MLPZ_LAMBDA);
      expect(result).toContain(LINKS.VERCEL_BULK_WAF_RULES);
    });
  });

  // ── Source section ───────────────────────────────────────────────────────

  describe("source section", () => {
    it("includes SITE_SOURCE link", () => {
      const result = generateAgentMarkdown(BASE_OPTIONS);
      expect(result).toContain(LINKS.SITE_SOURCE);
    });
  });

  // ── es-MX locale ─────────────────────────────────────────────────────────

  describe("es-MX locale", () => {
    it("uses Spanish section headers", () => {
      const result = generateAgentMarkdown({ ...BASE_OPTIONS, lang: "es-MX" });
      expect(result).toContain("## Acerca de");
      expect(result).toContain("## Reproducido recientemente");
      expect(result).toContain("## Curriculum");
      expect(result).toContain("## Contacto");
      expect(result).toContain("## Redes");
      expect(result).toContain("## Proyectos");
      expect(result).toContain("## Codigo fuente");
    });

    it("uses Spanish about links", () => {
      const result = generateAgentMarkdown({ ...BASE_OPTIONS, lang: "es-MX" });
      expect(result).toContain(`[rol de arquitecto de plataforma](${LINKS.VERCEL_CAREERS})`);
      expect(result).toContain(`[Vercel](${LINKS.VERCEL})`);
      expect(result).toContain(`[clientes de Vercel](${LINKS.VERCEL_CUSTOMERS})`);
      expect(result).toContain(`[vacantes abiertas](${LINKS.VERCEL_FIELD_ENGINEERING})`);
    });
  });
});
