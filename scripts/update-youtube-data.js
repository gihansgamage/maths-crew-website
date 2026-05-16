const fs = require('fs/promises');
const path = require('path');
const { google } = require('googleapis');

const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE || '@mathscrew';
const FALLBACK_QUERY = process.env.YOUTUBE_FALLBACK_QUERY || 'Maths Crew';
const OUTPUT_FILE = process.env.YOUTUBE_DATA_FILE || path.join('data', 'youtube.json');
const MAX_RESULTS = Number(process.env.YOUTUBE_MAX_RESULTS || 6);

async function getChannelId(youtube) {
  try {
    const byHandle = await youtube.channels.list({
      forHandle: CHANNEL_HANDLE,
      part: 'id',
    });
    const id = byHandle.data.items?.[0]?.id;
    if (id) return id;
  } catch (error) {
    console.warn(`Could not resolve ${CHANNEL_HANDLE} by handle: ${error.message}`);
  }

  const search = await youtube.search.list({
    part: 'snippet',
    type: 'channel',
    maxResults: 1,
    q: FALLBACK_QUERY,
  });

  const id = search.data.items?.[0]?.snippet?.channelId;
  if (!id) throw new Error(`Could not find a YouTube channel for ${CHANNEL_HANDLE}`);
  return id;
}

async function main() {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('Missing YOUTUBE_API_KEY. Add it as a GitHub repository secret before running this script.');
  }

  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });

  const channelId = await getChannelId(youtube);
  const channelResponse = await youtube.channels.list({
    id: channelId,
    part: 'snippet,statistics,contentDetails',
  });

  const channel = channelResponse.data.items?.[0];
  if (!channel) throw new Error(`YouTube channel details were not found for ${channelId}`);

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  let videos = [];

  if (uploadsPlaylistId) {
    const videosResponse = await youtube.playlistItems.list({
      playlistId: uploadsPlaylistId,
      part: 'snippet,contentDetails',
      maxResults: MAX_RESULTS,
    });
    videos = videosResponse.data.items || [];
  }

  const output = {
    updatedAt: new Date().toISOString(),
    channelId,
    channel,
    videos,
  };

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${videos.length} videos for ${channel.snippet?.title || channelId} to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
