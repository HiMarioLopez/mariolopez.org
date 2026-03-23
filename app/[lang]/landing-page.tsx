"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  File,
  FileText,
  Github,
  Linkedin,
  Mail,
  Music,
  Shield,
  Twitter,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "@/components/status-bar";
import type { BuildMetadata } from "@/lib/build-metadata";
import { AVAILABILITY_DISPLAY, AWS_BADGE_IMAGES, LINKS, PROJECT_LOGOS } from "@/lib/constants";
import { useAvailabilityStatus } from "@/lib/hooks/use-availability-status";
import { useRecentlyPlayed } from "@/lib/hooks/use-recently-played";
import { getPlatformColor } from "@/lib/utils";

interface LandingDict {
  greeting: string;
  jsdoc_role: string;
  jsdoc_company: string;
  intro_role: string;
  intro_at: string;
  intro_company: string;
  intro_solving: string;
  intro_customers: string;
  intro_scope: string;
  intro_team: string;
  intro_hiring: string;
  section_links: string;
  section_projects: string;
  section_credentials: string;
  section_meta: string;
  section_contact: string;
  resume_label: string;
  contact_text: string;
  build_info: {
    label: string;
  };
  projects: {
    chaos_recipe_enhancer: string;
    now_playing: string;
    backpocket: string;
    blog: string;
    create_mlpz_lambda: string;
    vercel_bulk_waf_rules: string;
    cordstruck: string;
    guesschella: string;
  };
  credentials: {
    education_pre: string;
    school: string;
    education_post: string;
    certs_intro: string;
    certs: Array<{
      name: string;
      level: string;
      issued: string;
      expires: string;
    }>;
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

function ProjectBadge({
  status,
  logoSrc,
  emoji,
  icon: Icon,
  iconHoverClass,
  iconHoverColor,
  name,
}: {
  status: ProjectStatus;
  logoSrc?: string;
  emoji?: string;
  icon?: LucideIcon;
  iconHoverClass?: string;
  iconHoverColor?: string;
  name: string;
}) {
  return (
    <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={`${name} logo`}
          width={16}
          height={16}
          sizes="16px"
          className="h-4 w-4 rounded-sm object-contain grayscale opacity-75 transition-[filter,opacity] duration-200 group-hover:grayscale-0 group-hover:opacity-100 group-focus-within:grayscale-0 group-focus-within:opacity-100"
        />
      ) : emoji ? (
        <span
          aria-hidden="true"
          className="inline-flex h-4 w-4 items-center justify-center text-[12px] leading-none grayscale opacity-70 transition-[filter,opacity,transform] duration-200 group-hover:grayscale-0 group-hover:opacity-100 group-focus-within:grayscale-0 group-focus-within:opacity-100 group-hover:scale-105 group-focus-within:scale-105"
        >
          {emoji}
        </span>
      ) : Icon ? (
        <span
          className="inline-flex h-4 w-4 items-center justify-center"
          style={
            iconHoverColor
              ? ({ "--project-icon-hover-color": iconHoverColor } as React.CSSProperties)
              : undefined
          }
        >
          <Icon
            size={11}
            strokeWidth={1.8}
            className={`text-text-tertiary transition-colors ${
              iconHoverColor
                ? "group-hover:text-[var(--project-icon-hover-color)] group-focus-within:text-[var(--project-icon-hover-color)]"
                : (iconHoverClass ??
                  "group-hover:text-foreground group-focus-within:text-foreground")
            }`}
          />
        </span>
      ) : (
        <span className="h-3.5 w-3.5 rounded-sm border border-border/80 bg-muted/20" />
      )}
      <span
        className={`absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-background ${
          status === "active" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
        }`}
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
  {
    icon: Bookmark,
    label: "backpocket",
    value: "backpocket.mariolopez.org",
    href: LINKS.BACKPOCKET_SPACE,
  },
] as const;

const RESUME_LINK_ITEMS = [
  { icon: File, value: "pdf", href: LINKS.RESUME_PDF },
  { icon: FileText, value: "docx", href: LINKS.RESUME_DOCX },
] as const;

/**
 * AWS certification badge metadata, ordered to match the certs array in dictionaries.
 * Order: Solutions Architect, AI Practitioner, Security, Developer
 */
const AWS_CERT_BADGE_META = [
  { src: AWS_BADGE_IMAGES.SOLUTIONS_ARCHITECT, href: LINKS.AWS_CERT_SOLUTIONS_ARCHITECT },
  { src: AWS_BADGE_IMAGES.AI_PRACTITIONER, href: LINKS.AWS_CERT_AI_PRACTITIONER },
  { src: AWS_BADGE_IMAGES.SECURITY, href: LINKS.AWS_CERT_SECURITY },
  { src: AWS_BADGE_IMAGES.DEVELOPER, href: LINKS.AWS_CERT_DEVELOPER },
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

interface DescLink {
  match: RegExp;
  href: string;
}

type ProjectStatus = "active" | "building";

interface ProjectItem {
  name: string;
  desc: string;
  href: string;
  status: ProjectStatus;
  descLinks?: DescLink[];
  logoSrc?: string;
  emoji?: string;
  icon?: LucideIcon;
  iconHoverClass?: string;
  iconHoverColor?: string;
}

function ProjectDescription({ text, links }: { text: string; links?: DescLink[] }) {
  if (!links?.length) {
    return <>{text}</>;
  }

  for (const link of links) {
    const result = link.match.exec(text);
    if (result) {
      const before = text.slice(0, result.index);
      const matched = result[0];
      const after = text.slice(result.index + matched.length);

      return (
        <>
          {before}
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 underline decoration-dotted underline-offset-2 decoration-muted-foreground/45 hover:text-foreground hover:decoration-foreground/65 transition-[color,text-decoration-color]"
            onClick={(e) => e.stopPropagation()}
          >
            {matched}
          </a>
          {after}
        </>
      );
    }
  }

  return <>{text}</>;
}

function getProjectItems(
  dict: LandingDict,
  nowPlayingIconHoverColor: string | null,
): ProjectItem[] {
  return [
    {
      name: "chaos-recipe-enhancer",
      desc: dict.projects.chaos_recipe_enhancer,
      href: LINKS.CHAOS_RECIPE_ENHANCER,
      status: "active",
      descLinks: [{ match: /Path of Exile|PoE/, href: LINKS.PATH_OF_EXILE }],
      logoSrc: PROJECT_LOGOS.CHAOS_RECIPE_ENHANCER,
    },
    {
      name: "now-playing",
      desc: dict.projects.now_playing,
      href: LINKS.MUSIC,
      status: "active",
      descLinks: [
        {
          match: /over-engineered|sobre-ingenierizado/i,
          href: LINKS.MUSIC_REPO_OUTLINE,
        },
      ],
      icon: Music,
      iconHoverClass: "group-hover:text-emerald-400 group-focus-within:text-emerald-400",
      iconHoverColor: nowPlayingIconHoverColor ?? undefined,
    },
    {
      name: "backpocket",
      desc: dict.projects.backpocket,
      href: LINKS.BACKPOCKET,
      status: "active",
      descLinks: [{ match: /RIP Pocket|QEPD Pocket/i, href: LINKS.POCKET }],
      logoSrc: PROJECT_LOGOS.BACKPOCKET,
    },
    {
      name: "blog",
      desc: dict.projects.blog,
      href: LINKS.BLOG,
      status: "active",
      emoji: "🍝",
    },
    {
      name: "create-mlpz-lambda",
      desc: dict.projects.create_mlpz_lambda,
      href: LINKS.CREATE_MLPZ_LAMBDA,
      status: "active",
      icon: Zap,
      iconHoverClass: "group-hover:text-amber-400 group-focus-within:text-amber-400",
    },
    {
      name: "vercel-bulk-waf-rules",
      desc: dict.projects.vercel_bulk_waf_rules,
      href: LINKS.VERCEL_BULK_WAF_RULES,
      status: "active",
      icon: Shield,
      iconHoverClass: "group-hover:text-cyan-400 group-focus-within:text-cyan-400",
    },
    {
      name: "cordstruck",
      desc: dict.projects.cordstruck,
      href: "#",
      status: "building",
      logoSrc: PROJECT_LOGOS.CORDSTRUCK,
    },
    {
      name: "guesschella",
      desc: dict.projects.guesschella,
      href: "#",
      status: "building",
      logoSrc: PROJECT_LOGOS.GUESSCHELLA,
    },
  ];
}

function ProjectName({ name }: { name: string }) {
  if (name !== "blog") {
    return <>{name}</>;
  }

  const decoratedBlogLetters =
    "transition-[color,text-decoration-color] duration-200 group-hover:text-rose-400 dark:group-hover:text-rose-300 group-hover:underline group-hover:decoration-dotted group-hover:decoration-2 group-hover:underline-offset-3 group-hover:decoration-rose-400 dark:group-hover:decoration-rose-300";

  return (
    <span>
      <span className={decoratedBlogLetters}>b</span>o
      <span className={decoratedBlogLetters}>log</span>nese
    </span>
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
  const { data: recentlyPlayed } = useRecentlyPlayed();
  const display = AVAILABILITY_DISPLAY[availabilityStatus];
  const locale = lang === "es-MX" ? "es-MX" : "en-US";
  const statusLabel = display.jsdoc[locale];
  const nowPlayingIconHoverColor = recentlyPlayed?.platform
    ? getPlatformColor(recentlyPlayed.platform)
    : null;
  const projectItems = getProjectItems(dict, nowPlayingIconHoverColor);

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
 * @name    Mario Lopez
 * @role    ${dict.jsdoc_role}
 * @company ${dict.jsdoc_company}
 * @status  ${statusLabel}
 */`}</pre>

            <h1 className="sr-only">Mario Lopez</h1>
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

          {/* Projects */}
          <Section label={dict.section_projects}>
            <div className="space-y-1">
              {projectItems.map((project) => (
                <div
                  key={project.name}
                  className={`group relative flex items-center gap-3 py-3 sm:py-2.5 -mx-3 px-3 rounded-md transition-colors ${
                    project.status === "active"
                      ? "hover:bg-accent"
                      : "cursor-not-allowed bg-accent/40"
                  }`}
                  aria-disabled={project.status !== "active"}
                >
                  {project.status === "active" && (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-0"
                      aria-label={project.name}
                    >
                      <span className="sr-only">{project.name}</span>
                    </a>
                  )}
                  <ProjectBadge
                    status={project.status}
                    logoSrc={project.logoSrc}
                    emoji={project.emoji}
                    icon={project.icon}
                    iconHoverClass={project.iconHoverClass}
                    iconHoverColor={project.iconHoverColor}
                    name={project.name}
                  />
                  <span className="text-sm text-text-secondary group-hover:text-foreground transition-colors shrink-0">
                    <ProjectName name={project.name} />
                  </span>
                  <span className="text-text-decorative hidden sm:inline">&mdash;</span>
                  <span className="text-xs text-text-secondary group-hover:text-foreground transition-colors truncate hidden sm:block">
                    <ProjectDescription text={project.desc} links={project.descLinks} />
                  </span>
                  {project.status === "active" && (
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
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Education & Credentials */}
          <Section label={dict.section_credentials}>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {dict.credentials.education_pre}{" "}
              <a
                href={LINKS.BAYLOR}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground border-b border-border hover:border-foreground transition-colors pb-px"
              >
                {dict.credentials.school}
              </a>{" "}
              {dict.credentials.education_post}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              {dict.credentials.certs_intro}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {dict.credentials.certs.map((cert, index) => {
                const badgeMeta = AWS_CERT_BADGE_META[index];
                return (
                  <a
                    key={badgeMeta.href}
                    href={badgeMeta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2 rounded-md border border-border/60 bg-accent/30 px-3 py-3 sm:py-4 transition-colors hover:bg-accent hover:border-border"
                  >
                    <Image
                      src={badgeMeta.src}
                      alt={cert.name}
                      width={36}
                      height={40}
                      sizes="36px"
                      className="h-[40px] w-[36px] object-contain grayscale opacity-60 transition-[filter,opacity] duration-200 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                    <div className="flex flex-col items-center gap-0.5 text-center">
                      <span className="text-xs sm:text-sm text-text-secondary group-hover:text-foreground transition-colors font-medium">
                        {cert.name}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-text-tertiary group-hover:text-muted-foreground transition-colors">
                        {cert.level}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-text-decorative">
                        expires {cert.expires}
                      </span>
                    </div>
                  </a>
                );
              })}
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
