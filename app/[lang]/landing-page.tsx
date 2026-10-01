"use client";

import type { LucideIcon } from "lucide-react";
import { File, FileText, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "@/components/status-bar";
import { Github, Linkedin, Twitter } from "@/components/ui/brand-icons";
import type { BuildMetadata } from "@/lib/build-metadata";
import { AVAILABILITY_DISPLAY, LINKS } from "@/lib/constants";
import { useAvailabilityStatus } from "@/lib/hooks/use-availability-status";

interface LandingDict {
  greeting: string;
  jsdoc_role: string;
  jsdoc_company: string;
  intro_role: string;
  intro_at: string;
  intro_company: string;
  intro_proud: string;
  intro_school: string;
  intro_solving: string;
  intro_customers: string;
  intro_scope: string;
  intro_team: string;
  intro_hiring: string;
  section_links: string;
  section_meta: string;
  section_contact: string;
  resume_label: string;
  contact_text: string;
  build_info: {
    label: string;
  };
}

interface ViewToggleDict {
  human: string;
  machine: string;
  auto: string;
  light: string;
  dark: string;
  aria_switch_human: string;
  aria_switch_machine: string;
  aria_toggle_theme: string;
  language: string;
  aria_toggle_language: string;
  music: {
    now_playing_on: string;
    last_played_on: string;
    open_track: string;
    unknown_duration: string;
  };
}

function LinkIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 shrink-0">
      <Icon
        size={14}
        strokeWidth={1.5}
        className="text-text-decorative group-hover:text-muted-foreground transition-colors"
      />
    </span>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 md:mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-text-decorative select-none font-mono text-xs">#</span>
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
  { icon: Github, label: "github", value: "github.com/HiMarioLopez", href: LINKS.GITHUB },
  {
    icon: Linkedin,
    label: "linkedin",
    value: "linkedin.com/in/HiMarioLopez",
    href: LINKS.LINKEDIN,
  },
  { icon: Twitter, label: "twitter", value: "twitter.com/HiMarioLopez", href: LINKS.TWITTER },
] as const;

const RESUME_LINK_ITEMS = [
  { icon: File, value: "pdf", href: LINKS.RESUME_PDF },
  { icon: FileText, value: "docx", href: LINKS.RESUME_DOCX },
] as const;

