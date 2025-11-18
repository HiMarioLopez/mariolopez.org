interface RecentlyPlayed {
  song: string;
  artist: string;
  platform: string;
  url: string;
  timestamp: string;
}

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

  const source = trackData.source || "";
  let platform = "";
  if (source === "apple") {
    platform = "Apple Music";
  } else if (source === "spotify") {
    platform = "Spotify";
  } else if (source) {
    platform = source.charAt(0).toUpperCase() + source.slice(1);
  } else {
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

export async function getRecentlyPlayed(): Promise<RecentlyPlayed | null> {
  try {
    const baseUrl =
      process.env.MUSIC_API_URL || "https://music.mariolopez.org/api/nodejs/v1";
    const spotifyUrl = `${baseUrl}/history/spotify?limit=1`;
    const appleMusicUrl = `${baseUrl}/history/music?limit=1`;

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

    if (tracks.length === 0) {
      return null;
    }

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
    console.error("Error fetching recently played song:", error);
    return null;
  }
}

export type { RecentlyPlayed };

