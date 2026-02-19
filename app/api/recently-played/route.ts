import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/config";
import { createErrorResponse, logError } from "@/lib/errors";
import { getRecentlyPlayed } from "@/lib/recently-played";

export const dynamic = "force-dynamic";

function setNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", CACHE_HEADERS.NO_STORE);
  response.headers.set("CDN-Cache-Control", CACHE_HEADERS.NO_STORE);
  response.headers.set("Vercel-CDN-Cache-Control", CACHE_HEADERS.NO_STORE);
  return response;
}

/**
 * GET /api/recently-played
 * Returns the most recently played track from Spotify or Apple Music
 */
export async function GET() {
  try {
    const recentlyPlayed = await getRecentlyPlayed();

    if (!recentlyPlayed) {
      return setNoStoreHeaders(
        createErrorResponse(
          new Error("No track data found from either source"),
          404,
          "NO_TRACK_DATA",
        ),
      );
    }

    return setNoStoreHeaders(NextResponse.json(recentlyPlayed));
  } catch (error) {
    logError(error, "Error fetching recently played song");
    return setNoStoreHeaders(createErrorResponse(error, 500, "FETCH_ERROR"));
  }
}
