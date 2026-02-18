import { NextResponse } from "next/server";
import {
  generateAgentSitemapMarkdown,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/agent-markdown";
import { CACHE_HEADERS } from "@/lib/config";
import { BASE_URL } from "@/lib/constants";

// Note: Must be a literal number for Next.js segment config (see CACHE_CONFIG.REVALIDATE_SECONDS)
export const revalidate = 300;

function createMarkdownResponse(markdown: string, lang: SupportedLocale) {
  const response = new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Language": lang,
      Vary: "Accept",
    },
  });

  response.headers.set("Cache-Control", CACHE_HEADERS.SUCCESS);
  response.headers.set("CDN-Cache-Control", CACHE_HEADERS.CDN);
  response.headers.set("Vercel-CDN-Cache-Control", CACHE_HEADERS.CDN);

  return response;
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  if (!isSupportedLocale(lang)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const generatedAt = new Date().toISOString();
  const markdown = generateAgentSitemapMarkdown({
    lang,
    baseUrl: BASE_URL,
    generatedAt,
  });

  return createMarkdownResponse(markdown, lang);
}
