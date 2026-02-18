/**
 * Track data extraction and processing utilities
 * Shared logic for parsing track information from various API formats
 */

import { PLATFORMS } from "./constants";
import type { Artist, ArtistObject, ArtworkColors, ExtractedTrackInfo, TrackData } from "./types";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Extracts track information from various API response formats
 * Handles multiple data structures from different music platforms
 *
 * @param trackData - Raw track data from API response
 * @returns Extracted and normalized track information
 */
export function extractTrackInfo(trackData: TrackData): ExtractedTrackInfo {
  let songName = "";
  let artistName = "";

  // Primary format: name and artistName
  if (trackData.name && trackData.artistName) {
    songName = trackData.name;
    artistName = trackData.artistName;
  }
  // Format: song and artist
  else if (trackData.song && trackData.artist) {
    songName = trackData.song;
    artistName = trackData.artist;
  }
  // Format: nested track object
  else if (trackData.track) {
    songName = trackData.track.name;
    artistName = trackData.track.artists?.map((a: Artist) => extractArtistName(a)).join(", ") || "";
  }
  // Format: name and artist
  else if (trackData.name && trackData.artist) {
    songName = trackData.name;
    artistName = trackData.artist;
  }
  // Format: title and artist
  else if (trackData.title && trackData.artist) {
    songName = trackData.title;
    artistName = trackData.artist;
  }
  // Format: name and artists array
  else if (trackData.name && trackData.artists) {
    songName = trackData.name;
    artistName = extractArtistsName(trackData.artists);
  }
  // Fallback: try to extract from any available fields
  else {
    songName = trackData.name || trackData.title || trackData.song || "";
    artistName =
      trackData.artistName ||
      trackData.artist ||
      (trackData.artists ? extractArtistsName(trackData.artists) : "") ||
      "";
  }

  const platform = extractPlatform(trackData.source || "");
  const songUrl = trackData.url || "";
  const timestamp = trackData.processedTimestamp || "";
  const durationMs = extractDurationMs(trackData);
  const artworkUrl = extractArtworkUrl(trackData);
  const artworkColors = extractArtworkColors(trackData);

  return {
    songName,
    artistName,
    platform,
    url: songUrl,
    timestamp,
    durationMs,
    artworkUrl,
    artworkColors,
  };
}

/**
 * Extracts track duration in milliseconds from multiple source formats.
 */
function extractDurationMs(trackData: TrackData): number | undefined {
  const candidates = [
    trackData.durationMs,
    trackData.durationInMillis,
    trackData.duration,
    trackData.track?.duration_ms,
    trackData.track?.durationMs,
    trackData.track?.durationInMillis,
  ];

  for (const candidate of candidates) {
    const parsed = typeof candidate === "string" ? Number.parseInt(candidate, 10) : candidate;

    if (typeof parsed === "number" && Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

/**
 * Extracts artwork URL from known response formats.
 */
function extractArtworkUrl(trackData: TrackData): string | undefined {
  const candidates = [trackData.artworkUrl, trackData.artwork?.url];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const normalized = candidate.trim();
      if (normalized.length > 0) {
        return normalized;
      }
    }
  }

  return undefined;
}

/**
 * Extracts and normalizes artwork color palettes from known response formats.
 */
function extractArtworkColors(trackData: TrackData): ArtworkColors | undefined {
  const fromArtworkColors = toArtworkColors(trackData.artworkColors);
  const fromColors = toArtworkColors(trackData.colors);
  const fromArtworkObject = toArtworkColors(trackData.artwork);
  const fromSingleFields: ArtworkColors = {
    backgroundColor: normalizeHexColor(trackData.backgroundColor),
    textColor1: normalizeHexColor(
      trackData.primaryColor ?? trackData.color ?? trackData.dominantColor,
    ),
    textColor2: normalizeHexColor(trackData.secondaryColor),
  };

  const merged: ArtworkColors = {
    backgroundColor:
      fromArtworkColors?.backgroundColor ??
      fromColors?.backgroundColor ??
      fromArtworkObject?.backgroundColor ??
      fromSingleFields.backgroundColor,
    textColor1:
      fromArtworkColors?.textColor1 ??
      fromColors?.textColor1 ??
      fromArtworkObject?.textColor1 ??
      fromSingleFields.textColor1,
    textColor2:
      fromArtworkColors?.textColor2 ??
      fromColors?.textColor2 ??
      fromArtworkObject?.textColor2 ??
      fromSingleFields.textColor2,
    textColor3:
      fromArtworkColors?.textColor3 ?? fromColors?.textColor3 ?? fromArtworkObject?.textColor3,
    textColor4:
      fromArtworkColors?.textColor4 ?? fromColors?.textColor4 ?? fromArtworkObject?.textColor4,
  };

  return hasAnyArtworkColor(merged) ? merged : undefined;
}

/**
 * Coerces arbitrary color maps into the normalized artwork color shape.
 */
function toArtworkColors(value: unknown): ArtworkColors | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const artworkColors: ArtworkColors = {
    backgroundColor: normalizeHexColor(source.backgroundColor ?? source.bgColor),
    textColor1: normalizeHexColor(source.textColor1 ?? source.primaryColor ?? source.primary),
    textColor2: normalizeHexColor(source.textColor2 ?? source.secondaryColor ?? source.secondary),
    textColor3: normalizeHexColor(source.textColor3 ?? source.tertiaryColor ?? source.tertiary),
    textColor4: normalizeHexColor(
      source.textColor4 ?? source.detailColor ?? source.quaternaryColor,
    ),
  };

  return hasAnyArtworkColor(artworkColors) ? artworkColors : undefined;
}

