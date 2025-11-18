import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.MUSIC_API_URL ||
      "https://music.mariolopez.org/api/nodejs/v1/history/music?limit=1";

    const response = await fetch(backendUrl, {
      headers: {
        "Content-Type": "application/json",
        // Add any required authentication headers here if needed
        // 'Authorization': `Bearer ${process.env.MUSIC_API_TOKEN}`,
      },
      // Cache for 60 seconds to avoid hitting rate limits
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Handle different possible response formats
    // The endpoint might return an array or an object with an array
    let trackData = null;

    if (Array.isArray(data)) {
      // If response is an array, get the first item
      trackData = data[0];
    } else if (data.data && Array.isArray(data.data)) {
      // If response has a data property with an array
      trackData = data.data[0];
    } else if (data.items && Array.isArray(data.items)) {
      // If response has an items property with an array
      trackData = data.items[0];
    } else {
      // Otherwise, assume the data itself is the track object
      trackData = data;
    }

    if (!trackData) {
      throw new Error("No track data found in response");
    }

    // Extract song name, artist, and platform from the track data
    // Based on the API response structure: { name: "Song Name", artistName: "Artist Name", source: "apple" }
    let songName = "";
    let artistName = "";
    let platform = "";

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
    // Default to Apple Music if no platform is specified
    const source = trackData.source || "";
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

    // Extract URL and timestamp from track data
    const songUrl = trackData.url || "";
    const timestamp = trackData.processedTimestamp || "";

    return NextResponse.json({
      song: songName,
      artist: artistName,
      platform: platform,
      url: songUrl,
      timestamp: timestamp,
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
