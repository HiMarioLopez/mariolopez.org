import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/config";
import { createErrorResponse, logError } from "@/lib/errors";
import { getRecentlyPlayed } from "@/lib/recently-played";

// Note: Must be a literal number for Next.js segment config (see CACHE_CONFIG.REVALIDATE_SECONDS)
export const revalidate = 300;

/**
 * GET /api/recently-played
 * Returns the most recently played track from Spotify or Apple Music
 */
export async function GET() {
  try {
    const recentlyPlayed = await getRecentlyPlayed();

    if (!recentlyPlayed) {
      return createErrorResponse(
        new Error("No track data found from either source"),
        404,
        "NO_TRACK_DATA",
      );
    }

    const response = NextResponse.json(recentlyPlayed);

    // Set caching headers with stale-while-revalidate pattern
    response.headers.set("Cache-Control", CACHE_HEADERS.SUCCESS);
    response.headers.set("CDN-Cache-Control", CACHE_HEADERS.CDN);
    response.headers.set("Vercel-CDN-Cache-Control", CACHE_HEADERS.CDN);

    return response;
  } catch (error) {
    logError(error, "Error fetching recently played song");
    return createErrorResponse(error, 500, "FETCH_ERROR");
  }
}
