import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin-guard";
import {
  getIngestionStats,
  isIngestionRunning,
} from "@/lib/rag/ingestion";

export async function GET() {
  const session = await auth();
  console.log("[RAG status] session:", JSON.stringify(session?.user, null, 2));

  const adminCheck = await isUserAdmin();
  console.log("[RAG status] isUserAdmin:", adminCheck);

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
    console.error("RAG status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RAG status" },
      { status: 500 }
    );
  }
}
