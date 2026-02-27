export const dynamic = "force-dynamic";

import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { serializeDocs } from "@/lib/utils/serialize";
import EventsPageClient from "./EventsPageClient";

async function getEvents() {
  await connectToDatabase();
  const events = await EventModel.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return serializeDocs(events);
}

export default async function AdminEventsPage() {
  const events = await getEvents();
  return <EventsPageClient events={events} />;
}
