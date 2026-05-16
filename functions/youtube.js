const { google } = require('googleapis');

const ALLOWED_ENDPOINTS = new Set(['channels', 'playlistItems', 'search']);

exports.handler = async (event) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'YOUTUBE_API_KEY is not configured' }),
      };
    }

    const query = event.queryStringParameters || {};
    const { endpoint } = query;

    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid YouTube API endpoint' }),
      };
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY,
    });

    const params = Object.fromEntries(
      Object.entries(query).filter(([key]) => key !== 'endpoint')
    );

    const response = await youtube[endpoint].list(params);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    return {
      statusCode: Number(error.code) || 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
