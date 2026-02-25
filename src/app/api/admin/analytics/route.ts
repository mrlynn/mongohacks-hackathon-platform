import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/admin-guard";
import { UserModel } from "@/lib/db/models/User";
import { EventModel } from "@/lib/db/models/Event";
import { ProjectModel } from "@/lib/db/models/Project";
import { TeamModel } from "@/lib/db/models/Team";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { PartnerModel } from "@/lib/db/models/Partner";
import { PrizeModel } from "@/lib/db/models/Prize";
import { ScoreModel } from "@/lib/db/models/Score";

export async function GET() {
  try {
  await requireAdmin();
  await connectToDatabase();

  const [
    // Overview counts
    totalUsers,
    totalEvents,
    totalProjects,
    totalTeams,
    totalPartners,
    totalParticipants,
    totalPrizes,
    totalScores,

    // User breakdowns
    usersByRole,

    // Event breakdowns
    eventsByStatus,
    eventsByVirtual,
    eventsByMonth,
    eventCapacityData,
    eventsByCountry,

    // Participant breakdowns
    participantsByExperience,
    topSkills,
    attendanceStatus,
    registrationsByMonth,

    // Project breakdowns
    projectsByStatus,
    projectsByCategory,
    topTechnologies,
    projectsByMonth,

    // Team breakdowns
    teamsByStatus,
    teamSizeDistribution,

    // Partner breakdowns
    partnersByTier,
    partnersByStatus,
    partnersByIndustry,
    partnersByEngagement,
    totalContributions,

    // Prize breakdowns
    prizesByCategory,
    totalPrizeValue,
    prizesAwarded,

    // Score breakdowns
    scoreAverages,
    scoreDistribution,
  ] = await Promise.all([
    // --- Overview counts ---
    UserModel.countDocuments(),
    EventModel.countDocuments(),
    ProjectModel.countDocuments(),
    TeamModel.countDocuments(),
    PartnerModel.countDocuments(),
    ParticipantModel.countDocuments(),
    PrizeModel.countDocuments(),
    ScoreModel.countDocuments(),

    // --- User breakdowns ---
    UserModel.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // --- Event breakdowns ---
    EventModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    EventModel.aggregate([
      {
        $group: {
          _id: "$isVirtual",
          count: { $sum: 1 },
        },
      },
    ]),
    EventModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$startDate" },
            month: { $month: "$startDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),
    EventModel.aggregate([
      {
        $lookup: {
          from: "participants",
          let: { eventId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$eventId", "$registeredEvents.eventId"],
                },
              },
            },
            { $count: "total" },
          ],
          as: "registrations",
        },
      },
      {
        $project: {
          name: 1,
          capacity: 1,
          registered: {
            $ifNull: [{ $arrayElemAt: ["$registrations.total", 0] }, 0],
          },
        },
      },
    ]),
    EventModel.aggregate([
      { $match: { country: { $exists: true, $ne: null } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // --- Participant breakdowns ---
    ParticipantModel.aggregate([
      { $group: { _id: "$experience_level", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ParticipantModel.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]),
    ParticipantModel.aggregate([
      { $unwind: "$registeredEvents" },
      { $group: { _id: "$registeredEvents.status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ParticipantModel.aggregate([
      { $unwind: "$registeredEvents" },
      {
        $group: {
          _id: {
            year: { $year: "$registeredEvents.registrationDate" },
            month: { $month: "$registeredEvents.registrationDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),

    // --- Project breakdowns ---
    ProjectModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ProjectModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ProjectModel.aggregate([
      { $unwind: "$technologies" },
      { $group: { _id: "$technologies", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]),
    ProjectModel.aggregate([
      { $match: { submissionDate: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: {
            year: { $year: "$submissionDate" },
            month: { $month: "$submissionDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),

    // --- Team breakdowns ---
    TeamModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    TeamModel.aggregate([
      {
        $project: {
          memberCount: { $size: "$members" },
        },
      },
      { $group: { _id: "$memberCount", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // --- Partner breakdowns ---
    PartnerModel.aggregate([
      { $group: { _id: "$tier", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    PartnerModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    PartnerModel.aggregate([
      { $group: { _id: "$industry", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    PartnerModel.aggregate([
      {
        $group: {
          _id: "$engagement.engagementLevel",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
    PartnerModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$engagement.totalContribution" },
        },
      },
    ]),

    // --- Prize breakdowns ---
    PrizeModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    PrizeModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$monetaryValue" },
        },
      },
    ]),
    PrizeModel.aggregate([
      { $unwind: "$winners" },
      { $count: "total" },
    ]),

    // --- Score breakdowns ---
    ScoreModel.aggregate([
      {
        $group: {
          _id: null,
          avgInnovation: { $avg: "$scores.innovation" },
          avgTechnical: { $avg: "$scores.technical" },
          avgImpact: { $avg: "$scores.impact" },
          avgPresentation: { $avg: "$scores.presentation" },
          avgTotal: { $avg: "$totalScore" },
        },
      },
    ]),
    ScoreModel.aggregate([
      {
        $bucket: {
          groupBy: "$totalScore",
          boundaries: [0, 10, 20, 30, 40, 41],
          default: "other",
          output: { count: { $sum: 1 } },
        },
      },
    ]),
  ]);

  const monthNames = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const formatMonthly = (data: Array<{ _id: { year: number; month: number }; count: number }>) =>
    data.map((d) => ({
      month: `${monthNames[d._id.month]} ${d._id.year}`,
      count: d.count,
    }));

  const formatGrouped = (data: Array<{ _id: string | null; count: number }>) =>
    data.map((d) => ({
      name: d._id || "Unknown",
      value: d.count,
    }));

  return NextResponse.json({
    overview: {
      totalUsers,
      totalEvents,
      totalProjects,
      totalTeams,
      totalPartners,
      totalParticipants,
      totalPrizes,
      totalScores,
      totalPrizeValue: totalPrizeValue[0]?.total || 0,
      totalContributions: totalContributions[0]?.total || 0,
      prizesAwarded: prizesAwarded[0]?.total || 0,
    },
    users: {
      byRole: formatGrouped(usersByRole),
    },
    events: {
      byStatus: formatGrouped(eventsByStatus),
      byFormat: eventsByVirtual.map((d) => ({
        name: d._id ? "Virtual" : "In-Person",
        value: d.count,
      })),
      byMonth: formatMonthly(eventsByMonth),
      capacityUtilization: eventCapacityData.map((e) => ({
        name: e.name?.substring(0, 20) || "Unnamed",
        capacity: e.capacity,
        registered: e.registered,
        utilization: e.capacity
          ? Math.round((e.registered / e.capacity) * 100)
          : 0,
      })),
      byCountry: formatGrouped(eventsByCountry),
    },
    participants: {
      byExperience: formatGrouped(participantsByExperience),
      topSkills: formatGrouped(topSkills),
      attendanceStatus: formatGrouped(attendanceStatus),
      registrationsByMonth: formatMonthly(registrationsByMonth),
    },
    projects: {
      byStatus: formatGrouped(projectsByStatus),
      byCategory: formatGrouped(projectsByCategory),
      topTechnologies: formatGrouped(topTechnologies),
      submissionsByMonth: formatMonthly(projectsByMonth),
    },
    teams: {
      byStatus: formatGrouped(teamsByStatus),
      sizeDistribution: teamSizeDistribution.map((d) => ({
        name: `${d._id} members`,
        value: d.count,
      })),
    },
    partners: {
      byTier: formatGrouped(partnersByTier),
      byStatus: formatGrouped(partnersByStatus),
      byIndustry: formatGrouped(partnersByIndustry),
      byEngagement: formatGrouped(partnersByEngagement),
    },
    prizes: {
      byCategory: formatGrouped(prizesByCategory),
    },
    scores: {
      averages: scoreAverages[0]
        ? {
            innovation: +(scoreAverages[0].avgInnovation || 0).toFixed(1),
            technical: +(scoreAverages[0].avgTechnical || 0).toFixed(1),
            impact: +(scoreAverages[0].avgImpact || 0).toFixed(1),
            presentation: +(scoreAverages[0].avgPresentation || 0).toFixed(1),
            total: +(scoreAverages[0].avgTotal || 0).toFixed(1),
          }
        : null,
      distribution: scoreDistribution
        .filter((d) => d._id !== "other")
        .map((d) => ({
          range: `${d._id}-${(d._id as number) + 9}`,
          count: d.count,
        })),
    },
  });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
