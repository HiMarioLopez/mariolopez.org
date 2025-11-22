import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errors";

/**
 * API route for logging client-side errors
 * Errors logged here will appear in Vercel's runtime logs dashboard
 */

interface ClientErrorPayload {
  errorType: string;
  message: string;
  errorName?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string | number;
}

/**
 * Validates the error payload to ensure it meets expected structure
 * and prevents log flooding with garbage data
 */
function isValidErrorPayload(data: unknown): data is ClientErrorPayload {
  if (!data || typeof data !== "object") return false;

  const d = data as Record<string, unknown>;

  // Check for required string fields
  if (typeof d.errorType !== "string" || d.errorType.length > 100) return false;
  if (typeof d.message !== "string" || d.message.length > 2000) return false;

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isValidErrorPayload(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid error payload" },
        { status: 400 }
      );
    }

    // Sanitize/Truncate potentially large fields
    const errorData: ClientErrorPayload = {
      ...body,
      message: body.message.slice(0, 500), // Limit message size
      stack: body.stack?.slice(0, 1000), // Limit stack trace size
      userAgent: body.userAgent?.slice(0, 250), // Limit UA string
    };

    // Log error with context
    logError(
      new Error(`[Client Error] ${errorData.errorType}: ${errorData.message}`),
      "client-error-api"
    );

    // Log structured error data to console (appears in Vercel dashboard)
    console.error(
      JSON.stringify({
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
      })
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Silently fail - we don't want error logging to cause errors
    logError(error, "error-logging-api");
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
