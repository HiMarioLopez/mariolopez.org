import { NextResponse } from "next/server";

interface TrackData {
  name?: string;
  artistName?: string;
  song?: string;
  artist?: string;
  title?: string;
  artists?: any;
  track?: any;
  source?: string;
  url?: string;
  processedTimestamp?: string;
}

function extractTrackInfo(trackData: TrackData): {
  songName: string;
  artistName: string;
  platform: string;
  url: string;
  timestamp: string;
} {
  let songName = "";
  let artistName = "";

  if (trackData.name && trackData.artistName) {
    // Primary format from the API: name and artistName
    songName = trackData.name;
    artistName = trackData.artistName;
  } else if (trackData.song && trackData.artist) {
    songName = trackData.song;
    artistName = trackData.artist;
  } else if (trackData.track) {
    songName = trackData.track.name;
    artistName =
      trackData.track.artists?.map((a: any) => a.name).join(", ") || "";
  } else if (trackData.name && trackData.artist) {
    songName = trackData.name;
    artistName = trackData.artist;
  } else if (trackData.title && trackData.artist) {
    songName = trackData.title;
    artistName = trackData.artist;
  } else if (trackData.name && trackData.artists) {
    songName = trackData.name;
    artistName = Array.isArray(trackData.artists)
      ? trackData.artists
          .map((a: any) => (typeof a === "string" ? a : a.name))
          .join(", ")
      : trackData.artists;
  } else {
    // Fallback: try to extract from any available fields
    songName = trackData.name || trackData.title || trackData.song || "";
    artistName =
      trackData.artistName ||
      trackData.artist ||
      (Array.isArray(trackData.artists)
        ? trackData.artists
            .map((a: any) => (typeof a === "string" ? a : a.name))
            .join(", ")
        : trackData.artists) ||
      "";
  }

  // Extract platform and format it nicely
  const source = trackData.source || "";
  let platform = "";
  if (source === "apple") {
    platform = "Apple Music";
  } else if (source === "spotify") {
    platform = "Spotify";
  } else if (source) {
    // Capitalize first letter if it's a known platform
    platform = source.charAt(0).toUpperCase() + source.slice(1);
  } else {
    // Default to Apple Music if no platform is specified
    platform = "Apple Music";
  }

  const songUrl = trackData.url || "";
  const timestamp = trackData.processedTimestamp || "";

  return {
    songName,
    artistName,
    platform,
    url: songUrl,
    timestamp,
  };
}

export async function GET() {
  try {
    const baseUrl =
      process.env.MUSIC_API_URL || "https://music.mariolopez.org/api/nodejs/v1";
    const spotifyUrl = `${baseUrl}/history/spotify?limit=1`;
    const appleMusicUrl = `${baseUrl}/history/music?limit=1`;

    // Fetch from both endpoints in parallel
    const [spotifyResponse, appleMusicResponse] = await Promise.allSettled([
      fetch(spotifyUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      }),
      fetch(appleMusicUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
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
        let trackData: TrackData | null = null;

        if (spotifyData.items && Array.isArray(spotifyData.items)) {
          trackData = spotifyData.items[0];
        } else if (Array.isArray(spotifyData)) {
          trackData = spotifyData[0];
        } else if (spotifyData.data && Array.isArray(spotifyData.data)) {
          trackData = spotifyData.data[0];
        } else {
          trackData = spotifyData;
        }

        if (trackData) {
          const trackInfo = extractTrackInfo(trackData);
          if (trackInfo.timestamp) {
            tracks.push(trackInfo);
          }
        }
      } catch (error) {
        console.error("Error parsing Spotify response:", error);
      }
    }

    // Process Apple Music response
    if (
      appleMusicResponse.status === "fulfilled" &&
      appleMusicResponse.value.ok
    ) {
      try {
        const appleMusicData = await appleMusicResponse.value.json();
        let trackData: TrackData | null = null;

        if (appleMusicData.items && Array.isArray(appleMusicData.items)) {
          trackData = appleMusicData.items[0];
        } else if (Array.isArray(appleMusicData)) {
          trackData = appleMusicData[0];
        } else if (appleMusicData.data && Array.isArray(appleMusicData.data)) {
          trackData = appleMusicData.data[0];
        } else {
          trackData = appleMusicData;
        }

        if (trackData) {
          const trackInfo = extractTrackInfo(trackData);
          if (trackInfo.timestamp) {
            tracks.push(trackInfo);
          }
        }
      } catch (error) {
        console.error("Error parsing Apple Music response:", error);
      }
    }

    // If no tracks found, return error
    if (tracks.length === 0) {
      throw new Error("No track data found from either source");
    }

    // Find the most recently played track by comparing timestamps
    const mostRecentTrack = tracks.reduce((latest, current) => {
      if (!latest.timestamp) return current;
      if (!current.timestamp) return latest;

      const latestTime = new Date(latest.timestamp).getTime();
      const currentTime = new Date(current.timestamp).getTime();

      return currentTime > latestTime ? current : latest;
    });

    return NextResponse.json({
      song: mostRecentTrack.songName,
      artist: mostRecentTrack.artistName,
      platform: mostRecentTrack.platform,
      url: mostRecentTrack.url,
      timestamp: mostRecentTrack.timestamp,
    });
  } catch (error) {
    console.error("Error fetching recently played song:", error);
    // Return a graceful error response
    return NextResponse.json(
      { error: "Unable to fetch recently played song" },
      { status: 500 }
    );
  }
}
