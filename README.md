# Mkulima 🌱

**AI-powered farming assistant for Tanzanian farmers.**

Mkulima (*farmer* in Swahili) helps smallholder farmers across Tanzania with crop advice, pest diagnosis, seasonal calendars, and weather-aware tips — in both **Kiswahili** and **English**.

## Features

- **AI Crop Advisor** — Chat with an AI that knows your crops, mkoa (region), and season
- **Gundua Ardhi** — Photograph soil to identify type and get crop/tree recommendations
- **Photo Diagnosis** — Upload a plant photo for pest/disease identification
- **Crop Calendar** — Seasonal tasks tailored to your crops
- **Weather Tips** — Context-aware guidance for Tanzania's rainy and dry seasons
- **Farmer Profile** — Wilaya/kijiji, mkoa, crops, and language preference
- **Mobile-first PWA** — Works beautifully on phones in the field

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Optional — enables full AI chat and photo diagnosis |
| `NEXT_PUBLIC_SITE_URL` | Your production domain (default: `https://mkulima.co.tz`) |

Without an API key, the app still works with built-in smart fallback responses.

## Deploy to Cloudflare Workers

This app uses **OpenNext for Cloudflare** (`@opennextjs/cloudflare`), not TanStack Start. If you see:

```
The entry-point file at "@tanstack/react-start/server-entry" was not found.
```

Cloudflare was configured for the wrong framework. Use these settings instead.

### One-command deploy (CLI)

```bash
npm run deploy
```

Set your OpenAI key as a Cloudflare secret:

```bash
npx wrangler secret put OPENAI_API_KEY
```

### GitHub / Cloudflare Workers Builds

In the Cloudflare dashboard for this project:

| Setting | Value |
|---------|-------|
| **Framework preset** | None (or Next.js via OpenNext) |
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx opennextjs-cloudflare deploy` |

Do **not** use TanStack Start or a generic Workers template. The entry point is defined in `wrangler.jsonc` as `.open-next/worker.js`, which is generated during the OpenNext build.

Add `OPENAI_API_KEY` under **Workers → Settings → Variables and Secrets**.

### Local preview (Workers runtime)

```bash
npm run preview
```

## Tech Stack

- **Next.js 16** — App Router, API routes
- **OpenNext Cloudflare** — Workers deployment adapter
- **Tailwind CSS 4** — Earthy design system
- **TypeScript** — Type-safe throughout
- **Lucide Icons** — Clean iconography

## Design

Earthy color palette inspired by farmland:

| Color | Hex | Use |
|-------|-----|-----|
| Forest Green | `#2D5016` | Primary, headers |
| Sage | `#8BA888` | Accents, borders |
| Terracotta | `#C4704A` | CTAs, alerts |
| Cream | `#FAF7F2` | Background |
| Wheat | `#D4A853` | Highlights |
| Soil Brown | `#5C4033` | Text |

## Project Structure

```
src/
├── app/           # Pages and API routes
├── components/    # UI components
└── lib/           # AI, crops data, storage, types
```

## License

MIT
