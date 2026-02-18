/**
 * Centralized configuration for the application
 * Single source of truth for all configurable values
 */

/**
 * API configuration
 */
export const API_CONFIG = {
  MUSIC_API_BASE_URL: "https://music.mariolopez.org/api/nodejs/v1",
  SPOTIFY_ENDPOINT: "/history/spotify",
  APPLE_MUSIC_ENDPOINT: "/history/music",
  DEFAULT_LIMIT: 1,
} as const;

/**
 * Cache and revalidation configuration
 */
export const CACHE_CONFIG = {
  REVALIDATE_SECONDS: 300,
  STALE_WHILE_REVALIDATE_SECONDS: 600,
  ERROR_CACHE_SECONDS: 10,
  ERROR_STALE_WHILE_REVALIDATE_SECONDS: 30,
  MINIMUM_CACHE_TTL: 60,
  RECENTLY_PLAYED_REVALIDATE_SECONDS: 60,
  RECENTLY_PLAYED_STALE_WHILE_REVALIDATE_SECONDS: 120,
} as const;

/**
 * Cache control headers
 */
export const CACHE_HEADERS = {
  SUCCESS: `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}, stale-while-revalidate=${CACHE_CONFIG.STALE_WHILE_REVALIDATE_SECONDS}`,
  RECENTLY_PLAYED_SUCCESS: `public, s-maxage=${CACHE_CONFIG.RECENTLY_PLAYED_REVALIDATE_SECONDS}, stale-while-revalidate=${CACHE_CONFIG.RECENTLY_PLAYED_STALE_WHILE_REVALIDATE_SECONDS}`,
  ERROR: `public, s-maxage=${CACHE_CONFIG.ERROR_CACHE_SECONDS}, stale-while-revalidate=${CACHE_CONFIG.ERROR_STALE_WHILE_REVALIDATE_SECONDS}`,
  CDN: `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}`,
  RECENTLY_PLAYED_CDN: `public, s-maxage=${CACHE_CONFIG.RECENTLY_PLAYED_REVALIDATE_SECONDS}`,
} as const;

/**
 * Visitor count API configuration
 */
export const VISITOR_COUNT_CONFIG = {
  REDIS_KEY_PREFIX: "visitor_count",
  REDIS_IP_KEY_PREFIX: "visitor_ip:",
  CACHE_TTL_SECONDS: 10,
  CACHE_STALE_WHILE_REVALIDATE_SECONDS: 30,
} as const;

/**
 * Visitor count cache headers
 */
export const VISITOR_COUNT_CACHE_HEADERS = {
  GET: `public, s-maxage=${VISITOR_COUNT_CONFIG.CACHE_TTL_SECONDS}, stale-while-revalidate=${VISITOR_COUNT_CONFIG.CACHE_STALE_WHILE_REVALIDATE_SECONDS}`,
  POST: "no-store",
} as const;
