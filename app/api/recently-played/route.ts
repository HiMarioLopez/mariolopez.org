import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/config";
import { createErrorResponse, logError } from "@/lib/errors";
import { getRecentlyPlayed } from "@/lib/recently-played";

// Note: Must be a literal number for Next.js segment config
export const revalidate = 60;

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

    // Keep API cache policy in sync with now-playing refresh cadence.
    response.headers.set("Cache-Control", CACHE_HEADERS.RECENTLY_PLAYED_SUCCESS);
    response.headers.set("CDN-Cache-Control", CACHE_HEADERS.RECENTLY_PLAYED_CDN);
    response.headers.set("Vercel-CDN-Cache-Control", CACHE_HEADERS.RECENTLY_PLAYED_CDN);

    return response;
  } catch (error) {
    logError(error, "Error fetching recently played song");
    return createErrorResponse(error, 500, "FETCH_ERROR");
  }
}
