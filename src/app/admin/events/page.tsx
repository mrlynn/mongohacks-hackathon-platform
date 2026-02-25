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
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    registrationDeadline: event.registrationDeadline.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }));
}

export default async function AdminEventsPage() {
  const events = await getEvents();
  return <EventsPageClient events={events} />;
}
