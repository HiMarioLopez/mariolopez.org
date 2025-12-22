/**
 * Error handling utilities
 * Centralized error handling patterns and types
 */

import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "./config";

/**
 * Application error types
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
}

/**
 * Creates a standardized error response for API routes
 *
 * @param error - Error instance or message
 * @param statusCode - HTTP status code (default: 500)
 * @param code - Optional error code
 * @returns NextResponse with error details
 */
export function createErrorResponse(
  error: unknown,
  statusCode: number = 500,
  code?: string,
): NextResponse<ApiErrorResponse> {
  const message = error instanceof Error ? error.message : "An unexpected error occurred";

  const response = NextResponse.json(
    {
      error: message,
      ...(code && { code }),
    },
    { status: statusCode },
  );

  // Set error cache headers
  response.headers.set("Cache-Control", CACHE_HEADERS.ERROR);

  return response;
}

/**
 * Logs errors appropriately based on environment
 * Logs to console which appears in Vercel's runtime logs dashboard
 *
 * @param error - Error to log
 * @param context - Context where error occurred
 */
export function logError(error: unknown, context: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Log to console (appears in Vercel dashboard runtime logs)
  console.error(`[${context}]`, errorMessage, errorStack || error);

  // Additional development-only logging for detailed debugging
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}] Full error object:`, error);
  }
}
