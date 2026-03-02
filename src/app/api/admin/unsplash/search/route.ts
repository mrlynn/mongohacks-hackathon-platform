import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";
import { apiLogger } from "@/lib/logger";
import type {
  UnsplashSearchResponse,
  UnsplashSearchResult,
} from "@/types/unsplash";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Simple in-memory rate limiter
const WINDOW_MS = 3600000; // 1 hour
const MAX_REQUESTS = 45;
let requestCount = 0;
let windowStart = Date.now();

function checkRateLimit(): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    requestCount = 0;
    windowStart = now;
  }
  if (requestCount >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((WINDOW_MS - (now - windowStart)) / 1000),
    };
  }
  requestCount++;
  return { allowed: true };
}

const UTM_PARAMS = "?utm_source=mongohacks&utm_medium=referral";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const userRole = (session.user as { role?: string }).role;
    const cookieStore = await cookies();
    const isImpersonating = !!cookieStore.get("impersonate_user_id")?.value;
    if (
      !isImpersonating &&
      userRole !== "admin" &&
      userRole !== "organizer" &&
      userRole !== "super_admin"
    ) {
      return errorResponse("Forbidden", 403);
    }

    if (!UNSPLASH_ACCESS_KEY) {
      return errorResponse("Unsplash API not configured", 503);
    }

    const query = request.nextUrl.searchParams.get("query");
    if (!query) {
      return errorResponse("Query parameter required", 400);
    }

    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      if (
        response.status === 403 &&
        response.headers.get("X-Ratelimit-Remaining") === "0"
      ) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again later." },
          {
            status: 429,
            headers: { "Retry-After": "3600" },
          }
        );
      }
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data: UnsplashSearchResponse = await response.json();

    const photos: UnsplashSearchResult[] = data.results.map((photo) => ({
      id: photo.id,
      width: photo.width,
      height: photo.height,
      description: photo.description ?? photo.alt_description,
      urls: {
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb,
      },
      user: {
        name: photo.user.name,
        profileUrl: `${photo.user.links.html}${UTM_PARAMS}`,
      },
      photoUrl: `${photo.links.html}${UTM_PARAMS}`,
      downloadLocation: photo.links.download_location,
    }));

    return successResponse({
      photos,
      total: data.total,
      totalPages: data.total_pages,
    });
  } catch (error) {
    apiLogger.error(
      { err: error },
      "GET /api/admin/unsplash/search error"
    );
    return errorResponse("Failed to search photos", 500);
  }
}
