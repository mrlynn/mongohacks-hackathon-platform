import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { TeamModel } from "@/lib/db/models/Team";
import { TeamNoteModel } from "@/lib/db/models/TeamNote";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; teamId: string; noteId: string }> }
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
    const { teamId, noteId } = await params;
    const userId = (session.user as { id: string }).id;

    // Verify membership
    const team = await TeamModel.findById(teamId).lean();
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    const isMember = (team.members as any[])?.some(
      (m: any) => m.toString() === userId
    );
    if (!isMember) {
      return NextResponse.json(
        { success: false, error: "Not a team member" },
        { status: 403 }
      );
    }

    const note = await TeamNoteModel.findOne({ _id: noteId, teamId });
    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    // Only author or team leader can edit
    const isAuthor = note.authorId.toString() === userId;
    const isLeader = (team.leaderId as any)?.toString() === userId;
    if (!isAuthor && !isLeader) {
      return NextResponse.json(
        { success: false, error: "Only the author or team leader can edit this note" },
        { status: 403 }
      );
    }

    const { content } = await request.json();
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

    note.content = content.trim();
    note.editedAt = new Date();
    await note.save();

    const populatedNote = await TeamNoteModel.findById(note._id)
      .populate("authorId", "name email")
      .lean();

    return NextResponse.json({ success: true, note: populatedNote });
  } catch (error) {
    console.error("Error editing team note:", error);
    return NextResponse.json(
      { success: false, error: "Failed to edit note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string; teamId: string; noteId: string }> }
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
    const { teamId, noteId } = await params;
    const userId = (session.user as { id: string }).id;

    const team = await TeamModel.findById(teamId).lean();
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    const isMember = (team.members as any[])?.some(
      (m: any) => m.toString() === userId
    );
    if (!isMember) {
      return NextResponse.json(
        { success: false, error: "Not a team member" },
        { status: 403 }
      );
    }

    const note = await TeamNoteModel.findOne({ _id: noteId, teamId });
    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" },
        { status: 404 }
      );
    }

    // Only author or team leader can delete
    const isAuthor = note.authorId.toString() === userId;
    const isLeader = (team.leaderId as any)?.toString() === userId;
    if (!isAuthor && !isLeader) {
      return NextResponse.json(
        { success: false, error: "Only the author or team leader can delete this note" },
        { status: 403 }
      );
    }

    // Cascade delete: remove the note and all its replies
    await TeamNoteModel.deleteMany({
      $or: [{ _id: noteId }, { parentNoteId: noteId }],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team note:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
