import { LINKS } from "@/lib/constants";
import type { RecentlyPlayed } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";

const POE_LABEL = "Path of Exile";

export const SUPPORTED_LOCALES = ["en-US", "es-MX"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

interface ResumeItem {
  title: string;
  date: string;
  description: string;
}

interface MachineDict {
  header: string;
  about_section: string;
  resume_section: {
    intro: string;
    experience_title: string;
    jobs: ResumeItem[];
    leadership_title: string;
    leadership: ResumeItem[];
    education_title: string;
    education: string;
  };
  contact_section: {
    text: string;
    email_label: string;
  };
  socials_labels: {
    github: string;
    linkedin: string;
    twitter: string;
    resume_pdf: string;
    resume_docx: string;
  };
  projects_labels: {
    chaos_recipe_enhancer: string;
    now_playing: string;
    blog: string;
    create_mlpz_lambda: string;
    vercel_bulk_waf_rules: string;
    backpocket: string;
    cordstruck: string;
    guesschella: string;
    building_status: string;
  };
  footer_label: string;
  recently_played_template: string;
}

interface MarkdownLabels {
  about: string;
  recentlyPlayed: string;
  recentlyPlayedUnavailable: string;
  recentlyPlayedFallback: string;
  resume: string;
  contact: string;
  socials: string;
  projects: string;
  source: string;
}

const MARKDOWN_LABELS: Record<SupportedLocale, MarkdownLabels> = {
  "en-US": {
    about: "About",
    recentlyPlayed: "Recently played",
    recentlyPlayedUnavailable: "No recent listening activity is available right now.",
    recentlyPlayedFallback:
      'My most recently played song on %platform% is "%song%" by %artist% (played %timeAgo%).\n\nListen: %url%',
    resume: "Resume",
    contact: "Contact",
    socials: "Socials",
    projects: "Projects",
    source: "Source",
  },
  "es-MX": {
    about: "Acerca de",
    recentlyPlayed: "Reproducido recientemente",
    recentlyPlayedUnavailable: "No hay actividad de musica reciente disponible en este momento.",
    recentlyPlayedFallback:
      'Mi cancion reproducida mas recientemente en %platform% es "%song%" de %artist% (reproducida %timeAgo%).\n\nEscuchar: %url%',
    resume: "Curriculum",
    contact: "Contacto",
    socials: "Redes",
    projects: "Proyectos",
    source: "Codigo fuente",
  },
};

function frontmatterEscape(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function replaceAboutPlaceholders(rawAboutSection: string, lang: SupportedLocale): string {
  const aboutLinks =
    lang === "es-MX"
      ? [
          `[rol de arquitecto de plataforma](${LINKS.VERCEL_CAREERS})`,
          `[Vercel](${LINKS.VERCEL})`,
          `[clientes de Vercel](${LINKS.VERCEL_CUSTOMERS})`,
          `[vacantes abiertas](${LINKS.VERCEL_FIELD_ENGINEERING})`,
        ]
      : [
          `[platform architect role](${LINKS.VERCEL_CAREERS})`,
          `[Vercel](${LINKS.VERCEL})`,
          `[Vercel customers](${LINKS.VERCEL_CUSTOMERS})`,
          `[open roles](${LINKS.VERCEL_FIELD_ENGINEERING})`,
        ];

  let output = rawAboutSection;

  for (const link of aboutLinks) {
    output = output.replace("%s", link);
  }

  return output;
}

function formatRecentlyPlayedSection(
  template: string,
  recentlyPlayed: RecentlyPlayed | null,
  lang: SupportedLocale,
): string {
  const labels = MARKDOWN_LABELS[lang];

  if (!recentlyPlayed?.timestamp) {
    return labels.recentlyPlayedUnavailable;
  }

  const timeAgo = formatTimeAgo(recentlyPlayed.timestamp, lang);
  if (!timeAgo) {
    return labels.recentlyPlayedUnavailable;
  }

  const resolvedTemplate = template || labels.recentlyPlayedFallback;
  return resolvedTemplate
    .replace("%platform%", recentlyPlayed.platform)
    .replace("%song%", recentlyPlayed.song)
    .replace("%artist%", recentlyPlayed.artist)
    .replace("%timeAgo%", timeAgo)
    .replace("%url%", recentlyPlayed.url)
    .trim();
}

function formatResumeItems(items: ResumeItem[]): string {
  return items
    .map((item) => `#### ${item.title}\n${item.date}\n\n${item.description}`)
    .join("\n\n");
}

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

interface GenerateAgentMarkdownOptions {
  lang: SupportedLocale;
  machine: MachineDict;
  recentlyPlayed: RecentlyPlayed | null;
  canonicalUrl: string;
  generatedAt: string;
}

export function generateAgentMarkdown({
  lang,
  machine,
  recentlyPlayed,
  canonicalUrl,
  generatedAt,
}: GenerateAgentMarkdownOptions): string {
  const labels = MARKDOWN_LABELS[lang];
  const about = replaceAboutPlaceholders(machine.about_section, lang);
  const recentlyPlayedSection = formatRecentlyPlayedSection(
    machine.recently_played_template,
    recentlyPlayed,
    lang,
  );
  const jobs = formatResumeItems(machine.resume_section.jobs);
  const leadership = formatResumeItems(machine.resume_section.leadership);

  return `---
url: ${canonicalUrl}
title: "${frontmatterEscape(machine.header)}"
date: ${generatedAt}
lang: ${lang}
---

# ${machine.header}

## ${labels.about}
${about}

## ${labels.recentlyPlayed}
${recentlyPlayedSection}

## ${labels.resume}
${machine.resume_section.intro}

### ${machine.resume_section.experience_title}
${jobs}

### ${machine.resume_section.leadership_title}
${leadership}

### ${machine.resume_section.education_title}
${machine.resume_section.education}

## ${labels.contact}
${machine.contact_section.text}

- ${machine.contact_section.email_label} [${LINKS.EMAIL_MACHINE}](mailto:${LINKS.EMAIL_MACHINE})

## ${labels.socials}
- ${machine.socials_labels.github} ${LINKS.GITHUB}
- ${machine.socials_labels.linkedin} ${LINKS.LINKEDIN}
- ${machine.socials_labels.twitter} ${LINKS.TWITTER}
- ${machine.socials_labels.resume_pdf} ${LINKS.RESUME_PDF}
- ${machine.socials_labels.resume_docx} ${LINKS.RESUME_DOCX}

## ${labels.projects}
- ${machine.projects_labels.chaos_recipe_enhancer} ${LINKS.CHAOS_RECIPE_ENHANCER} (${POE_LABEL}: ${LINKS.PATH_OF_EXILE})
- ${machine.projects_labels.now_playing} ${LINKS.MUSIC}
- ${machine.projects_labels.blog} ${LINKS.BLOG}
- ${machine.projects_labels.create_mlpz_lambda} ${LINKS.CREATE_MLPZ_LAMBDA}
- ${machine.projects_labels.vercel_bulk_waf_rules} ${LINKS.VERCEL_BULK_WAF_RULES}
- ${machine.projects_labels.backpocket} ${machine.projects_labels.building_status}
- ${machine.projects_labels.cordstruck} ${machine.projects_labels.building_status}
- ${machine.projects_labels.guesschella} ${machine.projects_labels.building_status}

## ${labels.source}
- ${machine.footer_label} ${LINKS.SITE_SOURCE}
`;
}

interface GenerateAgentSitemapMarkdownOptions {
  lang: SupportedLocale;
  baseUrl: string;
  generatedAt: string;
}

export function generateAgentSitemapMarkdown({
  lang,
  baseUrl,
  generatedAt,
}: GenerateAgentSitemapMarkdownOptions): string {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const htmlUrl = `${normalizedBaseUrl}/${lang}`;
  const markdownUrl = `${normalizedBaseUrl}/${lang}.md`;
  const machineHtmlUrl = `${normalizedBaseUrl}/${lang}/machine`;
  const sitemapUrl = `${normalizedBaseUrl}/${lang}/sitemap.md`;

  return `---
url: ${sitemapUrl}
title: "mariolopez.org agent sitemap (${lang})"
date: ${generatedAt}
lang: ${lang}
---

# mariolopez.org agent sitemap (${lang})

Generated: ${generatedAt}

## Resources
- profile_html: ${htmlUrl}
- profile_markdown: ${markdownUrl}
- machine_html: ${machineHtmlUrl}
- sitemap_markdown: ${sitemapUrl}
`;
}
