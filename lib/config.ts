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
  REVALIDATE_SECONDS: 60,
  STALE_WHILE_REVALIDATE_SECONDS: 300,
  ERROR_CACHE_SECONDS: 10,
  ERROR_STALE_WHILE_REVALIDATE_SECONDS: 30,
  MINIMUM_CACHE_TTL: 60,
} as const;

/**
 * Cache control headers
 */
export const CACHE_HEADERS = {
  SUCCESS: `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}, stale-while-revalidate=${CACHE_CONFIG.STALE_WHILE_REVALIDATE_SECONDS}`,
  ERROR: `public, s-maxage=${CACHE_CONFIG.ERROR_CACHE_SECONDS}, stale-while-revalidate=${CACHE_CONFIG.ERROR_STALE_WHILE_REVALIDATE_SECONDS}`,
  CDN: `public, s-maxage=${CACHE_CONFIG.REVALIDATE_SECONDS}`,
} as const;

/**
 * Build configuration
 */
export const BUILD_CONFIG = {
  BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
} as const;
