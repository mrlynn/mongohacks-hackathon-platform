import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { TeamModel } from "@/lib/db/models/Team";
import { ParticipantModel } from "@/lib/db/models/Participant";

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

    await connectToDatabase();
    const { eventId } = await params;
    const body = await request.json();
    const userId = (session.user as { id: string }).id;

    // Validation 1: Check if user is registered for this event
    const participant = await ParticipantModel.findOne({
      userId,
      "registeredEvents.eventId": eventId,
    });

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be registered for this event to submit a project",
        },
        { status: 403 }
      );
    }

    // Validation 2: Check if user is in a team
    const team = await TeamModel.findOne({
      eventId,
      members: userId,
    }).populate("members");

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "You must join a team before submitting a project",
        },
        { status: 403 }
      );
    }

    // Validation 3: Check if team already has a project for this event
    const existingProject = await ProjectModel.findOne({
      eventId,
      teamId: team._id,
    });

    if (existingProject) {
      return NextResponse.json(
        {
          success: false,
          message: "Your team already has a project for this event",
        },
        { status: 409 }
      );
    }

    // Validation 4: Validate URLs (if provided)
    const urlRegex = /^https?:\/\/.+/;
    
    if (body.repoUrl) {
      const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+/;
      if (!githubUrlRegex.test(body.repoUrl)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid GitHub repository URL",
            message:
              "GitHub URL must be in format: https://github.com/username/repo",
            suggestion: "Example: https://github.com/mongodb/mongo",
          },
          { status: 422 }
        );
      }
    }

    if (body.demoUrl && !urlRegex.test(body.demoUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid demo URL",
          message: "Demo URL must start with http:// or https://",
        },
        { status: 422 }
      );
    }

    if (body.videoUrl && !urlRegex.test(body.videoUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid video URL",
          message: "Video URL must start with http:// or https://",
        },
        { status: 422 }
      );
    }

    // Create project
    const project = new ProjectModel({
      ...body,
      eventId,
      teamId: team._id,
      teamMembers: team.members.map((m: any) => m._id),
    });

    await project.save();

    return NextResponse.json({
      success: true,
      project: {
        ...project.toObject(),
        _id: project._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectToDatabase();
    const { eventId } = await params;

    const projects = await ProjectModel.find({ eventId, status: "submitted" })
      .populate("teamId", "name")
      .populate("teamMembers", "name email")
      .sort({ submissionDate: -1 });

    return NextResponse.json({
      success: true,
      projects: projects.map((project) => ({
        ...project.toObject(),
        _id: project._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
