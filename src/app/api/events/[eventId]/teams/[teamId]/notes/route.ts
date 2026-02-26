import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { TeamNoteModel } from "@/lib/db/models/TeamNote";

async function verifyTeamMembership(userId: string, teamId: string) {
  const team = await TeamModel.findById(teamId).lean();
  if (!team) return null;
  const isMember = team.members?.some(
    (m: any) => m.toString() === userId
  );
  return isMember ? team : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { teamId } = await params;
    const userId = (session.user as { id: string }).id;

    const team = await verifyTeamMembership(userId, teamId);
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found or you are not a member" },
        { status: 403 }
      );
    }

    const notes = await TeamNoteModel.find({ teamId })
      .populate("authorId", "name email")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error("Error fetching team notes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { eventId, teamId } = await params;
    const userId = (session.user as { id: string }).id;

    const team = await verifyTeamMembership(userId, teamId);
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found or you are not a member" },
        { status: 403 }
      );
    }

    const { content, parentNoteId } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Content must be 2000 characters or less" },
        { status: 400 }
      );
    }

    // Verify parent note exists and belongs to same team
    if (parentNoteId) {
      const parentNote = await TeamNoteModel.findOne({
        _id: parentNoteId,
        teamId,
      });
      if (!parentNote) {
        return NextResponse.json(
          { success: false, error: "Parent note not found" },
          { status: 404 }
        );
      }
    }

    const note = await TeamNoteModel.create({
      teamId,
      authorId: userId,
      content: content.trim(),
      parentNoteId: parentNoteId || null,
    });

    // Populate the author for the response
    const populatedNote = await TeamNoteModel.findById(note._id)
      .populate("authorId", "name email")
      .lean();

    // Fire-and-forget: notify other team members
    const { notifyTeamNotePosted } = await import(
      "@/lib/notifications/notification-service"
    );
    const otherMembers = (team.members as any[])
      .map((m: any) => m.toString())
      .filter((id: string) => id !== userId);
    const authorName = session.user.name || "A team member";
    notifyTeamNotePosted(otherMembers, authorName, team.name as string, eventId);

    return NextResponse.json({ success: true, note: populatedNote });
  } catch (error) {
    console.error("Error creating team note:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create note" },
      { status: 500 }
    );
  }
}
