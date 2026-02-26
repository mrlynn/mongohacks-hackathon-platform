import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { auth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const userRole = (session.user as { role?: string }).role;
    // Check impersonation cookie directly — more reliable than reading it
    // inside NextAuth's session callback which may not have request context.
    // Only admins can start an impersonation session, so cookie presence
    // is sufficient proof of admin identity.
    const cookieStore = await cookies();
    const isImpersonating = !!cookieStore.get("impersonate_user_id")?.value;
    if (!isImpersonating && userRole !== "admin" && userRole !== "organizer" && userRole !== "super_admin") {
      return errorResponse("Forbidden", 403);
    }

    const { eventId } = await params;
    const body = await request.json();

    await connectToDatabase();

    // Check if slug is already taken by another event
    if (body.slug) {
      const existing = await EventModel.findOne({
        "landingPage.slug": body.slug,
        _id: { $ne: eventId },
      });

      if (existing) {
        return errorResponse(
          "This URL slug is already in use by another event",
          409
        );
      }
    }

    // First fetch the existing event to preserve registrationFormConfig
    const existingEvent = await EventModel.findById(eventId).lean();
    const existingFormConfig = existingEvent?.landingPage?.registrationFormConfig;

    const event = await EventModel.findByIdAndUpdate(
      eventId,
      {
        $set: {
          "landingPage.template": body.template || "modern",
          "landingPage.slug": body.slug,
          "landingPage.published": body.published || false,
          "landingPage.customContent": body.customContent || {},
          // Preserve existing registrationFormConfig — it's managed by the event edit page
          ...(existingFormConfig && {
            "landingPage.registrationFormConfig": existingFormConfig,
          }),
        },
      },
      { new: true }
    );

    if (!event) {
      return errorResponse("Event not found", 404);
    }

    return successResponse({
      message: "Landing page updated successfully",
      event,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/events/[eventId]/landing-page error:", error);
    // MongoDB duplicate key on slug unique index
    if (error?.code === 11000) {
      return errorResponse("This URL slug is already in use by another event", 409);
    }
    return errorResponse("Failed to update landing page", 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { eventId } = await params;
    await connectToDatabase();

    const event = await EventModel.findById(eventId).lean();

    if (!event) {
      return errorResponse("Event not found", 404);
    }

    return successResponse({ landingPage: event.landingPage || null });
  } catch (error) {
    console.error("GET /api/admin/events/[eventId]/landing-page error:", error);
    return errorResponse("Failed to fetch landing page", 500);
  }
}
