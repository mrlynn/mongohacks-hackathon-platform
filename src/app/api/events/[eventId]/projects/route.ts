import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ProjectModel } from "@/lib/db/models/Project";
import { TeamModel } from "@/lib/db/models/Team";

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

    // Find user's team for this event
    const team = await TeamModel.findOne({
      eventId,
      members: session.user.id,
    }).populate("members");

    if (!team) {
      return NextResponse.json(
        { success: false, error: "You must be in a team to submit a project" },
        { status: 400 }
      );
    }

    // Check if team already has a project for this event
    const existingProject = await ProjectModel.findOne({
      eventId,
      teamId: team._id,
    });

    if (existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: "Your team already has a project for this event",
        },
        { status: 400 }
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
