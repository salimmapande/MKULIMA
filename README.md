# Mkulima 🌱

**AI-powered farming assistant for Kenyan and East African farmers.**

Mkulima (*farmer* in Swahili) helps smallholder farmers with crop advice, pest diagnosis, seasonal calendars, and weather-aware tips — in both **Kiswahili** and **English**.

## Features

- **AI Crop Advisor** — Chat with an AI that knows your crops, location, and season
- **Photo Diagnosis** — Upload a plant photo for pest/disease identification
- **Crop Calendar** — Seasonal tasks tailored to your crops
- **Weather Tips** — Context-aware guidance based on the current season
- **Farmer Profile** — Personalize advice with your farm details
- **Mobile-first PWA** — Works beautifully on phones in the field

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### AI Features (Optional)

For full AI chat and photo diagnosis, add your OpenAI API key:

```bash
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY
```

Without an API key, the app still works with built-in smart fallback responses.

## Tech Stack

- **Next.js 16** — App Router, API routes
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
