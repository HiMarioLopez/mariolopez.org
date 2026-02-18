import { NextResponse } from "next/server";
import {
  generateAgentMarkdown,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/agent-markdown";
import { CACHE_HEADERS } from "@/lib/config";
import { BASE_URL } from "@/lib/constants";
import { getRecentlyPlayed } from "@/lib/recently-played";
import { getDictionary } from "../dictionaries";

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

  const dict = await getDictionary(lang);
  const recentlyPlayed = await getRecentlyPlayed();
  const generatedAt = new Date().toISOString();
  const canonicalUrl = `${BASE_URL}/${lang}`;

  const markdown = generateAgentMarkdown({
    lang,
    machine: dict.machine,
    recentlyPlayed,
    canonicalUrl,
    generatedAt,
  });

  return createMarkdownResponse(markdown, lang);
}
