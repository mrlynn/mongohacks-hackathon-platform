import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { PartnerModel } from "@/lib/db/models/Partner";
import { EventModel } from "@/lib/db/models/Event";
import { PrizeModel } from "@/lib/db/models/Prize";
import { getEffectivePartnerId, isAdminViewer } from "@/lib/partner-context";
import PartnerDashboardClient from "./PartnerDashboardClient";
import AdminPartnerPicker from "./AdminPartnerPicker";

export interface PartnerEvent {
  _id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
}

export interface PartnerDashboardData {
  partner: {
    _id: string;
    name: string;
    tier: string;
    status: string;
    logo?: string;
  };
  events: PartnerEvent[];
  stats: {
    totalEvents: number;
    activeEvents: number;
    totalPrizes: number;
    totalContribution: number;
  };
}

async function getPartnerDashboardData(partnerId: string): Promise<PartnerDashboardData | null> {
  await connectToDatabase();

  const partner = await PartnerModel.findById(partnerId)
    .select("name tier status logo engagement")
    .lean();

  if (!partner) return null;

  // Get events this partner is involved in
  const eventIds = partner.engagement?.eventsParticipated || [];
  const events = await EventModel.find({ _id: { $in: eventIds } })
    .select("name status startDate endDate location isVirtual")
    .sort({ startDate: -1 })
    .lean();

  // Get prize count
  const prizeCount = await PrizeModel.countDocuments({ partnerId });

  const activeEvents = events.filter(
    (e) => e.status === "open" || e.status === "in_progress"
  ).length;

  return {
    partner: {
      _id: partner._id.toString(),
      name: partner.name,
      tier: partner.tier,
      status: partner.status,
      logo: partner.logo,
    },
    events: events.map((e) => ({
      _id: e._id.toString(),
      name: e.name,
      status: e.status,
      startDate: e.startDate?.toISOString() || "",
      endDate: e.endDate?.toISOString() || "",
      location: e.location || "",
      isVirtual: e.isVirtual || false,
    })),
    stats: {
      totalEvents: events.length,
      activeEvents,
      totalPrizes: prizeCount,
      totalContribution: partner.engagement?.totalContribution || 0,
    },
  };
}

async function getAllPartnersSummary() {
  await connectToDatabase();

  const partners = await PartnerModel.find()
    .select("name tier status logo engagement")
    .sort({ name: 1 })
    .lean();

  return partners.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    tier: p.tier,
    status: p.status,
    logo: p.logo,
    eventCount: p.engagement?.eventsParticipated?.length || 0,
  }));
}

export default async function PartnerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const partnerId = await getEffectivePartnerId();
  const isAdmin = await isAdminViewer();

  // Admin without a selected partner: show partner picker
  if (!partnerId && isAdmin) {
    const partners = await getAllPartnersSummary();
    return <AdminPartnerPicker partners={partners} />;
  }

  // Non-admin without partnerId: can't access
  if (!partnerId) {
    redirect("/dashboard");
  }

  const data = await getPartnerDashboardData(partnerId);
  if (!data) redirect("/dashboard");

  return <PartnerDashboardClient data={data} isAdmin={isAdmin} />;
}
