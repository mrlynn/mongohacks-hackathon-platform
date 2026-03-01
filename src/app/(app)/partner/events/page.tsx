import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEffectivePartnerId } from "@/lib/partner-context";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerModel } from "@/lib/db/models/Partner";
import { EventModel } from "@/lib/db/models/Event";
import { PrizeModel } from "@/lib/db/models/Prize";
import PartnerEventsClient from "./PartnerEventsClient";

export interface PartnerEventDetail {
  _id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  capacity: number;
  prizeCount: number;
}

async function getPartnerEvents(partnerId: string): Promise<PartnerEventDetail[]> {
  await connectToDatabase();

  const partner = await PartnerModel.findById(partnerId)
    .select("engagement.eventsParticipated")
    .lean();

  if (!partner) return [];

  const eventIds = partner.engagement?.eventsParticipated || [];
  const events = await EventModel.find({ _id: { $in: eventIds } })
    .select("name description status startDate endDate location isVirtual capacity")
    .sort({ startDate: -1 })
    .lean();

  // Get prize counts per event for this partner
  const prizes = await PrizeModel.find({
    partnerId,
    eventId: { $in: eventIds },
  })
    .select("eventId")
    .lean();

  const prizeCountByEvent: Record<string, number> = {};
  for (const p of prizes) {
    const eid = p.eventId.toString();
    prizeCountByEvent[eid] = (prizeCountByEvent[eid] || 0) + 1;
  }

  return events.map((e) => ({
    _id: e._id.toString(),
    name: e.name,
    description: e.description || "",
    status: e.status,
    startDate: e.startDate?.toISOString() || "",
    endDate: e.endDate?.toISOString() || "",
    location: e.location || "",
    isVirtual: e.isVirtual || false,
    capacity: e.capacity || 0,
    prizeCount: prizeCountByEvent[e._id.toString()] || 0,
  }));
}

export default async function PartnerEventsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const partnerId = await getEffectivePartnerId();
  if (!partnerId) redirect("/partner");

  const events = await getPartnerEvents(partnerId);

  return <PartnerEventsClient events={events} />;
}
