import { NextResponse } from "next/server";
import mongoose from "mongoose";

const startTime = Date.now();

export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const memUsage = process.memoryUsage();

  let dbStatus: "connected" | "disconnected" | "connecting" = "disconnected";
  let dbLatencyMs: number | null = null;

  try {
    const state = mongoose.connection.readyState;
    if (state === 1) {
      dbStatus = "connected";
      const start = Date.now();
      await mongoose.connection.db!.admin().ping();
      dbLatencyMs = Date.now() - start;
    } else if (state === 2) {
      dbStatus = "connecting";
    }
  } catch {
    dbStatus = "disconnected";
  }

  const healthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || "unknown",
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
