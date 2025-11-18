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
 * External links
 */
export const LINKS = {
  GITHUB: "https://github.com/HiMarioLopez",
  LINKEDIN: "https://www.linkedin.com/in/HiMarioLopez/",
  VERCEL: "https://vercel.com",
  VERCEL_CAREERS: "https://vercel.com/careers/platform-architect-5176710004",
  VERCEL_CUSTOMERS: "https://vercel.com/customers",
  MUSIC: "https://music.mariolopez.org",
  BLOG: "https://bolognese.mariolopez.org",
  CHAOS_RECIPE_ENHANCER:
    "https://github.com/ChaosRecipeEnhancer/ChaosRecipeEnhancer",
  EMAIL: "mailto:contact@mariolopez.org",
  RESUME_PDF: "docs/Resume.pdf",
  RESUME_DOCX: "docs/Resume.docx",
} as const;

/**
 * Resource hints configuration
 * Note: icon.svg is not preloaded as favicons are automatically fetched by the browser
 * and preloading them can cause warnings without performance benefit
 */
export const RESOURCE_HINTS = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
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
