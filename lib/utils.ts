import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  TIME_CONSTANTS,
  TIME_FORMAT_LABELS,
  TIME_THRESHOLDS,
  PLATFORMS,
} from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a timestamp as a human-readable "time ago" string
 *
 * @param timestamp - ISO timestamp string
 * @returns Formatted time ago string (e.g., "5 minutes ago", "2 hours ago")
 */
export function formatTimeAgo(timestamp: string): string {
  if (!timestamp) return "";

  const now = new Date();
  const playedAt = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - playedAt.getTime()) / 1000);

  if (diffInSeconds < TIME_CONSTANTS.SECONDS_PER_MINUTE) {
    return TIME_FORMAT_LABELS.JUST_NOW;
  }

  const diffInMinutes = Math.floor(
    diffInSeconds / TIME_CONSTANTS.SECONDS_PER_MINUTE
  );
  if (diffInMinutes < TIME_CONSTANTS.MINUTES_PER_HOUR) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? TIME_FORMAT_LABELS.MINUTE : TIME_FORMAT_LABELS.MINUTES} ${TIME_FORMAT_LABELS.AGO}`;
  }

  const diffInHours = Math.floor(
    diffInMinutes / TIME_CONSTANTS.MINUTES_PER_HOUR
  );
  if (diffInHours < TIME_CONSTANTS.HOURS_PER_DAY) {
    return `${diffInHours} ${diffInHours === 1 ? TIME_FORMAT_LABELS.HOUR : TIME_FORMAT_LABELS.HOURS} ${TIME_FORMAT_LABELS.AGO}`;
  }

  const diffInDays = Math.floor(diffInHours / TIME_CONSTANTS.HOURS_PER_DAY);
  if (diffInDays < TIME_CONSTANTS.DAYS_PER_WEEK) {
    return `${diffInDays} ${diffInDays === 1 ? TIME_FORMAT_LABELS.DAY : TIME_FORMAT_LABELS.DAYS} ${TIME_FORMAT_LABELS.AGO}`;
  }

  const diffInWeeks = Math.floor(diffInDays / TIME_CONSTANTS.DAYS_PER_WEEK);
  if (diffInWeeks < TIME_THRESHOLDS.WEEKS_TO_MONTHS) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? TIME_FORMAT_LABELS.WEEK : TIME_FORMAT_LABELS.WEEKS} ${TIME_FORMAT_LABELS.AGO}`;
  }

  const diffInMonths = Math.floor(diffInDays / TIME_CONSTANTS.DAYS_PER_MONTH);
  if (diffInMonths < TIME_THRESHOLDS.MONTHS_TO_YEARS) {
    return `${diffInMonths} ${diffInMonths === 1 ? TIME_FORMAT_LABELS.MONTH : TIME_FORMAT_LABELS.MONTHS} ${TIME_FORMAT_LABELS.AGO}`;
  }

  const diffInYears = Math.floor(diffInDays / TIME_CONSTANTS.DAYS_PER_YEAR);
  return `${diffInYears} ${diffInYears === 1 ? TIME_FORMAT_LABELS.YEAR : TIME_FORMAT_LABELS.YEARS} ${TIME_FORMAT_LABELS.AGO}`;
}

/**
 * Gets platform-specific CSS classes for styling
 *
 * @param platform - Platform name (e.g., "Apple Music", "Spotify")
 * @returns CSS class string with platform colors
 */
export function getPlatformColor(platform: string): string {
  const platformLower = platform.toLowerCase();
  const colors = platformLower.includes(PLATFORMS.SPOTIFY.source)
    ? PLATFORMS.SPOTIFY.colors
    : PLATFORMS.APPLE_MUSIC.colors; // Default to Apple Music

  return `text-[${colors.light}] dark:text-[${colors.dark}] underline decoration-dotted decoration-[${colors.light}] dark:decoration-[${colors.dark}] hover:text-[${colors.light}]/80 dark:hover:text-[${colors.dark}]/80 hover:decoration-[${colors.light}]/80 dark:hover:decoration-[${colors.dark}]/80 transition-colors underline-offset-4`;
}
