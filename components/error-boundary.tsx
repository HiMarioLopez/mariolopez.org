"use client";

/**
 * React Error Boundary component
 * Catches React component errors and reports them
 */

import { Component, type ReactNode } from "react";
import { track } from "@vercel/analytics";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Sends error to API endpoint for server-side logging
 */
async function logErrorToAPI(errorInfo: {
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
}): Promise<void> {
  try {
    await fetch("/api/errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...errorInfo,
        errorType: "error-boundary",
        errorName: "ReactErrorBoundary",
      }),
      keepalive: true,
    });
  } catch (err) {
    // Silently fail
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to log error boundary error to API:", err);
    }
  }
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
    };

    // Log to Vercel Analytics
    track("ReactErrorBoundary", {
      message: error.message,
      errorName: error.name,
      ...(errorData.url && { url: errorData.url }),
    });

    // Log to API endpoint
    logErrorToAPI(errorData);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise show nothing
      // (errors are logged but don't break the UI)
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
