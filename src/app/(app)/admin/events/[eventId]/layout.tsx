import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import EventTabsNav from "./EventTabsNav";

export default async function EventDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  await connectToDatabase();
  const event = await EventModel.findById(eventId)
    .select("name status")
    .lean();

  return (
    <>
      <EventTabsNav
        eventId={eventId}
        eventName={(event as any)?.name || "Event"}
        eventStatus={(event as any)?.status || "draft"}
      />
      {children}
    </>
  );
}
