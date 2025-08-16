const { google } = require('googleapis');

exports.handler = async (event, context) => {
  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });

    const { endpoint } = event.queryStringParameters;
    const params = Object.fromEntries(
      Object.entries(event.queryStringParameters)
        .filter(([key]) => key !== 'endpoint')
    );

    if (!youtube[endpoint]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid YouTube API endpoint' })
      };
    }

    const response = await youtube[endpoint].list(params);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    return {
      statusCode: error.code || 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
