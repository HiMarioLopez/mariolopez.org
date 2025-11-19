import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errors";

/**
 * API route for logging client-side errors
 * Errors logged here will appear in Vercel's runtime logs dashboard
 */

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();

    // Log error with context
    logError(
      new Error(
        `[Client Error] ${errorData.errorType}: ${errorData.message}`
      ),
      "client-error-api"
    );

    // Log structured error data to console (appears in Vercel dashboard)
    console.error(JSON.stringify({
      type: "client-error",
      errorType: errorData.errorType,
      message: errorData.message,
      errorName: errorData.errorName,
      source: errorData.source,
      lineno: errorData.lineno,
      colno: errorData.colno,
      stack: errorData.stack,
      url: errorData.url,
      userAgent: errorData.userAgent,
      timestamp: errorData.timestamp,
    }));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Silently fail - we don't want error logging to cause errors
    logError(error, "error-logging-api");
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

