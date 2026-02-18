/**
 * Application constants
 * UI, platform, and other constant values
 */

/**
 * Platform configurations
 */
export const PLATFORMS = {
  APPLE_MUSIC: {
    name: "Apple Music",
    source: "apple",
    color: "#FA243C", // Single color that works in both themes
  },
  SPOTIFY: {
    name: "Spotify",
    source: "spotify",
    color: "#1DB954", // Single color that works in both themes
  },
} as const;

/**
 * Time formatting constants
 */
export const TIME_CONSTANTS = {
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30,
  DAYS_PER_YEAR: 365,
} as const;

/**
 * Time format labels for human-readable strings
 */
export const TIME_FORMAT_LABELS = {
  JUST_NOW: "just now",
  MINUTE: "minute",
  MINUTES: "minutes",
  HOUR: "hour",
  HOURS: "hours",
  DAY: "day",
  DAYS: "days",
  WEEK: "week",
  WEEKS: "weeks",
  MONTH: "month",
  MONTHS: "months",
  YEAR: "year",
  YEARS: "years",
  AGO: "ago",
} as const;

/**
 * Time thresholds for formatting
 */
export const TIME_THRESHOLDS = {
  WEEKS_TO_MONTHS: 4,
  MONTHS_TO_YEARS: 12,
} as const;

/**
 * React Query configuration
 */
export const QUERY_CONFIG = {
  GC_TIME_MINUTES: 5,
  GC_TIME_MS: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

/**
 * Now playing heuristic and UI update configuration
 */
export const NOW_PLAYING_CONFIG = {
  /**
   * Consider tracks in this freshness window as potentially active.
   * Helps smooth over API/cache propagation delays.
   */
  RECENT_PLAY_WINDOW_MS: 5 * 60 * 1000,
  /**
   * Extra grace period beyond known duration to account for ingestion lag.
   */
  INGESTION_BUFFER_MS: 2 * 60 * 1000,
  /**
   * Tolerance for minor client/server clock skew.
   */
  FUTURE_TIMESTAMP_TOLERANCE_MS: 45 * 1000,
  /**
   * Client-side cadence for progress indicator updates.
   */
  UPDATE_INTERVAL_MS: 1000,
} as const;

/**
 * Base URL for the site
 * Uses environment variable if available, otherwise falls back to default
 */
export const BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) || "https://mariolopez.org";

/**
 * External links
 */
export const LINKS = {
  GITHUB: "https://github.com/HiMarioLopez",
  LINKEDIN: "https://www.linkedin.com/in/HiMarioLopez/",
  TWITTER: "https://twitter.com/HiMarioLopez",
  VERCEL: "https://vercel.com/home",
  VERCEL_CAREERS:
    "https://www.perplexity.ai/search/what-is-a-platform-architect-Mf8B8rGgTZKkmxPXzqxZ1Q#0",
  VERCEL_FIELD_ENGINEERING: "https://vercel.com/careers?function=Field+Engineering",
  VERCEL_CUSTOMERS: "https://vercel.com/customers",
  MUSIC: "https://music.mariolopez.org",
  MUSIC_REPO_OUTLINE:
    "https://github.com/HiMarioLopez/music.mariolopez.org?tab=readme-ov-file#outline",
  POCKET: "https://getpocket.com/home",
  BLOG: "https://bolognese.mariolopez.org",
  CREATE_MLPZ_LAMBDA: "https://npmx.dev/package/create-mlpz-lambda",
  VERCEL_BULK_WAF_RULES: "https://github.com/HiMarioLopez/vercel-bulk-waf-rules",
  CHAOS_RECIPE_ENHANCER: "https://github.com/ChaosRecipeEnhancer/ChaosRecipeEnhancer",
  PATH_OF_EXILE: "https://www.pathofexile.com/",
  BACKPOCKET: "https://backpocket.my",
  BACKPOCKET_SPACE: "https://backpocket.mariolopez.org",
  CHATGPT: "https://chatgpt.com",
  GEMINI: "https://gemini.google.com/app",
  CLAUDE: "https://claude.ai/new",
  GROK: "https://grok.com",
  EMAIL: "mailto:contact@mariolopez.org",
  EMAIL_HUMAN:
    "mailto:i-am-a-human@mariolopez.org?subject=Hi%20Mario%20-%20I%20ran%20across%20your%20site%20and%20wanted%20to%20ask%20about...",
  EMAIL_MACHINE: "i-am-a-machine@mariolopez.org",
  RESUME_PDF: `${BASE_URL}/docs/Resume.pdf`,
  RESUME_DOCX: `${BASE_URL}/docs/Resume.docx`,
  SITE_SOURCE: `https://github.com/HiMarioLopez/mariolopez.org`,
} as const;

