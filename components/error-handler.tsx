"use client";

/**
 * Client-side error handler component
 * Captures and reports client-side errors to Vercel Analytics and API endpoint
 */

import { track } from "@vercel/analytics";
import { useEffect } from "react";

interface ErrorInfo {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
  errorType: "error" | "unhandledrejection" | "console-error";
  errorName?: string;
}

/**
 * Sends error to API endpoint for server-side logging
 */
async function logErrorToAPI(errorInfo: ErrorInfo): Promise<void> {
  try {
    await fetch("/api/errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorInfo),
      // Don't wait for response - fire and forget to avoid blocking
      keepalive: true,
    });
  } catch (err) {
    // Silently fail - we don't want error logging to cause errors
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to log error to API:", err);
    }
  }
}

/**
 * Captures error information and reports it
 */
function captureError(
  error: Error | string,
  errorType: ErrorInfo["errorType"],
  additionalInfo?: {
    source?: string;
    lineno?: number;
    colno?: number;
    reason?: unknown;
  },
): void {
  const errorInfo: ErrorInfo = {
    message: typeof error === "string" ? error : error.message,
    source: additionalInfo?.source,
    lineno: additionalInfo?.lineno,
    colno: additionalInfo?.colno,
    stack: error instanceof Error ? error.stack : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
    errorType,
    errorName: error instanceof Error ? error.name : undefined,
  };

  // Log to Vercel Analytics as custom event
  track("ClientError", {
    message: errorInfo.message,
    errorType: errorInfo.errorType,
    ...(errorInfo.errorName && { errorName: errorInfo.errorName }),
    ...(errorInfo.source && { source: errorInfo.source }),
    ...(errorInfo.url && { url: errorInfo.url }),
  });

  // Log to API endpoint for server-side logging (appears in Vercel dashboard)
  logErrorToAPI(errorInfo);

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error(`[ErrorHandler] ${errorType}:`, errorInfo);
  }
}

export function ErrorHandler() {
  useEffect(() => {
    // Handle JavaScript errors
    const handleError = (event: ErrorEvent) => {
      captureError(event.error || event.message, "error", {
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const error =
        reason instanceof Error
          ? reason
          : new Error(typeof reason === "string" ? reason : "Unhandled promise rejection");

      captureError(error, "unhandledrejection", {
        reason: reason instanceof Error ? reason.message : String(reason),
      });
    };

    // Override console.error to capture console errors
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      // Call original console.error
      originalConsoleError.apply(console, args);

      // Extract error information
      const errorMessages = args
        .map((arg) => {
          if (arg instanceof Error) {
            return arg.message;
          }
          if (typeof arg === "string") {
            return arg;
          }
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .filter(Boolean)
        .join(" ");

      if (errorMessages) {
        captureError(errorMessages, "console-error");
      }
    };

    // Set up global error handlers
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, []);

  return null; // This component doesn't render anything
}
