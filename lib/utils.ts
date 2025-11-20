import {
  TIME_CONSTANTS,
  TIME_FORMAT_LABELS,
  TIME_THRESHOLDS,
} from "./constants";

// Define a type that matches the structure of TIME_FORMAT_LABELS
// but ensures all properties are strings, which they are in the const
type TimeFormatLabels = {
  JUST_NOW: string;
  MINUTE: string;
  MINUTES: string;
  HOUR: string;
  HOURS: string;
  DAY: string;
  DAYS: string;
  WEEK: string;
  WEEKS: string;
  MONTH: string;
  MONTHS: string;
  YEAR: string;
  YEARS: string;
  AGO: string;
};

const TIME_FORMAT_LABELS_ES: TimeFormatLabels = {
  JUST_NOW: "justo ahora",
  MINUTE: "minuto",
  MINUTES: "minutos",
  HOUR: "hora",
  HOURS: "horas",
  DAY: "día",
  DAYS: "días",
  WEEK: "semana",
  WEEKS: "semanas",
  MONTH: "mes",
  MONTHS: "meses",
  YEAR: "año",
  YEARS: "años",
  AGO: "hace",
};

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Gets the platform color from the constants
 * Safe to use in both themes
 */
export function getPlatformColor(platform: string): string | null {
  const normalizedPlatform = platform.toLowerCase();

  if (normalizedPlatform.includes("spotify")) {
    return "#1DB954"; // Spotify green
  }

  if (normalizedPlatform.includes("apple")) {
    return "#FA243C"; // Apple Music red
  }

  return null;
}

/**
 * Formats a timestamp into a "time ago" string (e.g., "5 minutes ago", "2 hours ago")
 * Handles various time units from seconds to years
 *
 * @param timestamp - ISO timestamp string
 * @param locale - Language code ("en-US" or "es-MX")
 * @returns Formatted string
 */
export function formatTimeAgo(timestamp: string, locale: string = "en-US"): string {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Future dates or very recent
  if (seconds < 0) return TIME_FORMAT_LABELS.JUST_NOW;
  if (seconds < TIME_CONSTANTS.SECONDS_PER_MINUTE)
    return TIME_FORMAT_LABELS.JUST_NOW;

  const labels: TimeFormatLabels = locale === "es-MX" ? TIME_FORMAT_LABELS_ES : TIME_FORMAT_LABELS;
  const minutes = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_MINUTE);
  
  if (minutes < TIME_CONSTANTS.MINUTES_PER_HOUR) {
    const unit =
      minutes === 1 ? labels.MINUTE : labels.MINUTES;
    return locale === "es-MX" 
      ? `${labels.AGO} ${minutes} ${unit}`
      : `${minutes} ${unit} ${labels.AGO}`;
  }

  const hours = Math.floor(minutes / TIME_CONSTANTS.MINUTES_PER_HOUR);
  if (hours < TIME_CONSTANTS.HOURS_PER_DAY) {
    const unit = hours === 1 ? labels.HOUR : labels.HOURS;
    return locale === "es-MX" 
      ? `${labels.AGO} ${hours} ${unit}`
      : `${hours} ${unit} ${labels.AGO}`;
  }

  const days = Math.floor(hours / TIME_CONSTANTS.HOURS_PER_DAY);
  if (days < TIME_CONSTANTS.DAYS_PER_WEEK) {
    const unit = days === 1 ? labels.DAY : labels.DAYS;
    return locale === "es-MX" 
      ? `${labels.AGO} ${days} ${unit}`
      : `${days} ${unit} ${labels.AGO}`;
  }

  const weeks = Math.floor(days / TIME_CONSTANTS.DAYS_PER_WEEK);
  if (weeks < TIME_THRESHOLDS.WEEKS_TO_MONTHS) {
    const unit = weeks === 1 ? labels.WEEK : labels.WEEKS;
    return locale === "es-MX" 
      ? `${labels.AGO} ${weeks} ${unit}`
      : `${weeks} ${unit} ${labels.AGO}`;
  }

  const months = Math.floor(days / TIME_CONSTANTS.DAYS_PER_MONTH);
  if (months < TIME_THRESHOLDS.MONTHS_TO_YEARS) {
    const unit =
      months === 1 ? labels.MONTH : labels.MONTHS;
    return locale === "es-MX" 
      ? `${labels.AGO} ${months} ${unit}`
      : `${months} ${unit} ${labels.AGO}`;
  }

  const years = Math.floor(days / TIME_CONSTANTS.DAYS_PER_YEAR);
  const unit = years === 1 ? labels.YEAR : labels.YEARS;
  return locale === "es-MX" 
    ? `${labels.AGO} ${years} ${unit}`
    : `${years} ${unit} ${labels.AGO}`;
}