/**
 * Project logo assets
 */
export const PROJECT_LOGOS = {
  CHAOS_RECIPE_ENHANCER: "/images/CRELogo.webp",
  BACKPOCKET: "/images/BackpocketLogo.webp",
  CORDSTRUCK: "/images/CordstruckLogo.webp",
  GUESSCHELLA: "/images/GuesschellaLogo.webp",
} as const;

/**
 * LLM provider logo assets
 */
export const LLM_PROVIDER_LOGOS = {
  CHATGPT: "/images/ChatGPTLogo.svg",
  GEMINI: "/images/GeminiLogo.svg",
  CLAUDE: "/images/ClaudeLogo.svg",
  GROK: "/images/GrokLogo.svg",
} as const;

/**
 * LLM provider URL behavior
 */
export const LLM_PROVIDER_LINKS = {
  CHATGPT_PROMPT_PARAM: "prompt",
  /**
   * Keep ChatGPT prefill URLs below conservative browser/app limits.
   * If exceeded, UI falls back to base URL and uses clipboard copy only.
   */
  CHATGPT_PROMPT_MAX_URL_LENGTH: 8_000,
} as const;

/**
 * Resource hints configuration
 */
export const RESOURCE_HINTS = [
  { rel: "preconnect", href: "https://music.mariolopez.org" },
  { rel: "dns-prefetch", href: "https://vercel.com" },
  { rel: "dns-prefetch", href: "https://github.com" },
  { rel: "dns-prefetch", href: "https://www.linkedin.com" },
] as const;

/**
 * Performance monitoring thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  SLOW_RESOURCE_MS: 1000,
} as const;

/**
 * Availability status configuration
 * Based on Central US time (America/Chicago)
 */
export const AVAILABILITY_CONFIG = {
  TIMEZONE: "America/Chicago",
  WORK_START_HOUR: 8,
  WORK_END_HOUR: 17,
  SLEEP_START_HOUR: 23,
  SLEEP_END_HOUR: 8,
  UPDATE_INTERVAL_MS: 60_000,
} as const;

export type AvailabilityStatus = "cranking" | "away" | "offline";

export const AVAILABILITY_STATUSES = ["cranking", "away", "offline"] as const;

export const AVAILABILITY_DISPLAY = {
  cranking: {
    label: { "en-US": "Cranking", "es-MX": "A tope" },
    jsdoc: { "en-US": "Cranking", "es-MX": "A tope" },
    desc: { "en-US": "Mon–Fri · 8 am – 5 pm CT", "es-MX": "Lun–Vie · 8 am – 5 pm CT" },
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700 dark:text-emerald-400",
    pulse: true,
  },
  away: {
    label: { "en-US": "Away", "es-MX": "Ausente" },
    jsdoc: { "en-US": "Away", "es-MX": "Ausente" },
    desc: { "en-US": "After 5 pm & weekends", "es-MX": "Despues de 5 pm y fines de semana" },
    dotClass: "bg-amber-400",
    textClass: "text-amber-700 dark:text-amber-400",
    pulse: false,
  },
  offline: {
    label: { "en-US": "Offline", "es-MX": "Desconectado" },
    jsdoc: { "en-US": "Offline", "es-MX": "Desconectado" },
    desc: { "en-US": "Late night · 11 pm – 8 am CT", "es-MX": "Noche · 11 pm – 8 am CT" },
    dotClass: "bg-text-decorative",
    textClass: "text-text-tertiary",
    pulse: false,
  },
} as const;

/**
 * Visitor counter configuration
 */
export const VISITOR_COUNTER_CONFIG = {
  DIGIT_COUNT: 6,
  PADDING_CHAR: "0",
  DEFAULT_DISPLAY: "000000",
  LABEL: "# of hits",
  IP_DEDUPLICATION_TTL_SECONDS: 30,
  /** Stable position keys for digit displays (avoids array index as React key) */
  DIGIT_POSITIONS: ["pos-0", "pos-1", "pos-2", "pos-3", "pos-4", "pos-5"] as const,
} as const;

/**
 * Stable ids for status bar controls.
 * These avoid hydration drift when React/Radix generated ids diverge.
 */
export const STATUS_BAR_IDS = {
  AVAILABILITY_POPOVER: "status-bar-availability-popover",
  THEME_TRIGGER: "status-bar-theme-trigger",
  THEME_MENU: "status-bar-theme-menu",
  LANGUAGE_TRIGGER: "status-bar-language-trigger",
  LANGUAGE_MENU: "status-bar-language-menu",
} as const;
