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
    colors: {
      light: "#FA243C",
      dark: "#FF6B9D",
    },
  },
  SPOTIFY: {
    name: "Spotify",
    source: "spotify",
    colors: {
      light: "#1DB954",
      dark: "#1ED760",
    },
  },
} as const;

/**
 * Song link colors (agnostic of platform)
 */
export const SONG_LINK_COLORS = {
  light: "#3B82F6", // blue-500
  dark: "#60A5FA", // blue-400
} as const;

/**
 * Breakpoint values (matching Tailwind defaults)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;

/**
 * Hero component constants
 */
export const HERO_CONFIG = {
  MOBILE_HEIGHT: 250,
  DESKTOP_HEIGHT: 350,
  MOBILE_ASCII_FONT_SIZE: 7,
  DESKTOP_ASCII_FONT_SIZE: 9,
  MOBILE_TEXT_FONT_SIZE: 100,
  DESKTOP_TEXT_FONT_SIZE: 150,
  MOBILE_PLANE_BASE_HEIGHT: 18,
  DESKTOP_PLANE_BASE_HEIGHT: 25,
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
 * Animation and frame rate configuration
 */
export const ANIMATION_CONFIG = {
  FPS_60: 16, // ~60fps in milliseconds
  FPS_30: 33, // ~30fps in milliseconds
  FPS_60_SECONDS: 60,
  INTERACTION_TIMEOUT_MS: 1000, // Consider interacting if mouse moved in last second
} as const;

/**
 * Locale configuration
 */
export const LOCALE_CONFIG = {
  DEFAULT: "en-US",
} as const;

/**
 * Base URL for the site
 * Uses environment variable if available, otherwise falls back to default
 */
export const BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
  "https://mariolopez.org";

/**
 * External links
 */
export const LINKS = {
  GITHUB: "https://github.com/HiMarioLopez",
  LINKEDIN: "https://www.linkedin.com/in/HiMarioLopez/",
  TWITTER: "https://twitter.com/HiMarioLopez",
  VERCEL: "https://vercel.com",
  VERCEL_CAREERS: "https://vercel.com/careers/platform-architect-5176710004",
  VERCEL_CUSTOMERS: "https://vercel.com/customers",
  MUSIC: "https://music.mariolopez.org",
  BLOG: "https://bolognese.mariolopez.org",
  CHAOS_RECIPE_ENHANCER:
    "https://github.com/ChaosRecipeEnhancer/ChaosRecipeEnhancer",
  EMAIL: "mailto:contact@mariolopez.org",
  EMAIL_HUMAN:
    "mailto:i-am-a-human@mariolopez.org?subject=Hi%20Mario%20-%20I%20ran%20across%20your%20site%20and%20wanted%20to%20ask%20about...",
  EMAIL_MACHINE: "i-am-a-machine@mariolopez.org",
  RESUME_PDF: `${BASE_URL}/docs/Resume.pdf`,
  RESUME_DOCX: `${BASE_URL}/docs/Resume.docx`,
  SITE_SOURCE: `https://github.com/HiMarioLopez/mariolopez.org`,
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