function ResumeLinkDrawer({ label }: { label: string }) {
  const [isDrawerPinnedOpen, setIsDrawerPinnedOpen] = useState(false);
  const [isDrawerHovered, setIsDrawerHovered] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawerVisible = isDrawerPinnedOpen || (canHover && isDrawerHovered);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const syncHoverCapability = () => {
      const supportsHover = hoverQuery.matches;
      setCanHover(supportsHover);

      if (!supportsHover) {
        setIsDrawerHovered(false);
      }
    };

    syncHoverCapability();

    hoverQuery.addEventListener("change", syncHoverCapability);
    return () => hoverQuery.removeEventListener("change", syncHoverCapability);
  }, []);

  useEffect(() => {
    if (!isDrawerPinnedOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current || !(event.target instanceof Node)) {
        return;
      }

      if (!containerRef.current.contains(event.target)) {
        setIsDrawerPinnedOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerPinnedOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDrawerPinnedOpen]);

  return (
    <div
      ref={containerRef}
      className={`group group/resume relative -mx-3 flex items-center gap-3 rounded-md px-3 py-3 transition-colors sm:py-2.5 ${
        isDrawerVisible ? "bg-accent" : "hover:bg-accent"
      }`}
      onPointerEnter={() => {
        if (canHover) {
          setIsDrawerHovered(true);
        }
      }}
      onPointerLeave={() => {
        if (canHover) {
          setIsDrawerHovered(false);
        }
      }}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
        aria-expanded={isDrawerVisible}
        aria-controls="resume-format-drawer"
        onClick={() => setIsDrawerPinnedOpen((prev) => !prev)}
      >
        <LinkIcon icon={FileText} />
        <span className="text-sm text-text-secondary w-20 shrink-0 mr-1 group-hover:text-foreground transition-colors">
          {label}
        </span>
        <span
          className={`hidden text-xs text-text-tertiary transition-opacity sm:block ${
            isDrawerVisible ? "opacity-0" : "opacity-100"
          }`}
        >
          pdf · docx
        </span>
        <span aria-hidden="true" className="pointer-events-none ml-auto h-3.5 w-3.5 shrink-0" />
      </button>
      <div
        id="resume-format-drawer"
        className={`ml-auto flex items-center overflow-hidden whitespace-nowrap transition-all duration-200 ${
          isDrawerVisible
            ? "pointer-events-auto max-w-40 pl-2 opacity-100 sm:max-w-44 sm:pl-3"
            : "pointer-events-none max-w-0 pl-0 opacity-0"
        }`}
      >
        {RESUME_LINK_ITEMS.map((item, index) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} ${item.value}`}
            className={`group/item inline-flex items-center gap-1 rounded-sm px-1.5 py-1 text-[11px] text-text-tertiary transition-colors hover:bg-accent/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 ${
              index > 0 ? "ml-1 border-l border-border/60 pl-2" : ""
            }`}
            onClick={() => setIsDrawerPinnedOpen(false)}
          >
            <item.icon
              size={11}
              strokeWidth={1.7}
              className="text-text-tertiary group-hover/item:text-foreground transition-colors"
            />
            <span className="font-medium tracking-[0.08em]">{item.value}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function LandingPage({
  lang,
  dict,
  statusBarDict,
  buildMetadata,
}: {
  lang: string;
  dict: LandingDict;
  statusBarDict: ViewToggleDict;
  buildMetadata: BuildMetadata;
}) {
  const availabilityStatus = useAvailabilityStatus();
  const display = AVAILABILITY_DISPLAY[availabilityStatus];
  const locale = lang === "es-MX" ? "es-MX" : "en-US";
  const statusLabel = display.jsdoc[locale];

  return (
    <>
      <main className="min-h-screen bg-background text-foreground font-mono antialiased selection:bg-foreground/15 selection:text-foreground">
        <div className="max-w-[680px] mx-auto px-5 sm:px-6 py-8 sm:py-10 md:py-16">
          {/* Header */}
          <header className="mb-10 md:mb-14">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span>mariolopez.org</span>
                <span className="text-text-decorative">/</span>
                <span className="text-text-tertiary">~</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs text-text-tertiary">{dict.greeting}</span>
                <span className="text-lg select-none" title={dict.greeting}>
                  🤠
                </span>
              </div>
            </div>

            {/* JSDoc block */}
            <pre className="text-text-tertiary text-[11px] sm:text-xs leading-relaxed mb-6">{`/**
 * @name    Mario Lopez Martinez
 * @role    ${dict.jsdoc_role}
 * @company ${dict.jsdoc_company}
 * @status  ${statusLabel}
 */`}</pre>

            <h1 className="sr-only">Mario Lopez Martinez</h1>
            <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-[500px]">
              <a
                href={LINKS.VERCEL_CAREERS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground border-b border-border hover:border-foreground transition-colors pb-px"
              >
                {dict.intro_role}
              </a>{" "}
              {dict.intro_at}{" "}
              <a
                href={LINKS.VERCEL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground border-b border-border hover:border-foreground transition-colors pb-px"
              >
                {dict.intro_company}
              </a>
              . {dict.intro_proud}{" "}
              <a
                href={LINKS.BAYLOR}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground border-b border-border hover:border-foreground transition-colors pb-px"
              >
                {dict.intro_school}
              </a>
              . {dict.intro_solving}{" "}
              <a
                href={LINKS.VERCEL_CUSTOMERS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground border-b border-border hover:border-foreground transition-colors pb-px"
              >
                {dict.intro_customers}
              </a>{" "}
              {dict.intro_scope}. {dict.intro_team}{" "}
              <a
                href={LINKS.VERCEL_FIELD_ENGINEERING}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 dark:text-blue-300 border-b border-blue-700/35 dark:border-blue-300/35 hover:border-blue-700 dark:hover:border-blue-300 transition-colors pb-px"
              >
                {dict.intro_hiring}
              </a>
              .
            </p>
          </header>

          {/* Links */}
          <Section label={dict.section_links}>
            <div className="space-y-1">
              {LINK_ITEMS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 py-3 sm:py-2.5 hover:bg-accent -mx-3 px-3 rounded-md transition-colors"
                >
                  <LinkIcon icon={link.icon} />
                  <span className="text-sm text-text-secondary w-20 shrink-0 mr-1 group-hover:text-foreground transition-colors">
                    {link.label}
                  </span>
                  <span className="text-xs text-text-secondary group-hover:text-foreground transition-colors truncate hidden sm:block">
                    {link.value}
                  </span>
                  <svg
                    className="ml-auto w-3.5 h-3.5 text-text-decorative group-hover:text-muted-foreground transition-colors shrink-0"
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
              <ResumeLinkDrawer label={dict.resume_label} />
            </div>
          </Section>

          <Section label={dict.section_contact}>
            <p className="text-sm text-text-secondary leading-relaxed mb-1">{dict.contact_text}</p>
            <a
              href={LINKS.EMAIL_HUMAN}
              className="group flex items-center gap-3 py-3 sm:py-2.5 hover:bg-accent -mx-3 px-3 rounded-md transition-colors"
            >
              <LinkIcon icon={Mail} />
              <span className="text-sm text-text-secondary group-hover:text-foreground transition-colors">
                contact@mariolopez.org
              </span>
              <svg
                className="ml-auto w-3.5 h-3.5 text-text-decorative group-hover:text-muted-foreground transition-colors shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </Section>

          {/* Meta */}
          <Section label={dict.section_meta}>
            <p className="flex flex-wrap items-center gap-1.5 text-[12px] text-text-decorative">
              <span>{dict.build_info.label}</span>
              <time
                className="text-text-tertiary font-mono [font-variant-numeric:tabular-nums]"
                dateTime={buildMetadata.siteLastUpdatedIso}
              >
                {buildMetadata.siteLastUpdatedDisplay}
              </time>
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-[2px] border border-emerald-800/45 bg-emerald-600 dark:border-emerald-300/55 dark:bg-emerald-400"
              />
            </p>
          </Section>

          <div className="h-36 sm:h-16" />
        </div>
      </main>

      <StatusBar lang={lang} mode="human" dict={statusBarDict} />
    </>
  );
}
