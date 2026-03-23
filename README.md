# mariolopez.org 👋🤠

Personal website built with Next.js 16, focused on performance, bilingual content, and machine-readable output.

## Tech Stack

- **Core:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Runtime and tooling:** Bun, Biome, Vitest, Husky
- **UI:** Radix UI, Lucide React, next-themes
- **Data:** TanStack Query, Upstash Redis (visitor counting), external music API
- **Monitoring:** Vercel Analytics, Vercel Speed Insights, custom Core Web Vitals tracking

## Features

- **Localized routing:** `en-US` and `es-MX` with locale negotiation
- **Dual experiences:** human view at `/{lang}` and machine view at `/{lang}/machine`
- **Machine-friendly endpoints:** `/{lang}/markdown` and `/{lang}/sitemap.md`
- **Recently played music:** Spotify/Apple Music playback surfaced through cached API routes
- **Visitor counter:** Redis-backed count with short IP deduplication
- **Theme and language controls:** system-aware dark/light mode with language switching

## Performance

- Server Components by default with client components where interactivity is needed
- Stale-while-revalidate caching for API and markdown routes
- Resource hints (`preconnect`/`dns-prefetch`) for critical origins
- Font and image optimization via Next.js primitives
- Vercel Analytics + Speed Insights + custom runtime performance monitoring

## Project Structure

```plaintext
app/
  [lang]/
    page.tsx               # Human view
    machine/page.tsx       # Machine view
    markdown/route.ts      # Markdown representation for agents
    sitemap.md/route.ts    # Markdown sitemap
    dictionaries/          # en-US / es-MX dictionaries
  api/
    recently-played/route.ts
    visitor-count/route.ts
    errors/route.ts
components/                # UI and client components
lib/                       # Hooks, config, constants, utilities
scripts/                   # i18n and link-check scripts
proxy.ts                   # Locale + markdown content negotiation
```

## Development

```bash
bun install
bun run dev
bun run build
bun run start
bun run lint
bun run lint:fix
bun run format
bun run test
bun run check:i18n
bun run check-links:prod
```

## Environment Variables

The app works without additional env vars for most local development. These are recommended:

```bash
NEXT_PUBLIC_SITE_URL=https://mariolopez.org
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

- `NEXT_PUBLIC_SITE_URL`: canonical URL for generated links/markdown output
- `KV_REST_API_URL` + `KV_REST_API_TOKEN`: enables persistent visitor counting (falls back gracefully when unset)

## Configuration

Application configuration is centralized in `lib/config.ts` and shared constants live in `lib/constants.ts`.

## License

MIT License - Copyright (c) 2026 Mario Lopez
