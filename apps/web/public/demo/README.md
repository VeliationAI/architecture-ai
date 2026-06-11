# Demo video

Add a product demo video for the landing page using either option:

## Option 1 — Local file (recommended for GitHub)

Place an MP4 or WebM file here:

```
apps/web/public/demo/demo.mp4
```

The app loads `/demo/demo.mp4` automatically.

## Option 2 — External URL

Set in `apps/web/.env.local`:

```bash
# YouTube, Loom, or direct MP4/WebM URL
NEXT_PUBLIC_DEMO_VIDEO_URL=https://www.youtube.com/watch?v=YOUR_VIDEO_ID
```

YouTube and Loom links are embedded automatically. Direct `.mp4` / `.webm` URLs use the HTML5 video player.
