import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import EventsPageClient from "./EventsPageClient";

async function getEvents() {
  await connectToDatabase();
  const events = await EventModel.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    startDate: event.startDate?.toISOString() || new Date().toISOString(),
    endDate: event.endDate?.toISOString() || new Date().toISOString(),
    registrationDeadline: event.registrationDeadline?.toISOString() || new Date().toISOString(),
    createdAt: event.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: event.updatedAt?.toISOString() || new Date().toISOString(),
  }));
}

export default async function AdminEventsPage() {
  const events = await getEvents();
  return <EventsPageClient events={events} />;
}
