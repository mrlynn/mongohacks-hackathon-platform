import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Box, Container, CircularProgress, Alert } from "@mui/material";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { TeamModel } from "@/lib/db/models/Team";
import { ProjectModel } from "@/lib/db/models/Project";
import { serializeDoc, serializeDocs } from "@/lib/utils/serialize";
import { findMatchingTeams } from "@/lib/ai/matching-engine";
import EventHubContent from "./EventHubContent";

// Calculate next milestone
function calculateNextMilestone(event: any, participant: any, team: any, project: any) {
  const now = new Date();

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

  if (now >= new Date(event.startDate) && now < new Date(event.submissionDeadline || event.endDate)) {
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
        title: "Complete and submit your project",
        description: "Don't forget to submit before the deadline",
        deadline: event.submissionDeadline || event.endDate,
        action: "submit-project",
        priority: "high",
        icon: "send",
      };
    }
    return {
      title: "Keep working on your project",
      description: "Refine and improve before judging",
      deadline: event.submissionDeadline || event.endDate,
      action: "edit-project",
      priority: "medium",
      icon: "code",
    };
  }

  if (now < new Date(event.endDate)) {
    return {
      title: "Judging in progress",
      description: "Results will be announced soon",
      deadline: event.endDate,
      action: "view-project",
      priority: "low",
      icon: "gavel",
    };
  }

  return {
    title: "View your results",
    description: "See how your team performed",
    deadline: null,
    action: "view-results",
    priority: "low",
    icon: "emoji_events",
  };
}

// Calculate current phase
function calculateCurrentPhase(event: any) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  if (now < startDate) {
    return { name: "Registration", progress: 20, color: "info" };
  }
  if (now < new Date(event.submissionDeadline || event.endDate)) {
    return { name: "Hacking", progress: 50, color: "success" };
  }
  if (now < endDate) {
    return { name: "Judging", progress: 75, color: "primary" };
  }
  return { name: "Results", progress: 100, color: "secondary" };
}

async function getHubData(eventId: string, userId: string) {
  await connectToDatabase();

  // Get participant
  const participant = await ParticipantModel.findOne({
    userId,
    "registeredEvents.eventId": eventId,
  }).lean();

  if (!participant) {
    return { error: "Not registered for this event" };
  }

  // Get event
  const event = await EventModel.findById(eventId).lean();
  if (!event) {
    return { error: "Event not found" };
  }

  // Get team (if joined)
  let team = null;
  if (participant.teamId) {
    team = await TeamModel.findById(participant.teamId)
      .populate("members", "name email")
      .populate("leaderId", "name email")
      .lean();
  }

  // Get project (if exists)
  let project = null;
  if (team) {
    project = await ProjectModel.findOne({
      teamId: team._id,
      eventId,
    }).lean();
  }

  // Get recommended teams using vector/skill matching (if no team)
  let recommendedTeams: any[] = [];
  if (!team) {
    try {
      recommendedTeams = await findMatchingTeams(participant as any, eventId, 6);
    } catch {
      // Fallback to simple query if matching fails
      recommendedTeams = await TeamModel.find({ eventId, lookingForMembers: true })
        .populate("members", "name email")
        .populate("leaderId", "name email")
        .limit(6)
        .lean();
    }
  }

  const nextMilestone = calculateNextMilestone(event, participant, team, project);
  const currentPhase = calculateCurrentPhase(event);

  // Get upcoming schedule
  const upcomingSchedule = event.schedule?.filter((item: any) => {
    return new Date(item.startTime) > new Date();
  }).slice(0, 5) || [];

  // Participant status
  const participantStatus = {
    registered: true,
    hasTeam: !!team,
    hasProject: !!project,
    projectSubmitted: project?.status === "submitted",
  };

  return {
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
}

export default async function EventHubPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { eventId } = await params;
  const userId = (session.user as { id: string }).id;
  const data = await getHubData(eventId, userId);

  if ("error" in data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{data.error}</Alert>
      </Container>
    );
  }

  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      }
    >
      <EventHubContent data={data} eventId={eventId} />
    </Suspense>
  );
}
