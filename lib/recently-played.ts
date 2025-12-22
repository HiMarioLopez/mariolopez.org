import { API_CONFIG, CACHE_CONFIG } from "./config";
import { logError } from "./errors";
import { extractTrackInfo, normalizeTrackData } from "./track-data";
import type { RecentlyPlayed } from "./types";

/**
 * Fetches the most recently played track from Spotify and Apple Music
 * Returns the most recent track based on timestamp comparison
 *
 * @returns Recently played track information or null if unavailable
 */
export async function getRecentlyPlayed(): Promise<RecentlyPlayed | null> {
  try {
    const spotifyUrl = `${API_CONFIG.MUSIC_API_BASE_URL}${API_CONFIG.SPOTIFY_ENDPOINT}?limit=${API_CONFIG.DEFAULT_LIMIT}`;
    const appleMusicUrl = `${API_CONFIG.MUSIC_API_BASE_URL}${API_CONFIG.APPLE_MUSIC_ENDPOINT}?limit=${API_CONFIG.DEFAULT_LIMIT}`;

    const [spotifyResponse, appleMusicResponse] = await Promise.allSettled([
      fetch(spotifyUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: CACHE_CONFIG.REVALIDATE_SECONDS },
      }),
      fetch(appleMusicUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: CACHE_CONFIG.REVALIDATE_SECONDS },
      }),
    ]);

    const tracks: Array<{
      songName: string;
      artistName: string;
      platform: string;
      url: string;
      timestamp: string;
    }> = [];

    // Process Spotify response
    if (spotifyResponse.status === "fulfilled" && spotifyResponse.value.ok) {
      try {
        const spotifyData = await spotifyResponse.value.json();
        const trackData = normalizeTrackData(spotifyData);

        if (trackData) {
          const trackInfo = extractTrackInfo(trackData);
          if (trackInfo.timestamp) {
            tracks.push(trackInfo);
          }
        }
      } catch (error) {
        logError(error, "Error parsing Spotify response");
      }
    }

    // Process Apple Music response
    if (appleMusicResponse.status === "fulfilled" && appleMusicResponse.value.ok) {
      try {
        const appleMusicData = await appleMusicResponse.value.json();
        const trackData = normalizeTrackData(appleMusicData);

        if (trackData) {
          const trackInfo = extractTrackInfo(trackData);
          if (trackInfo.timestamp) {
            tracks.push(trackInfo);
          }
        }
      } catch (error) {
        logError(error, "Error parsing Apple Music response");
      }
    }

    if (tracks.length === 0) {
      return null;
    }

    // Find the most recently played track by comparing timestamps
    const mostRecentTrack = tracks.reduce((latest, current) => {
      if (!latest.timestamp) return current;
      if (!current.timestamp) return latest;

      const latestTime = new Date(latest.timestamp).getTime();
      const currentTime = new Date(current.timestamp).getTime();

      return currentTime > latestTime ? current : latest;
    });

    return {
      song: mostRecentTrack.songName,
      artist: mostRecentTrack.artistName,
      platform: mostRecentTrack.platform,
      url: mostRecentTrack.url,
      timestamp: mostRecentTrack.timestamp,
    };
  } catch (error) {
    logError(error, "Error fetching recently played song");
    return null;
  }
}

export type { RecentlyPlayed };
