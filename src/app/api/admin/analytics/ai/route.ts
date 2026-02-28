import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { requireAdmin } from "@/lib/admin-guard";
import { AiUsageLogModel } from "@/lib/db/models/AiUsageLog";
import { UserModel } from "@/lib/db/models/User";

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      overview,
      byCategory,
      byModel,
      dailyUsage,
      topUsers,
      errorRates,
    ] = await Promise.all([
      // Overview stats
      AiUsageLogModel.aggregate([
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  totalCalls: { $sum: 1 },
                  totalTokens: { $sum: "$tokensUsed" },
                  totalCost: { $sum: "$estimatedCost" },
                  avgDuration: { $avg: "$durationMs" },
                },
              },
            ],
            today: [
              { $match: { createdAt: { $gte: todayStart } } },
              {
                $group: {
                  _id: null,
                  callsToday: { $sum: 1 },
                  tokensToday: { $sum: "$tokensUsed" },
                  costToday: { $sum: "$estimatedCost" },
                },
              },
            ],
          },
        },
      ]),

      // By category
      AiUsageLogModel.aggregate([
        {
          $group: {
            _id: "$category",
            calls: { $sum: 1 },
            tokens: { $sum: "$tokensUsed" },
            cost: { $sum: "$estimatedCost" },
            avgDuration: { $avg: "$durationMs" },
          },
        },
        { $sort: { calls: -1 } },
      ]),

      // By model
      AiUsageLogModel.aggregate([
        {
          $group: {
            _id: { model: "$model", provider: "$provider" },
            calls: { $sum: 1 },
            tokens: { $sum: "$tokensUsed" },
            cost: { $sum: "$estimatedCost" },
          },
        },
        { $sort: { calls: -1 } },
      ]),

      // Daily usage (last 30 days)
      AiUsageLogModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            calls: { $sum: 1 },
            tokens: { $sum: "$tokensUsed" },
            cost: { $sum: "$estimatedCost" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top users by consumption
      AiUsageLogModel.aggregate([
        { $match: { userId: { $ne: null } } },
        {
          $group: {
            _id: "$userId",
            calls: { $sum: 1 },
            tokens: { $sum: "$tokensUsed" },
            cost: { $sum: "$estimatedCost" },
          },
        },
        { $sort: { tokens: -1 } },
        { $limit: 10 },
      ]),

      // Error rates by category
      AiUsageLogModel.aggregate([
        {
          $group: {
            _id: "$category",
            total: { $sum: 1 },
            errors: { $sum: { $cond: ["$error", 1, 0] } },
          },
        },
      ]),
    ]);

    // Resolve user names for top users
    const userIds = topUsers.map((u: { _id: string }) => u._id);
    const users = await UserModel.find(
      { _id: { $in: userIds } },
      { name: 1, email: 1 }
    ).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const totals = overview[0]?.totals[0] || {
      totalCalls: 0,
      totalTokens: 0,
      totalCost: 0,
      avgDuration: 0,
    };
    const today = overview[0]?.today[0] || {
      callsToday: 0,
      tokensToday: 0,
      costToday: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCalls: totals.totalCalls,
          totalTokens: totals.totalTokens,
          totalCost: Math.round(totals.totalCost * 10000) / 10000,
          avgDurationMs: Math.round(totals.avgDuration || 0),
          callsToday: today.callsToday,
          tokensToday: today.tokensToday,
          costToday: Math.round(today.costToday * 10000) / 10000,
        },
        byCategory: byCategory.map(
          (c: {
            _id: string;
            calls: number;
            tokens: number;
            cost: number;
            avgDuration: number;
          }) => ({
            name: c._id,
            calls: c.calls,
            tokens: c.tokens,
            cost: Math.round(c.cost * 10000) / 10000,
            avgDuration: Math.round(c.avgDuration),
          })
        ),
        byModel: byModel.map(
          (m: {
            _id: { model: string; provider: string };
            calls: number;
            tokens: number;
            cost: number;
          }) => ({
            name: `${m._id.model} (${m._id.provider})`,
            model: m._id.model,
            provider: m._id.provider,
            calls: m.calls,
            tokens: m.tokens,
            cost: Math.round(m.cost * 10000) / 10000,
          })
        ),
        dailyUsage: dailyUsage.map(
          (d: { _id: string; calls: number; tokens: number; cost: number }) => ({
            date: d._id,
            calls: d.calls,
            tokens: d.tokens,
            cost: Math.round(d.cost * 10000) / 10000,
          })
        ),
        topUsers: topUsers.map(
          (u: { _id: string; calls: number; tokens: number; cost: number }) => {
            const user = userMap.get(u._id.toString());
            return {
              name: (user as { name?: string })?.name || "Unknown",
              email: (user as { email?: string })?.email || "",
              calls: u.calls,
              tokens: u.tokens,
              cost: Math.round(u.cost * 10000) / 10000,
            };
          }
        ),
        errorRates: errorRates.map(
          (e: { _id: string; total: number; errors: number }) => ({
            name: e._id,
            total: e.total,
            errors: e.errors,
            rate:
              e.total > 0
                ? Math.round((e.errors / e.total) * 10000) / 100
                : 0,
          })
        ),
      },
    });
  } catch (error) {
    console.error("AI analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI analytics" },
      { status: 500 }
    );
  }
}
