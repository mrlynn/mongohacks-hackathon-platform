import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { JudgeAssignmentModel } from "@/lib/db/models/JudgeAssignment";
import { ProjectModel } from "@/lib/db/models/Project";
import { UserModel } from "@/lib/db/models/User";

// GET - Fetch all assignments for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role;
    if (!["admin", "organizer"].includes(userRole || "")) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { eventId } = await params;

    const assignments = await JudgeAssignmentModel.find({ eventId })
      .populate("judgeId", "name email")
      .populate("projectId", "name teamId")
      .populate("assignedBy", "name")
      .sort({ assignedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      assignments: assignments.map((a) => ({
        ...a,
        _id: a._id.toString(),
        eventId: a.eventId.toString(),
        judgeId: a.judgeId,
        projectId: a.projectId,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/events/[eventId]/assignments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST - Create new assignments (batch)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role;
    if (!["admin", "organizer"].includes(userRole || "")) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { eventId } = await params;
    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const { judgeId, projectIds } = body;

    // Validate input
    if (!judgeId || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "judgeId and projectIds array required",
        },
        { status: 400 }
      );
    }

    // Verify judge exists and has judge role
    const judge = await UserModel.findById(judgeId);
    if (!judge) {
      return NextResponse.json(
        { success: false, error: "Judge not found" },
        { status: 404 }
      );
    }

    if (!["judge", "admin"].includes(judge.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "User must have judge or admin role",
        },
        { status: 400 }
      );
    }

    // Verify all projects exist and belong to this event
    const projects = await ProjectModel.find({
      _id: { $in: projectIds },
      eventId,
    });

    if (projects.length !== projectIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more projects not found or don't belong to this event",
        },
        { status: 404 }
      );
    }

    // Create assignments (use insertMany with ordered: false to continue on duplicates)
    const assignmentsToCreate = projectIds.map((projectId) => ({
      eventId,
      judgeId,
      projectId,
      status: "pending" as const,
      assignedBy: userId,
      assignedAt: new Date(),
    }));

    const result = await JudgeAssignmentModel.insertMany(
      assignmentsToCreate,
      { ordered: false }
    ).catch((error) => {
      // Handle duplicate key errors (E11000)
      if (error.code === 11000) {
        // Some assignments already existed, that's ok
        return error.insertedDocs || [];
      }
      throw error;
    });

    const created = Array.isArray(result) ? result.length : 0;

    return NextResponse.json({
      success: true,
      message: `Assigned ${created} project(s) to judge`,
      created,
      skipped: projectIds.length - created, // Duplicates
    });
  } catch (error) {
    console.error("POST /api/admin/events/[eventId]/assignments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create assignments" },
      { status: 500 }
    );
  }
}

// DELETE - Remove an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role;
    if (!["admin", "organizer"].includes(userRole || "")) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: "assignmentId required" },
        { status: 400 }
      );
    }

    const result = await JudgeAssignmentModel.findOneAndDelete({
      _id: assignmentId,
      eventId,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Assignment removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/events/[eventId]/assignments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
