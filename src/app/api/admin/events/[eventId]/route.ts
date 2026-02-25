import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { PartnerModel } from "@/lib/db/models/Partner";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { eventId } = await params;
    const event = await EventModel.findById(eventId)
      .populate("partners", "name tier status logo")
      .lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { eventId } = await params;
    const deletedEvent = await EventModel.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Remove this event from all partners' eventsParticipated
    await PartnerModel.updateMany(
      { "engagement.eventsParticipated": eventId },
      { $pull: { "engagement.eventsParticipated": eventId } }
    );

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { eventId } = await params;
    const body = await request.json();

    // If partners array is being updated, sync the bidirectional relationship
    if (body.partners !== undefined) {
      const newPartnerIds: string[] = body.partners;

      // Get the current event to find existing partners
      const currentEvent = await EventModel.findById(eventId).lean();
      if (!currentEvent) {
        return NextResponse.json(
          { success: false, error: "Event not found" },
          { status: 404 }
        );
      }

      const oldPartnerIds = (currentEvent.partners || []).map((id: unknown) =>
        String(id)
      );

      // Partners that were removed from this event
      const removedPartners = oldPartnerIds.filter(
        (id: string) => !newPartnerIds.includes(id)
      );
      // Partners that were added to this event
      const addedPartners = newPartnerIds.filter(
        (id) => !oldPartnerIds.includes(id)
      );

      // Remove event from removed partners' eventsParticipated
      if (removedPartners.length > 0) {
        await PartnerModel.updateMany(
          { _id: { $in: removedPartners } },
          { $pull: { "engagement.eventsParticipated": eventId } }
        );
      }

      // Add event to added partners' eventsParticipated
      if (addedPartners.length > 0) {
        await PartnerModel.updateMany(
          { _id: { $in: addedPartners } },
          {
            $addToSet: { "engagement.eventsParticipated": eventId },
            $set: { "engagement.lastEngagementDate": new Date() },
          }
        );
      }
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}
