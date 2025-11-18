/**
 * Shared TypeScript types and interfaces for the application
 */

/**
 * Recently played track information
 */
export interface RecentlyPlayed {
  song: string;
  artist: string;
  platform: string;
  url: string;
  timestamp: string;
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
  track?: TrackObject;
  source?: string;
  url?: string;
  processedTimestamp?: string;
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
