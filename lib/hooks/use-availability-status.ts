"use client";

import { useEffect, useState } from "react";
import { AVAILABILITY_CONFIG, type AvailabilityStatus } from "@/lib/constants";

/**
 * Computes the current availability status based on Central US time.
 *
 * - "cranking": Mon–Fri, 8 AM – 5 PM CT
 * - "away":     Waking hours outside work (any day, 8 AM – 11 PM CT when not working)
 * - "offline":   Late night / early morning (11 PM – 8 AM CT)
 */
function getAvailabilityStatus(): AvailabilityStatus {
  const now = new Date();
  const centralTime = new Date(
    now.toLocaleString("en-US", { timeZone: AVAILABILITY_CONFIG.TIMEZONE }),
  );
  const hour = centralTime.getHours();
  const day = centralTime.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekday = day >= 1 && day <= 5;

  if (
    isWeekday &&
    hour >= AVAILABILITY_CONFIG.WORK_START_HOUR &&
    hour < AVAILABILITY_CONFIG.WORK_END_HOUR
  ) {
    return "cranking";
  }

  if (hour >= AVAILABILITY_CONFIG.SLEEP_END_HOUR && hour < AVAILABILITY_CONFIG.SLEEP_START_HOUR) {
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
