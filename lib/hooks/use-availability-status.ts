"use client";

import { useEffect, useState } from "react";
import { AVAILABILITY_CONFIG, STATUS_OVERRIDE, type AvailabilityStatus } from "@/lib/constants";

/**
 * Checks if a temporary status override is currently active.
 * Compares against the end date which is specified in Central Time.
 */
function isOverrideActive(centralTime: Date): boolean {
  if (!STATUS_OVERRIDE) return false;
  // Compare year, month, day in Central Time
  const endDate = STATUS_OVERRIDE.endDate;
  const centralYear = centralTime.getFullYear();
  const centralMonth = centralTime.getMonth();
  const centralDay = centralTime.getDate();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  const endDay = endDate.getDate();
  
  // Override is active if we haven't reached the end date yet
  if (centralYear < endYear) return true;
  if (centralYear > endYear) return false;
  if (centralMonth < endMonth) return true;
  if (centralMonth > endMonth) return false;
  return centralDay <= endDay;
}

/**
 * Computes the current availability status based on Central US time.
 *
 * - "flowing":  Special override status (when configured and during waking hours)
 * - "cranking": Mon–Fri, 8 AM – 5 PM CT (when not overridden)
 * - "away":     Waking hours outside work (any day, 8 AM – 11 PM CT when not working)
 * - "offline":  Late night / early morning (11 PM – 8 AM CT)
 */
function getAvailabilityStatus(): AvailabilityStatus {
  const now = new Date();
  const centralTime = new Date(
    now.toLocaleString("en-US", { timeZone: AVAILABILITY_CONFIG.TIMEZONE }),
  );
  const hour = centralTime.getHours();
  const day = centralTime.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekday = day >= 1 && day <= 5;
  const isWakingHours =
    hour >= AVAILABILITY_CONFIG.SLEEP_END_HOUR && hour < AVAILABILITY_CONFIG.SLEEP_START_HOUR;

  // Check for temporary status override during waking hours
  const overrideActive = isOverrideActive(centralTime);
  console.log("[v0] Availability check:", {
    centralTime: centralTime.toISOString(),
    hour,
    day,
    isWakingHours,
    overrideActive,
    endDate: STATUS_OVERRIDE?.endDate?.toISOString(),
  });
  if (isWakingHours && overrideActive) {
    return STATUS_OVERRIDE.status;
  }

  if (
    isWeekday &&
    hour >= AVAILABILITY_CONFIG.WORK_START_HOUR &&
    hour < AVAILABILITY_CONFIG.WORK_END_HOUR
  ) {
    return "cranking";
  }

  if (isWakingHours) {
    return "away";
  }

  return "offline";
}

/**
 * Hook that returns the current availability status and re-evaluates every minute.
 */
export function useAvailabilityStatus(): AvailabilityStatus {
  const [status, setStatus] = useState<AvailabilityStatus>(getAvailabilityStatus);

  useEffect(() => {
    const id = setInterval(() => {
      setStatus(getAvailabilityStatus());
    }, AVAILABILITY_CONFIG.UPDATE_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return status;
}
