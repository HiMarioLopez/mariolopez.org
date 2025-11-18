# Code Quality & Engineering Excellence Assessment - mariolopez.org

You are an expert performance engineer and code quality specialist assessing a Next.js 16 + React 19 personal website. Perform a comprehensive assessment to ensure we maintain the highest standards for performance, code quality, and engineering excellence according to the project's `.cursorrules` file.

## Project Context

**Technology Stack:**

- Next.js 16 (App Router, Server Components by default)
- React 19 (Server Components support)
- TypeScript (strict mode, ES6 target)
- Tailwind CSS 4
- pnpm (package manager - verify no npm/yarn usage)
- Radix UI (accessible primitives)
- Lucide React (must use tree-shaking imports)
- TanStack Query (client-side data fetching)
- Three.js (3D visualizations)
- Vercel Analytics

**Architecture:**

- File structure: `app/`, `components/` (kebab-case), `lib/`, `public/`
- Server Components by default, minimal Client Components
- Route Handlers (not Pages API) in `app/api/`
- Dual-view architecture: `/human` and `/machine` pages

## Assessment Scope

### 1. Code Quality & Maintainability

- **Magic Strings/Numbers**:

  - Verify ALL hardcoded values use `lib/constants.ts` or `lib/config.ts`
  - Check for URLs, endpoints, time values, breakpoints, colors, etc.
  - Flag any values that should be constants but aren't

- **Component Organization**:

  - Verify components use kebab-case naming (e.g., `recently-played.tsx`)
  - UI primitives in `components/ui/` directory
  - Components exceeding ~300 lines should be split
  - Client components should be minimal and co-located

- **TypeScript Strictness**:

  - Verify strict mode compliance
  - Check for `any` types (should be avoided)
  - Verify `as const` used for configuration objects
  - Check proper type inference usage
  - Verify path aliases (`@/*`) are used correctly

- **Unused Code**:

  - Identify unused imports, components, utilities, hooks
  - Check for unused dependencies in `package.json`
  - Verify all components are imported and used

- **Code Duplication**:
  - Find repeated patterns that could be abstracted
  - Check for duplicate logic across components

### 2. Performance Optimization

