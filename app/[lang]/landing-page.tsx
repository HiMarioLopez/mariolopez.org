"use client";

import { StatusBar } from "@/components/status-bar";
import { LINKS } from "@/lib/constants";

function KeyHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="hidden sm:inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-mono bg-accent border border-border rounded text-muted-foreground">
      {children}
    </kbd>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 md:mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-border select-none font-mono text-xs">#</span>
        <h2 className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground">
          {label}
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </section>
  );
}

const LINK_ITEMS = [
  { key: "g", label: "github", value: "github.com/HiMarioLopez", href: LINKS.GITHUB },
  { key: "l", label: "linkedin", value: "linkedin.com/in/HiMarioLopez", href: LINKS.LINKEDIN },
  { key: "t", label: "twitter", value: "twitter.com/HiMarioLopez", href: LINKS.TWITTER },
  { key: "b", label: "blog", value: "bolognese.mariolopez.org", href: LINKS.BLOG },
  { key: "e", label: "email", value: "contact@mariolopez.org", href: LINKS.EMAIL_HUMAN },
] as const;

const PROJECT_ITEMS = [
  {
    name: "chaos-recipe-enhancer",
    desc: "Desktop automation for PoE \u00b7 20k+ users",
    href: LINKS.CHAOS_RECIPE_ENHANCER,
    status: "active" as const,
  },
  {
    name: "now-playing",
    desc: "Real-time music integration service",
    href: LINKS.MUSIC,
    status: "active" as const,
  },
  {
    name: "backpocket",
    desc: "Personal knowledge management",
    href: LINKS.BACKPOCKET,
    status: "active" as const,
  },
  {
    name: "blog",
    desc: "Technical writing & thoughts",
    href: LINKS.BLOG,
    status: "active" as const,
  },
  { name: "cordstruck", desc: "In development", href: "#", status: "building" as const },
  { name: "guesschella", desc: "In development", href: "#", status: "building" as const },
] as const;

export function LandingPage({ lang }: { lang: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono antialiased selection:bg-foreground/15 selection:text-foreground">
      <div className="max-w-[680px] mx-auto px-5 sm:px-6 py-8 sm:py-10 md:py-16">
        {/* Header */}
        <header className="mb-10 md:mb-14">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>mariolopez.org</span>
              <span className="text-border">/</span>
              <span className="text-foreground/60">~</span>
            </div>
            <span className="text-lg select-none" title="Howdy Hey">
              🤠
            </span>
          </div>

          {/* JSDoc block */}
          <pre className="text-muted-foreground/60 text-[11px] sm:text-xs leading-relaxed mb-6">{`/**
 * @name    Mario Lopez Martinez
 * @role    Platform Architect
 * @company Vercel
 * @status  Active
 */`}</pre>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-foreground">
            Howdy Hey
          </h1>
          <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-[500px]">
            <a
              href={LINKS.VERCEL_CAREERS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground border-b border-border hover:border-foreground transition-colors pb-px"
            >
              Platform Architect
            </a>{" "}
            at{" "}
            <a
              href={LINKS.VERCEL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground border-b border-border hover:border-foreground transition-colors pb-px"
            >
              Vercel
            </a>
            . Solving the hardest problems for{" "}
            <a
              href={LINKS.VERCEL_CUSTOMERS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground border-b border-border hover:border-foreground transition-colors pb-px"
            >
              remarkable customers
            </a>
            . Team is{" "}
            <a
              href={LINKS.VERCEL_FIELD_ENGINEERING}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 dark:text-blue-400 border-b border-blue-500/30 dark:border-blue-400/30 hover:border-blue-500 dark:hover:border-blue-400 transition-colors pb-px"
            >
              hiring
            </a>
            .
          </p>
        </header>

        {/* Links */}
        <Section label="links">
          <div className="space-y-0">
            {LINK_ITEMS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 py-3 sm:py-2.5 hover:bg-accent -mx-3 px-3 rounded-md transition-colors"
              >
                <KeyHint>{link.key}</KeyHint>
                <span className="text-sm text-muted-foreground w-20 shrink-0 group-hover:text-foreground transition-colors">
                  {link.label}
                </span>
                <span className="text-xs text-muted-foreground/50 group-hover:text-muted-foreground transition-colors truncate hidden sm:block">
                  {link.value}
                </span>
                <svg
                  className="ml-auto w-3.5 h-3.5 text-border group-hover:text-muted-foreground transition-colors shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7v10"
                  />
                </svg>
              </a>
            ))}

            {/* Resume row with dual format links */}
            <div className="flex items-center gap-3 py-3 sm:py-2.5 -mx-3 px-3">
              <KeyHint>r</KeyHint>
              <span className="text-sm text-muted-foreground w-20 shrink-0">resume</span>
              <div className="flex items-center gap-0 rounded border border-border overflow-hidden">
                <a
                  href={LINKS.RESUME_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
                >
                  pdf
                </a>
                <span className="w-px h-3 bg-border" />
                <a
                  href={LINKS.RESUME_DOCX}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
                >
                  docx
                </a>
              </div>
            </div>
          </div>
        </Section>

        {/* Projects */}
        <Section label="projects">
          <div className="space-y-0">
            {PROJECT_ITEMS.map((project) => (
              <a
                key={project.name}
                href={project.href}
                target={project.status === "active" ? "_blank" : undefined}
                rel={project.status === "active" ? "noopener noreferrer" : undefined}
                className={`group flex items-center gap-3 py-3 sm:py-2.5 -mx-3 px-3 rounded-md transition-colors ${
                  project.status === "active" ? "hover:bg-accent" : "opacity-35 cursor-not-allowed"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    project.status === "active" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                  }`}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                  {project.name}
                </span>
                <span className="text-muted-foreground/30 hidden sm:inline">&mdash;</span>
                <span className="text-xs text-muted-foreground/50 group-hover:text-muted-foreground transition-colors truncate hidden sm:block">
                  {project.desc}
                </span>
                {project.status === "active" && (
                  <svg
                    className="ml-auto w-3.5 h-3.5 text-border group-hover:text-muted-foreground transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 17L17 7M17 7H7M17 7v10"
                    />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section label="contact">
          <div className="bg-card border border-border rounded-lg p-5">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              I mentor students and early-career professionals and speak at events. In Houston?
              Let&rsquo;s grab a coffee. Elsewhere? Conversation can flow through the wire.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={LINKS.EMAIL_HUMAN}
                className="inline-flex items-center h-9 px-5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Get in Touch
              </a>
              <span className="text-xs text-muted-foreground/40 hidden sm:block">
                <KeyHint>Enter</KeyHint>
              </span>
            </div>
          </div>
        </Section>

        <div className="h-16" />
      </div>

      <StatusBar lang={lang} mode="human" />
    </div>
  );
}
