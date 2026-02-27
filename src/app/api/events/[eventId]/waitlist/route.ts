import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import mongoose, { Schema } from "mongoose";

// Simple waitlist schema — stored inline, no separate model file needed
const WaitlistEntrySchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

WaitlistEntrySchema.index({ eventId: 1, email: 1 }, { unique: true });

const WaitlistModel =
  mongoose.models.WaitlistEntry ||
  mongoose.model("WaitlistEntry", WaitlistEntrySchema);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectToDatabase();
    const { eventId } = await params;
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Upsert to prevent duplicates
    await WaitlistModel.findOneAndUpdate(
      { eventId, email: email.toLowerCase() },
      { $set: { name, email: email.toLowerCase(), eventId } },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Added to waitlist successfully",
    });
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
