import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { logError } from "@/lib/errors";
import {
  VISITOR_COUNT_CONFIG,
  VISITOR_COUNT_CACHE_HEADERS,
} from "@/lib/config";
import { VISITOR_COUNTER_CONFIG } from "@/lib/constants";

/**
 * Visitor Count API Route
 */

const VISITOR_COUNT_KEY = VISITOR_COUNT_CONFIG.REDIS_KEY_PREFIX;

// Initialize Upstash Redis client
// Uses Redis.fromEnv() which automatically reads from environment variables
// set by Vercel Marketplace integration (KV_REST_API_URL, KV_REST_API_TOKEN, etc.)
// Check for env vars before initializing to avoid warnings during build
let redis: ReturnType<typeof Redis.fromEnv> | null = null;

// Check for required environment variables before initializing Redis
// This prevents warnings during build time when env vars aren't available
const hasRedisEnv =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

if (hasRedisEnv) {
  try {
    redis = Redis.fromEnv();
  } catch {
    // Redis initialization failed - will be handled gracefully in route handlers
    redis = null;
  }
}

/**
 * GET /api/visitor-count
 * Returns the current visitor count
 */
export async function GET() {
  if (!redis) {
    // Redis not configured, return 0
    return NextResponse.json({ count: 0 }, { status: 200 });
  }

  try {
    const count = await redis.get<number>(VISITOR_COUNT_KEY);
    const visitorCount = typeof count === "number" ? count : 0;

    const response = NextResponse.json({ count: visitorCount });

    // Cache the count for a short time to reduce Redis reads
    response.headers.set("Cache-Control", VISITOR_COUNT_CACHE_HEADERS.GET);

    return response;
  } catch (error) {
    logError(error, "Error fetching visitor count");
    // Return 0 as fallback if Redis is unavailable
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}

/**
 * POST /api/visitor-count
 * Increments the visitor count
 * Uses idempotency to prevent duplicate counts from the same visit
 */
export async function POST(request: NextRequest) {
  if (!redis) {
    // Redis not configured, return 0
    return NextResponse.json({ count: 0 }, { status: 200 });
  }

  try {
    // Get client IP for basic deduplication
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check if this IP has already been counted recently
    const recentKey = `${VISITOR_COUNT_CONFIG.REDIS_IP_KEY_PREFIX}${ip}`;
    const recentlyCounted = await redis.get<boolean>(recentKey);

    if (recentlyCounted) {
      // Already counted this visit, return current count
      const count = await redis.get<number>(VISITOR_COUNT_KEY);
      return NextResponse.json({
        count: typeof count === "number" ? count : 0,
        alreadyCounted: true,
      });
    }

    // Increment the count atomically
    const newCount = await redis.incr(VISITOR_COUNT_KEY);

    // Mark this IP as counted for the configured TTL
    await redis.setex(
      recentKey,
      VISITOR_COUNTER_CONFIG.IP_DEDUPLICATION_TTL_SECONDS,
      true
    );

    const response = NextResponse.json({ count: newCount });

    // Don't cache increment responses
    response.headers.set("Cache-Control", VISITOR_COUNT_CACHE_HEADERS.POST);

    return response;
  } catch (error) {
    logError(error, "Error incrementing visitor count");
    // Return current count as fallback
    try {
      const count = await redis.get<number>(VISITOR_COUNT_KEY);
      return NextResponse.json(
        {
          count: typeof count === "number" ? count : 0,
        },
        { status: 200 }
      );
    } catch {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
  }
}
