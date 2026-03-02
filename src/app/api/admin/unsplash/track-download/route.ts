import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";
import { apiLogger } from "@/lib/logger";
import { getUnsplashAccessKey } from "@/lib/unsplash";

export async function POST(request: NextRequest) {
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

    const unsplashKey = await getUnsplashAccessKey();
    if (!unsplashKey) {
      return errorResponse("Unsplash API not configured", 503);
    }

    const { downloadLocation } = await request.json();

    if (
      !downloadLocation ||
      typeof downloadLocation !== "string" ||
      !downloadLocation.startsWith("https://api.unsplash.com/")
    ) {
      return errorResponse("Invalid download location", 400);
    }

    await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${unsplashKey}`,
      },
    });

    return successResponse({ tracked: true });
  } catch (error) {
    apiLogger.error(
      { err: error },
      "POST /api/admin/unsplash/track-download error"
    );
    return errorResponse("Failed to track download", 500);
  }
}
