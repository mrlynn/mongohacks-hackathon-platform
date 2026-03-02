import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin-guard";
import {
  getIngestionStats,
  isIngestionRunning,
} from "@/lib/rag/ingestion";
import { apiLogger } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  apiLogger.info({ data: JSON.stringify(session?.user, null, 2) }, "[RAG status] session:");

  const adminCheck = await isUserAdmin();
  apiLogger.info({ data: adminCheck }, "[RAG status] isUserAdmin:");

  if (!adminCheck) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [stats, running] = await Promise.all([
      getIngestionStats(),
      isIngestionRunning(),
    ]);

    return NextResponse.json({
      isRunning: running,
      ...stats,
    });
  } catch (error) {
    apiLogger.error({ err: error }, "RAG status error");
    return NextResponse.json(
      { error: "Failed to fetch RAG status" },
      { status: 500 }
    );
  }
}
