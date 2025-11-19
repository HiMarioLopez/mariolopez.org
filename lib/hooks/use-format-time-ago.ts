import { useMemo } from "react";
import { formatTimeAgo } from "@/lib/utils";

/**
 * Hook that formats a timestamp as "time ago" string
 * Only calculates on the client side to avoid hydration mismatches
 *
 * @param timestamp - ISO timestamp string
 * @returns Formatted time ago string (e.g., "5 minutes ago", "2 hours ago")
 */
export function useFormatTimeAgo(timestamp: string | undefined): string {
  // Use useMemo instead of useState + useEffect to avoid setState in effect warning
  return useMemo(() => {
    return timestamp ? formatTimeAgo(timestamp) : "";
  }, [timestamp]);
}
