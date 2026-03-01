import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEffectivePartnerId } from "@/lib/partner-context";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerModel } from "@/lib/db/models/Partner";
import { EventModel } from "@/lib/db/models/Event";
import { PrizeModel } from "@/lib/db/models/Prize";
import { ProjectModel } from "@/lib/db/models/Project";
import PartnerEventDetailClient from "./PartnerEventDetailClient";

interface Props {
  params: Promise<{ eventId: string }>;
}

async function getEventDetail(partnerId: string, eventId: string) {
  await connectToDatabase();

  // Verify partner has access to this event
  const partner = await PartnerModel.findById(partnerId)
    .select("engagement.eventsParticipated name")
    .lean();

  if (!partner) return null;

  const hasAccess = partner.engagement?.eventsParticipated?.some(
    (eid: { toString: () => string }) => eid.toString() === eventId
  );
  if (!hasAccess) return null;

  const event = await EventModel.findById(eventId)
    .select("name description status startDate endDate location isVirtual capacity theme tags rules")
    .lean();

  if (!event) return null;

  const prizes = await PrizeModel.find({ eventId, partnerId })
    .sort({ displayOrder: 1 })
    .lean();

  const projectCount = await ProjectModel.countDocuments({ eventId });

  return {
    event: {
      _id: event._id.toString(),
      name: event.name,
      description: event.description || "",
      status: event.status,
      startDate: event.startDate?.toISOString() || "",
      endDate: event.endDate?.toISOString() || "",
      location: event.location || "",
      isVirtual: event.isVirtual || false,
      capacity: event.capacity || 0,
      theme: event.theme || "",
      tags: event.tags || [],
    },
    prizes: prizes.map((p) => ({
      _id: p._id.toString(),
      title: p.title,
      description: p.description,
      category: p.category,
      value: p.value || "",
      monetaryValue: p.monetaryValue || 0,
      isActive: p.isActive,
      winnersCount: p.winners?.length || 0,
    })),
    projectCount,
    partnerName: partner.name,
  };
}

export default async function PartnerEventDetailPage({ params }: Props) {
  const { eventId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const partnerId = await getEffectivePartnerId();
  if (!partnerId) redirect("/partner");

  const data = await getEventDetail(partnerId, eventId);
  if (!data) redirect("/partner/events");

  return <PartnerEventDetailClient data={data} />;
}
