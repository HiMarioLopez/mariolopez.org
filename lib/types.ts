/**
 * Shared TypeScript types and interfaces for the application
 */

/**
 * Artwork color metadata returned by music providers
 */
export interface ArtworkColors {
  backgroundColor?: string;
  textColor1?: string;
  textColor2?: string;
  textColor3?: string;
  textColor4?: string;
}

/**
 * Recently played track information
 */
export interface RecentlyPlayed {
  song: string;
  artist: string;
  platform: string;
  url: string;
  timestamp: string;
  durationMs?: number;
  artworkUrl?: string;
  artworkColors?: ArtworkColors;
}

/**
 * Raw track data from API responses (various formats)
 */
export interface TrackData {
  name?: string;
  artistName?: string;
  song?: string;
  artist?: string;
  title?: string;
  artists?: string | Artist[] | ArtistObject[];
  durationMs?: number | string;
  durationInMillis?: number | string;
  duration?: number | string;
  track?: TrackObject;
  source?: string;
  url?: string;
  processedTimestamp?: string;
  artworkUrl?: string;
  artwork?: {
    url?: string;
    [key: string]: unknown;
  };
  artworkColors?: ArtworkColors | Record<string, unknown>;
  colors?: Record<string, unknown>;
  color?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  dominantColor?: string;
}

/**
 * Artist object structure
 */
export interface ArtistObject {
  name: string;
  [key: string]: unknown;
}

/**
 * Artist can be a string or object
 */
export type Artist = string | ArtistObject;

/**
 * Track object structure
 */
export interface TrackObject {
  name: string;
  artists?: Artist[];
  duration_ms?: number;
  durationMs?: number;
  durationInMillis?: number;
  [key: string]: unknown;
}

/**
 * Extracted track information
 */
export interface ExtractedTrackInfo {
  songName: string;
  artistName: string;
  platform: string;
  url: string;
  timestamp: string;
  durationMs?: number;
  artworkUrl?: string;
  artworkColors?: ArtworkColors;
}

/**
 * Web Vitals metric
 */
export interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating?: "good" | "needs-improvement" | "poor";
}

/**
 * Performance entry types
 * Note: These extend the browser's PerformanceEntry type
 */

/**
 * Layout shift entry
 */
export interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

/**
 * Largest contentful paint entry
 */
export interface LCPEntry extends PerformanceEntry {
  renderTime?: number;
  loadTime?: number;
  id?: string;
}

/**
 * First input entry
 */
export interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}
