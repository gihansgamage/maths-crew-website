# Maths Crew Website

Official website for the Maths Crew YouTube channel.

## YouTube data on GitHub Pages

GitHub Pages only serves static files. It cannot run the Netlify function in `functions/youtube.js`, so the website reads YouTube information from `data/youtube.json` first.

To keep that file updated automatically:

1. Create a YouTube Data API v3 key in Google Cloud.
2. In your GitHub repository, go to **Settings → Secrets and variables → Actions → New repository secret**.
3. Add the secret name `YOUTUBE_API_KEY` with your API key as the value.
4. Go to **Actions → Update YouTube data → Run workflow**.
5. The workflow will refresh `data/youtube.json` every 6 hours after that.

For Netlify deployments, set the same `YOUTUBE_API_KEY` environment variable and the existing Netlify function will be used as a fallback.

## Local development

```bash
npm install
YOUTUBE_API_KEY=your_key_here npm run update:youtube
```

Open `index.html` with a local web server so the browser can fetch `data/youtube.json`.
