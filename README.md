# mariolopez.org 👋🤠

My personal website built with Next.js, emphasizing performance and modern web technologies.

## Tech Stack

**Core:** Next.js 16 (App Router), React 19 (Server Components), TypeScript, Tailwind CSS 4

**UI:** Radix UI, Lucide React, next-themes, class-variance-authority

**Data:** TanStack Query, Upstash Redis (visitor counting)

**3D:** Three.js

**Monitoring:** Vercel Analytics, Vercel Speed Insights, custom Core Web Vitals tracking

**Testing:** Vitest, Testing Library

## Features

- **Dual Views**: `/human` (human-readable) and `/machine` (machine-readable) interfaces
- **Recently Played Music**: Integration with external API for Spotify/Apple Music tracks
- **Visitor Counter**: Redis-based visitor counting with IP deduplication
- **Performance Monitoring**: Custom Core Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)
- **Error Handling**: Client-side error capture, React error boundary, server-side logging
- **Theme Support**: Dark/light mode with system preference detection

## Performance Optimizations

- Image optimization (AVIF/WebP), font optimization (Geist with `display: swap`)
- Server Components by default, automatic code splitting
- Stale-while-revalidate caching for API routes
- Route prefetching, resource hints (DNS prefetch, preconnect)
- Bundle optimization (tree-shaking imports), production console removal

## Project Structure

```plaintext
app/
  api/
    errors/              # Error logging
    recently-played/     # Music API
    visitor-count/       # Visitor counter
  human/                 # Human view
  machine/               # Machine view
components/              # React components
  ui/                   # UI primitives
lib/                     # Utilities & config
  config.ts             # Centralized config
  constants.ts          # Application constants
```

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Development server
pnpm build            # Production build
pnpm start            # Production server
pnpm lint             # Lint code
pnpm test             # Run tests
pnpm test:ui          # Test UI
pnpm check-links:prod # Check links
```

## Configuration

Configuration is centralized in `lib/config.ts` (API endpoints, cache settings) and `lib/constants.ts` (platform configs, UI constants, external links).

## License

MIT License - Copyright (c) 2025 Mario Lopez Martinez
