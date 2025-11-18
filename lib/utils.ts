import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TIME_CONSTANTS, PLATFORMS } from "./constants";

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
    return "just now";
  }

  const diffInMinutes = Math.floor(
    diffInSeconds / TIME_CONSTANTS.SECONDS_PER_MINUTE
  );
  if (diffInMinutes < TIME_CONSTANTS.MINUTES_PER_HOUR) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(
    diffInMinutes / TIME_CONSTANTS.MINUTES_PER_HOUR
  );
  if (diffInHours < TIME_CONSTANTS.HOURS_PER_DAY) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / TIME_CONSTANTS.HOURS_PER_DAY);
  if (diffInDays < TIME_CONSTANTS.DAYS_PER_WEEK) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / TIME_CONSTANTS.DAYS_PER_WEEK);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / TIME_CONSTANTS.DAYS_PER_MONTH);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / TIME_CONSTANTS.DAYS_PER_YEAR);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}

/**
 * Gets platform-specific CSS classes for styling
 *
 * @param platform - Platform name (e.g., "Apple Music", "Spotify")
 * @returns CSS class string with platform colors
 */
export function getPlatformColor(platform: string): string {
  const platformLower = platform.toLowerCase();

  if (platformLower.includes(PLATFORMS.APPLE_MUSIC.source)) {
    // Apple Music colors: Pink/Red
    return "text-[#FA243C] dark:text-[#FF6B9D] underline decoration-dotted decoration-[#FA243C] dark:decoration-[#FF6B9D] hover:text-[#FA243C]/80 dark:hover:text-[#FF6B9D]/80 hover:decoration-[#FA243C]/80 dark:hover:decoration-[#FF6B9D]/80 transition-colors underline-offset-4";
  } else if (platformLower.includes(PLATFORMS.SPOTIFY.source)) {
    // Spotify colors: Green
    return "text-[#1DB954] dark:text-[#1ED760] underline decoration-dotted decoration-[#1DB954] dark:decoration-[#1ED760] hover:text-[#1DB954]/80 dark:hover:text-[#1ED760]/80 hover:decoration-[#1DB954]/80 dark:hover:decoration-[#1ED760]/80 transition-colors underline-offset-4";
  }
  // Default: Apple Music colors
  return "text-[#FA243C] dark:text-[#FF6B9D] underline decoration-dotted decoration-[#FA243C] dark:decoration-[#FF6B9D] hover:text-[#FA243C]/80 dark:hover:text-[#FF6B9D]/80 hover:decoration-[#FA243C]/80 dark:hover:decoration-[#FF6B9D]/80 transition-colors underline-offset-4";
}