- **React Patterns**:

  - **CRITICAL**: Verify Server Components are used by default
  - Check for unnecessary "use client" directives (should only be used for interactivity, hooks, browser APIs)
  - Identify components that should use `React.memo`, `useMemo`, or `useCallback` but don't
  - Check for unnecessary re-renders or missing dependency arrays
  - Verify proper use of dynamic imports for code splitting
  - **CRITICAL**: Reference latest React 19 docs (https://react.dev) to verify Server Components patterns

- **Next.js Best Practices**:

  - **CRITICAL**: Reference latest Next.js 16 docs (https://nextjs.org/docs/app) to verify:
    - App Router patterns are current and optimal
    - Route Handlers (not Pages API) are used correctly
    - Caching strategies align with latest recommendations
    - Image optimization uses Next.js Image component with AVIF/WebP
    - Font optimization uses `next/font/google` with `display: swap` and preloading
  - Verify route prefetching is implemented for critical routes
  - Check metadata configuration is optimal
  - Verify proper use of `next/dynamic` for code splitting

- **Bundle Size**:

  - **CRITICAL**: Verify `lucide-react` uses tree-shaking imports (individual imports, not `import *`)
  - Verify Radix UI components are imported individually
  - Check for unnecessary dependencies or large unused packages
  - Identify opportunities for dynamic imports
  - Verify Three.js is only loaded when needed (dynamic import)

- **Runtime Performance**:
  - Check for inefficient event listeners (missing debouncing/throttling)
  - Verify proper cleanup in useEffect hooks
  - Identify expensive computations that should be memoized
  - Check for unnecessary client-side JavaScript
  - Verify proper use of `useMediaQuery` or similar hooks instead of resize listeners

### 3. Architecture & Patterns

- **Configuration Management**:

  - **CRITICAL**: Verify ALL config values use `lib/config.ts`
  - No hardcoded URLs, endpoints, API base URLs
  - Cache settings must come from `lib/config.ts`
  - Build-time variables in `BUILD_CONFIG`

- **Constants Management**:

  - **CRITICAL**: Verify ALL constants use `lib/constants.ts`
  - No magic strings for platform names, time units, breakpoints, colors
  - External links must use `LINKS` constant
  - UI constants (breakpoints, hero config, time formatting) must use constants
  - Resource hints configuration must use constants

- **API Routes**:

  - Verify Route Handlers (not Pages API) in `app/api/` directory
  - Verify stale-while-revalidate caching pattern
  - Verify cache config uses `lib/config.ts` (CACHE_CONFIG, CACHE_HEADERS)
  - Check proper error responses with shorter cache TTLs
  - Verify CDN cache headers are set appropriately

- **Data Fetching**:

  - Verify TanStack Query usage is optimal for client-side fetching
  - Verify Server Components used for initial data fetching when possible
  - Check query configuration uses constants from `lib/config.ts` or `lib/constants.ts`

- **File Structure**:
  - Verify components use kebab-case naming
  - Verify proper directory structure (`app/`, `components/`, `lib/`, `public/`)
  - UI primitives in `components/ui/` directory

### 4. Dependency Management

- **Unused Packages**:

  - Identify packages in `package.json` that aren't imported anywhere
  - Check for packages listed but not actually used

- **Package Manager**:

  - Verify pnpm is used (check for npm/yarn lockfiles or usage)
  - Verify package.json scripts use pnpm if needed

- **Library Usage**:

  - Verify Lucide React uses individual imports (tree-shaking)
  - Verify Radix UI components are imported correctly
  - Verify class-variance-authority is used appropriately
  - Verify clsx & tailwind-merge are used via `cn()` utility

- **Security & Updates**:
  - Flag any packages with known vulnerabilities
  - Check for major version updates available (verify compatibility first)

### 5. Dual-View Architecture (CRITICAL)

- **Content Synchronization**:
  - **CRITICAL**: Verify `/human` and `/machine` pages stay synchronized
  - Check if content changes on `/human` are reflected on `/machine`
  - Verify both views use consistent data sources
  - Flag any informational changes that affect one view but not the other
  - This is MANDATORY - not optional

### 6. Styling & Theming

- **Tailwind CSS**:

  - Verify Tailwind CSS 4 usage
  - Verify `cn()` utility (from `lib/utils.ts`) is used for conditional classes
  - Check mobile-first responsive design approach
  - Verify CSS variables used for theming (via next-themes)

- **Theme Support**:
  - Verify dark/light mode works correctly via next-themes
  - Check for hardcoded colors (should use CSS variables)
  - Verify system preference detection works
  - Check theme switching compatibility

### 7. Accessibility & UX

- **Accessibility**:

  - Verify Radix UI components are used correctly for accessible primitives
  - Check proper ARIA attributes where needed
  - Verify keyboard navigation works

- **Loading States**:

  - Verify proper loading/skeleton states
  - Check for proper error states and graceful degradation

- **Responsive Design**:
  - Verify mobile-first approach
  - Check proper breakpoint usage (should use `BREAKPOINTS` constants)
  - Verify responsive behavior works correctly

### 8. Performance Monitoring

- **Custom Performance Monitor**:

  - Verify Core Web Vitals tracking is implemented
  - Check development-mode performance logging
  - Verify resource timing analysis

- **Resource Hints**:
  - Verify DNS prefetching for external domains
  - Check preconnect to critical origins
  - Verify resource hints configuration uses constants

### 9. Error Handling & Security

- **Error Handling**:

  - Verify graceful degradation
  - Check for proper error boundaries
  - Verify API error handling uses proper error responses

- **Security**:
  - Verify `NEXT_PUBLIC_*` prefix for client-side environment variables
  - Check no secrets exposed in client code
  - Verify `rel="noopener noreferrer"` on external links
  - Check for proper sanitization if user content exists

### 10. Documentation Alignment

- **Framework Versions**:

  - **CRITICAL**: If Next.js version is 16.x, reference https://nextjs.org/docs/app to verify patterns match latest recommendations
  - **CRITICAL**: If React version is 19.x, reference https://react.dev to verify patterns match latest React 19 Server Components best practices
  - Flag any patterns that may be deprecated or suboptimal according to latest docs
  - Verify App Router patterns are current

- **Best Practices**:
  - Verify patterns align with current Next.js App Router documentation
  - Check React Server Components usage matches React 19 recommendations
  - Verify TypeScript patterns follow latest TypeScript best practices

## Output Format

For each category, provide:

1. **Issues Found**:

   - List specific issues with file paths and line numbers
   - Include code snippets showing the problem
   - Reference the specific rule from `.cursorrules` that's violated

2. **Recommendations**:

   - Actionable recommendations with priority (High/Medium/Low)
   - High: Performance issues, security vulnerabilities, broken patterns, deprecated APIs, dual-view sync issues
   - Medium: Code quality improvements, optimization opportunities, maintainability concerns
   - Low: Nice-to-have improvements, style consistency, minor optimizations

3. **Best Practices**:

   - Suggestions for improvements even if no issues found
   - Reference to latest documentation when patterns need verification

4. **Documentation References**:
   - Links to relevant Next.js/React docs when patterns need verification
   - Specific sections that should be reviewed

## Priority Levels

- **High**:

  - Performance issues (unnecessary re-renders, missing memoization, large bundles)
  - Security vulnerabilities
  - Broken architecture patterns (hardcoded values, wrong component types)
  - Deprecated APIs
  - **Dual-view synchronization issues**
  - Missing Server Component optimization opportunities

- **Medium**:

  - Code quality improvements (magic strings, component size)
  - Optimization opportunities (missing React.memo, useMemo)
  - Maintainability concerns (duplication, organization)

- **Low**:
  - Nice-to-have improvements
  - Style consistency
  - Minor optimizations

## Notes

- Be thorough but practical - focus on actionable improvements
- When in doubt about Next.js 16/React 19 patterns, reference official documentation
- Consider the project's performance-first philosophy
- Maintain the existing architecture patterns unless there's a compelling reason to change
- **CRITICAL**: Always check dual-view synchronization - this is mandatory per `.cursorrules`
- Verify all imports follow project conventions (tree-shaking, path aliases)
- Check that pnpm is being used (not npm/yarn)
