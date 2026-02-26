import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { TeamModel } from "@/lib/db/models/Team";
import { ProjectModel } from "@/lib/db/models/Project";
import { serializeDoc, serializeDocs } from "@/lib/utils/serialize";

// Calculate next milestone based on event state and participant progress
function calculateNextMilestone(
  event: any,
  participant: any,
  team: any,
  project: any
) {
  const now = new Date();

  // Pre-event
  if (now < new Date(event.startDate)) {
    if (!team) {
      return {
        title: "Join or create a team",
        description: "Team formation ends when the event starts",
        deadline: event.startDate,
        action: "browse-teams",
        priority: "high",
        icon: "group",
      };
    }
    return {
      title: "Prepare for hacking",
      description: "Event starts soon - coordinate with your team",
      deadline: event.startDate,
      action: "view-resources",
      priority: "medium",
      icon: "schedule",
    };
  }

  // During event (before submission deadline)
  if (
    now >= new Date(event.startDate) &&
    now < new Date(event.submissionDeadline || event.endDate)
  ) {
    if (!project) {
      return {
        title: "Start building your project",
        description: "Submission deadline approaching",
        deadline: event.submissionDeadline || event.endDate,
        action: "create-project",
        priority: "high",
        icon: "code",
      };
    }
    if (project.status === "draft") {
      return {
        title: "Submit your project",
        description: "Submit before the deadline for judging",
        deadline: event.submissionDeadline || event.endDate,
        action: "submit-project",
        priority: "high",
        icon: "send",
      };
    }
    return {
      title: "Project submitted!",
      description: "You can still edit until the deadline",
      deadline: event.submissionDeadline || event.endDate,
      action: "edit-project",
      priority: "low",
      icon: "check_circle",
    };
  }

  // After submission deadline (judging period)
  if (
    now >= new Date(event.submissionDeadline || event.endDate) &&
    now < new Date(event.endDate)
  ) {
    return {
      title: "Prepare for judging",
      description: "Judges are reviewing projects",
      deadline: event.endDate,
      action: "view-project",
      priority: "medium",
      icon: "gavel",
    };
  }

  // After event
  return {
    title: "Event complete",
    description: "Check results and judge feedback",
    deadline: null,
    action: "view-results",
    priority: "low",
    icon: "emoji_events",
  };
}

// Get upcoming schedule items (next 24 hours)
function getUpcomingSchedule(event: any) {
  if (!event.schedule || event.schedule.length === 0) {
    return [];
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return event.schedule
    .filter((item: any) => {
      const itemStart = new Date(item.start);
      return itemStart > now && itemStart < tomorrow;
    })
    .slice(0, 5); // Max 5 items
}

// Calculate current event phase
function getCurrentPhase(event: any) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const registrationDeadline = new Date(
    event.registrationDeadline || event.startDate
  );
  const submissionDeadline = new Date(
    event.submissionDeadline || event.endDate
  );

  if (now < registrationDeadline) {
    return {
      name: "Registration Open",
      progress: 0,
      color: "info",
    };
  }
  if (now < startDate) {
    return {
      name: "Team Formation",
      progress: 25,
      color: "warning",
    };
  }
  if (now < submissionDeadline) {
    return {
      name: "Hacking",
      progress: 50,
      color: "success",
    };
  }
  if (now < endDate) {
    return {
      name: "Judging",
      progress: 75,
      color: "primary",
    };
  }
  return {
    name: "Results",
    progress: 100,
    color: "secondary",
  };
}

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

    await connectToDatabase();
    const { eventId } = await params;
    const userId = (session.user as { id: string }).id;

    // 1. Get participant
    const participant = await ParticipantModel.findOne({
      userId,
      "registeredEvents.eventId": eventId,
    }).lean();

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          error: "Not registered for this event",
          message: "You must register for this event first",
        },
        { status: 403 }
      );
    }

    // 2. Get event with related data
    const event = await EventModel.findById(eventId).lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // 3. Get team (if joined)
    let team = null;
    if (participant.teamId) {
      team = await TeamModel.findById(participant.teamId)
        .populate("members", "name email")
        .populate("leaderId", "name email")
        .lean();
    }

    // 4. Get project (if exists)
    let project = null;
    if (team) {
      project = await ProjectModel.findOne({
        teamId: team._id,
        eventId,
      }).lean();
    }

    // 5. Get recommended teams (if no team)
    let recommendedTeams: any[] = [];
    if (!team) {
      // Simple recommendation: teams looking for members, not full
      recommendedTeams = await TeamModel.find({
        eventId,
        lookingForMembers: true,
        $expr: { $lt: [{ $size: "$members" }, "$maxMembers"] },
      })
        .populate("members", "name")
        .populate("leaderId", "name")
        .limit(5)
        .lean();
    }

    // 6. Calculate next milestone
    const nextMilestone = calculateNextMilestone(
      event,
      participant,
      team,
      project
    );

    // 7. Get upcoming schedule
    const upcomingSchedule = getUpcomingSchedule(event);

    // 8. Get current phase
    const currentPhase = getCurrentPhase(event);

    // 9. Calculate participant status
    const participantStatus = {
      registered: true,
      hasTeam: !!team,
      hasProject: !!project,
      projectSubmitted: project?.status === "submitted",
    };

    // Serialize all data
    const response = {
      success: true,
      event: serializeDoc(event),
      participant: serializeDoc(participant),
      team: team ? serializeDoc(team) : null,
      project: project ? serializeDoc(project) : null,
      recommendedTeams: serializeDocs(recommendedTeams),
      nextMilestone,
      upcomingSchedule,
      currentPhase,
      participantStatus,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching hub data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch hub data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
