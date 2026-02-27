import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { TeamModel } from "@/lib/db/models/Team";
import { EventModel } from "@/lib/db/models/Event";
import { generateProjectSummary } from "@/lib/ai/summary-service";
import { notifyProjectSubmitted } from "@/lib/notifications/notification-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; projectId: string }> }
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
    const { eventId, projectId } = await params;

    const project = await ProjectModel.findOne({
      _id: projectId,
      eventId,
    }).populate("teamId", "name members leaderId");

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("GET /api/events/[eventId]/projects/[projectId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; projectId: string }> }
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
    const { eventId, projectId } = await params;
    const body = await request.json();
    const userId = (session.user as { id: string }).id;

    // Get the project
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Check deadline
    const event = await EventModel.findById(eventId);
    if (event) {
      const deadline = event.submissionDeadline || event.endDate;
      if (deadline && new Date() > new Date(deadline)) {
        return NextResponse.json(
          { success: false, error: "Submission deadline has passed" },
          { status: 400 }
        );
      }
    }

    // Verify user is on the team
    const team = await TeamModel.findOne({
      _id: project.teamId,
      eventId,
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Check if user is a team member
    const isMember = team.members.some(
      (memberId: any) => memberId.toString() === userId
    );

    if (!isMember) {
      return NextResponse.json(
        { success: false, error: "You must be a team member to edit this project" },
        { status: 403 }
      );
    }

    // Cannot edit submitted projects (must unsubmit first)
    if (project.status === "submitted" && !body._allowSubmittedEdit) {
      return NextResponse.json(
        { success: false, error: "Unsubmit the project before making changes" },
        { status: 400 }
      );
    }

    // Allow updates to these fields
    const allowedUpdates = [
      'name', 'description', 'repoUrl', 'demoUrl', 'documentationUrl',
      'category', 'technologies', 'innovations',
    ];
    const updates: Record<string, unknown> = {};

    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Validate repo URL if provided
    if (updates.repoUrl) {
      const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+/;
      if (!githubUrlRegex.test(updates.repoUrl as string)) {
        return NextResponse.json(
          { success: false, error: "Invalid GitHub repository URL" },
          { status: 422 }
        );
      }
    }

    // Apply updates
    updates.lastModified = new Date();
    Object.assign(project, updates);
    await project.save();

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("PATCH /api/events/[eventId]/projects/[projectId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; projectId: string }> }
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
    const { eventId, projectId } = await params;
    const body = await request.json();
    const userId = (session.user as { id: string }).id;
    const { action } = body; // "submit" or "unsubmit"

    // Get the project
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Verify user is on the team
    const team = await TeamModel.findOne({
      _id: project.teamId,
      eventId,
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Check if user is a team member
    const isMember = team.members.some(
      (memberId: any) => memberId.toString() === userId
    );

    if (!isMember) {
      return NextResponse.json(
        { success: false, error: "You must be a team member to modify this project" },
        { status: 403 }
      );
    }

    // Check deadline for submit action
    if (action === "submit") {
      const event = await EventModel.findById(eventId);
      if (event) {
        const deadline = event.submissionDeadline || event.endDate;
        if (deadline && new Date() > new Date(deadline)) {
          return NextResponse.json(
            { success: false, error: "Submission deadline has passed" },
            { status: 400 }
          );
        }
      }
    }

    if (action === "submit") {
      // Submit the project
      if (project.status === "submitted") {
        return NextResponse.json(
          { success: false, error: "Project is already submitted" },
          { status: 400 }
        );
      }

      project.status = "submitted";
      project.submittedAt = new Date();
      await project.save();

      // Fire-and-forget: generate AI summary asynchronously
      if (!project.aiSummary) {
        generateProjectSummary({
          name: project.name,
          description: project.description,
          technologies: project.technologies,
          innovations: project.innovations,
        })
          .then((summary) => {
            ProjectModel.findByIdAndUpdate(projectId, { aiSummary: summary }).catch(
              () => {}
            );
          })
          .catch(() => {});
      }

      // Fire-and-forget: notify team members
      const teamMemberIds = team.members.map((m: any) => m.toString());
      notifyProjectSubmitted(teamMemberIds, project.name, eventId, projectId);

      return NextResponse.json({
        success: true,
        message: "Project submitted successfully! 🎉",
        project,
      });
    } else if (action === "unsubmit") {
      // Unsubmit the project
      if (project.status !== "submitted") {
        return NextResponse.json(
          { success: false, error: "Project is not submitted" },
          { status: 400 }
        );
      }

      project.status = "draft";
      project.submittedAt = undefined;
      await project.save();

      return NextResponse.json({
        success: true,
        message: "Project unsubmitted. You can now make changes.",
        project,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'submit' or 'unsubmit'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("POST /api/events/[eventId]/projects/[projectId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to modify project status" },
      { status: 500 }
    );
  }
}
