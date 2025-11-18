# mariolopez.org

Personal website built with Next.js, emphasizing performance and modern web technologies.

## Technical Overview

This is a Next.js 16 application using the App Router architecture, TypeScript, and Tailwind CSS. The site features a dual-view interface (`/human` and `/machine`) and integrates with external APIs for displaying recently played music tracks.

## Next.js Features

### App Router

- Server Components by default for optimal performance
- Route Handlers for API endpoints (`/api/recently-played`)
- Layout-based routing with nested layouts
- Automatic code splitting and route-based optimization

### Performance Optimizations

- **Image Optimization**: AVIF and WebP formats with responsive device sizes
- **Font Optimization**: Google Fonts (Geist) with `display: swap`, preloading, and font fallback adjustments
- **Script Optimization**: Strategic script loading with `beforeInteractive` strategy for critical resource hints
- **Bundle Optimization**: Package import optimization for `lucide-react` and Radix UI components
- **Build Optimizations**: Production console removal (excluding errors/warnings), compression enabled
- **Route Prefetching**: Automatic prefetching of `/human` and `/machine` routes on initial mount

### Caching Strategy

- API routes use `stale-while-revalidate` pattern with configurable cache headers
- Route-level revalidation (60 seconds for recently-played endpoint)
- CDN cache control headers for edge caching
- Error caching with shorter TTLs to prevent stale error states

## Libraries & Tools

### Core

- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with Server Components support
- **TypeScript**: Type safety throughout the codebase

### UI & Styling

- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives (dropdown menu, tooltip)
- **Lucide React**: Icon library with tree-shaking support
- **next-themes**: Theme management with system preference detection

### Data Fetching

- **TanStack Query**: Client-side data fetching and caching for API calls

### 3D Graphics

- **Three.js**: 3D graphics library for interactive visualizations

### Analytics & Monitoring

- **Vercel Analytics**: Web analytics integration
- **Vercel Speed Insights**: Performance monitoring
- **Custom Performance Monitor**: Core Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)

### Other

- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional class name utilities

## Performance Features

### Custom Performance Monitoring

- Real-time Core Web Vitals measurement (LCP, FID, CLS, FCP, TTFB)
- Resource timing analysis with slow resource detection
- Development-mode performance logging

### Resource Hints

- DNS prefetching for external domains (Vercel, GitHub, LinkedIn)
- Preconnect to critical origins (fonts, music API)
- Early connection establishment for faster resource loading

### Build-Time Optimizations

- Package import optimization to reduce bundle size
- Console statement removal in production builds
- Image format optimization (AVIF/WebP)
- Font subsetting and optimization

### Runtime Optimizations

- Route prefetching for instant navigation
- Stale-while-revalidate caching for API responses
- Error boundary patterns with graceful degradation
- Theme switching without layout shift

## Project Structure

```plaintext
app/
  api/recently-played/    # API route handler
  human/                  # Human view page
  machine/                # Machine view page
  layout.tsx              # Root layout with providers
components/               # React components
lib/                      # Utilities and configuration
  config.ts              # Centralized configuration
  performance.ts         # Performance monitoring utilities
  recently-played.ts     # Music API integration
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Configuration

Key configuration is centralized in `lib/config.ts`:

- API endpoints and base URLs
- Cache and revalidation settings
- Cache control headers
- Build-time environment variables

## License

```plaintext
Copyright (c) 2025 Mario Lopez Martinez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
