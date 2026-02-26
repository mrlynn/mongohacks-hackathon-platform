import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { EventModel } from "@/lib/db/models/Event";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  await connectToDatabase();

  // Check if user has exactly one active event — redirect directly to its hub
  const participant = await ParticipantModel.findOne({ userId }).lean();

  if (participant?.registeredEvents?.length === 1) {
    const eventId = participant.registeredEvents[0].eventId.toString();
    const event = await EventModel.findById(eventId).select("status").lean();

    // Only redirect for active events (open or in_progress)
    if (event && (event.status === "open" || event.status === "in_progress")) {
      redirect(`/events/${eventId}/hub`);
    }
  }

  return <DashboardClient />;
}
