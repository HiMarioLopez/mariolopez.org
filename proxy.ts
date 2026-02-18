import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isSupportedLocale, SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/agent-markdown";

const locales = SUPPORTED_LOCALES;
const defaultLocale: SupportedLocale = "en-US";
const MARKDOWN_MIME_TYPE = "text/markdown";
const HTML_MIME_TYPE = "text/html";

function getNegotiatorHeaders(request: NextRequest): Record<string, string> {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });
  return negotiatorHeaders;
}

function getLocale(request: NextRequest): SupportedLocale {
  const negotiatorHeaders = getNegotiatorHeaders(request);
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    const locale = match(languages, locales, defaultLocale);
    return isSupportedLocale(locale) ? locale : defaultLocale;
  } catch (_e) {
    return defaultLocale;
  }
}

function getLocaleFromPathname(pathname: string): SupportedLocale | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname === `/${locale}/`) {
      return locale;
    }

    if (pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }

  return null;
}

function getMarkdownAliasLocale(pathname: string): SupportedLocale | null {
  const aliasMatch = pathname.match(/^\/([^/]+)\.md\/?$/);
  if (!aliasMatch) {
    return null;
  }

  const maybeLocale = aliasMatch[1];
  return isSupportedLocale(maybeLocale) ? maybeLocale : null;
}

function prefersMarkdown(request: NextRequest): boolean {
  const negotiatorHeaders = getNegotiatorHeaders(request);
  const mediaTypes = new Negotiator({ headers: negotiatorHeaders })
    .mediaTypes()
    .map((type) => type.toLowerCase());

  const markdownIndex = mediaTypes.indexOf(MARKDOWN_MIME_TYPE);
  if (markdownIndex === -1) {
    return false;
  }

  const htmlIndex = mediaTypes.indexOf(HTML_MIME_TYPE);
  return htmlIndex === -1 || markdownIndex < htmlIndex;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const localeMarkdownAlias = getMarkdownAliasLocale(pathname);
  const isSiteRootPath = pathname === "/";

  // Direct markdown alias: /en-US.md -> /en-US/markdown
  if (localeMarkdownAlias) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${localeMarkdownAlias}/markdown`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // Root always defaults to English, with markdown negotiation support.
  if (isSiteRootPath) {
    const rootPrefersMarkdown = prefersMarkdown(request);
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rootPrefersMarkdown ? `/${defaultLocale}/markdown` : `/${defaultLocale}`;

    const response = NextResponse.rewrite(rewriteUrl);
    if (!rootPrefersMarkdown) {
      response.headers.set("Vary", "Accept");
    }
    return response;
  }

  const localeFromPathname = getLocaleFromPathname(pathname);

  // Redirect if there is no locale
  if (!localeFromPathname) {
    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, request.url),
    );
  }

  const isLocalizedRootPath =
    pathname === `/${localeFromPathname}` || pathname === `/${localeFromPathname}/`;

  // Content negotiation: serve markdown from the same localized URL.
  if (isLocalizedRootPath && prefersMarkdown(request)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${localeFromPathname}/markdown`;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (isLocalizedRootPath) {
    const response = NextResponse.next();
    response.headers.set("Vary", "Accept");
    return response;
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|images/|docs/|android-chrome-|apple-touch-icon|favicon-|robots.txt).*)",
  ],
};