function hasAnyArtworkColor(artworkColors: ArtworkColors): boolean {
  return Boolean(
    artworkColors.backgroundColor ||
      artworkColors.textColor1 ||
      artworkColors.textColor2 ||
      artworkColors.textColor3 ||
      artworkColors.textColor4,
  );
}

function normalizeHexColor(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const candidate = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!HEX_COLOR_PATTERN.test(candidate)) {
    return undefined;
  }

  return candidate.toLowerCase();
}

/**
 * Extracts artist name from various formats
 *
 * @param artist - Artist data (string or object)
 * @returns Artist name as string
 */
function extractArtistName(artist: Artist): string {
  if (typeof artist === "string") {
    return artist;
  }
  return artist?.name || "";
}

/**
 * Extracts artists name from array or single value
 *
 * @param artists - Artists data (string, array, or single object)
 * @returns Comma-separated artist names
 */
function extractArtistsName(artists: string | Artist[] | ArtistObject[]): string {
  if (typeof artists === "string") {
    return artists;
  }
  if (Array.isArray(artists)) {
    return artists.map((a) => extractArtistName(a)).join(", ");
  }
  return "";
}

/**
 * Extracts and formats platform name from source string
 *
 * @param source - Platform source identifier
 * @returns Formatted platform name
 */
function extractPlatform(source: string): string {
  const sourceLower = source.toLowerCase();

  if (sourceLower === PLATFORMS.APPLE_MUSIC.source) {
    return PLATFORMS.APPLE_MUSIC.name;
  }
  if (sourceLower === PLATFORMS.SPOTIFY.source) {
    return PLATFORMS.SPOTIFY.name;
  }
  if (source) {
    // Capitalize first letter if it's a known platform
    return source.charAt(0).toUpperCase() + source.slice(1);
  }
  // Default to Apple Music if no platform is specified
  return PLATFORMS.APPLE_MUSIC.name;
}

/**
 * Normalizes API response data structure
 * Handles different response formats (items array, data array, direct object, etc.)
 *
 * @param data - Raw API response data
 * @returns Normalized track data or null
 */
export function normalizeTrackData(data: unknown): TrackData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const dataObj = data as Record<string, unknown>;

  // Format: { items: [...] }
  if (dataObj.items && Array.isArray(dataObj.items) && dataObj.items.length > 0) {
    return dataObj.items[0] as TrackData;
  }
  // Format: { data: [...] }
  if (dataObj.data && Array.isArray(dataObj.data) && dataObj.data.length > 0) {
    return dataObj.data[0] as TrackData;
  }
  // Format: direct array
  if (Array.isArray(data) && data.length > 0) {
    return data[0] as TrackData;
  }
  // Format: direct object
  return dataObj as TrackData;
}
