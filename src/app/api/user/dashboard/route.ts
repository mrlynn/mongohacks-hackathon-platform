import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { EventModel } from "@/lib/db/models/Event";
import { TeamModel } from "@/lib/db/models/Team";
import { ProjectModel } from "@/lib/db/models/Project";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userId = (session.user as { id: string }).id;

    // Get participant profile
    const participant = await ParticipantModel.findOne({ userId }).lean();

    if (!participant) {
      return NextResponse.json({
        success: true,
        events: [],
      });
    }

    // Get all registered events with details
    const eventIds = participant.registeredEvents.map((reg: any) => reg.eventId);
    const events = await EventModel.find({ _id: { $in: eventIds } }).lean();

    // For each event, get user's team and project status
    const eventsWithStatus = await Promise.all(
      events.map(async (event) => {
        const eventId = event._id.toString();

        // Find user's team for this event
        const team = await TeamModel.findOne({
          eventId: event._id,
          members: userId,
        })
          .select("_id name members maxMembers")
          .lean();

        // Find team's project if user is on a team
        let project = null;
        if (team) {
          project = await ProjectModel.findOne({
            eventId: event._id,
            teamId: team._id,
          })
            .select("_id name status submissionDate")
            .lean();
        }

        // Get registration details
        const registration = participant.registeredEvents.find(
          (reg: any) => reg.eventId.toString() === eventId
        );

        return {
          _id: event._id.toString(),
          name: event.name,
          theme: event.theme,
          description: event.description,
          startDate: event.startDate?.toISOString() || new Date().toISOString(),
          endDate: event.endDate?.toISOString() || new Date().toISOString(),
          registrationDeadline:
            event.registrationDeadline?.toISOString() || new Date().toISOString(),
          location: event.location,
          isVirtual: event.isVirtual,
          status: event.status,
          registrationDate: registration?.registrationDate?.toISOString(),
          team: team
            ? {
                _id: team._id.toString(),
                name: team.name,
                memberCount: team.members?.length || 0,
                maxMembers: team.maxMembers,
              }
            : null,
          project: project
            ? {
                _id: project._id.toString(),
                name: project.name,
                status: project.status,
                submissionDate: project.submissionDate?.toISOString(),
              }
            : null,
        };
      })
    );

    // Sort by start date (upcoming first)
    eventsWithStatus.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return NextResponse.json({
      success: true,
      events: eventsWithStatus,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
