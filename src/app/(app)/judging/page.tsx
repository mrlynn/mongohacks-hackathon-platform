import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { JudgeAssignmentModel } from "@/lib/db/models/JudgeAssignment";
import { EventModel } from "@/lib/db/models/Event";
import { ScoreModel } from "@/lib/db/models/Score";
import JudgingLandingClient from "./JudgingLandingClient";

export interface EventAssignment {
  eventId: string;
  eventName: string;
  eventStatus: string;
  totalProjects: number;
  scoredProjects: number;
}

async function getJudgeAssignments(
  userId: string
): Promise<EventAssignment[]> {
  await connectToDatabase();

  // Get all assignments for this judge
  const assignments = await JudgeAssignmentModel.find({ judgeId: userId })
    .select("eventId projectId")
    .lean();

  if (assignments.length === 0) return [];

  // Group by event
  const eventProjectMap: Record<string, string[]> = {};
  for (const a of assignments) {
    const eid = a.eventId.toString();
    if (!eventProjectMap[eid]) eventProjectMap[eid] = [];
    eventProjectMap[eid].push(a.projectId.toString());
  }

  const eventIds = Object.keys(eventProjectMap);

  // Fetch event details
  const events = await EventModel.find({ _id: { $in: eventIds } })
    .select("name status")
    .lean();

  const eventMap: Record<string, any> = {};
  for (const e of events) {
    eventMap[e._id.toString()] = e;
  }

  // Fetch scores by this judge
  const scores = await ScoreModel.find({
    judgeId: userId,
    eventId: { $in: eventIds },
  })
    .select("eventId projectId")
    .lean();

  // Group scores by event
  const scoredByEvent: Record<string, Set<string>> = {};
  for (const s of scores) {
    const eid = s.eventId.toString();
    if (!scoredByEvent[eid]) scoredByEvent[eid] = new Set();
    scoredByEvent[eid].add(s.projectId.toString());
  }

  // Build result
  return eventIds
    .map((eid) => {
      const event = eventMap[eid];
      if (!event) return null;
      return {
        eventId: eid,
        eventName: event.name,
        eventStatus: event.status,
        totalProjects: eventProjectMap[eid].length,
        scoredProjects: scoredByEvent[eid]?.size || 0,
      };
    })
    .filter(Boolean) as EventAssignment[];
}

export default async function JudgingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;
  if (!["judge", "admin"].includes(userRole || "")) {
    redirect("/dashboard");
  }

  const userId = (session.user as { id: string }).id;
  const eventAssignments = await getJudgeAssignments(userId);

  return <JudgingLandingClient eventAssignments={eventAssignments} />;
}
