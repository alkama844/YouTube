# FastTube - Lightweight YouTube Player

Fast YouTube player for old phones with futuristic neon design.

## Quick Setup

1. Get YouTube API Key from https://console.developers.google.com/
2. Deploy or run locally
3. Open app → Settings → Enter API key

## Deploy to Vercel (Recommended)

### Method 1: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd YouTube
vercel

# Follow prompts:
# - Framework Preset: Other (or leave default)
# - Build Command: (leave empty)
# - Output Directory: (leave empty or use ".")
# - Development Command: (leave empty)

# Your app is now live!
```

### Method 2: GitHub + Vercel Dashboard
1. Push code to GitHub
2. Go to https://vercel.com/
3. Click "Import Project"
4. Select your GitHub repo
5. Framework Preset: **Other** (no framework needed)
6. Click "Deploy" - Done!

### Method 3: Drag & Drop
1. Go to https://vercel.com/
2. Drag the YouTube folder to the dashboard
3. Instant deployment!

## Local Development
```bash
python -m http.server 8000
# or
npx serve
```

## Features

- Fast & lightweight
- Background play  
- Offline bookmarks
- Neon UI design
- Works on old devices

Your app will be live at: `https://your-project.vercel.app`

