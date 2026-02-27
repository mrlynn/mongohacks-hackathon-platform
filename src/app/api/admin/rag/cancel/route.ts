import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/admin-guard";
import { cancelIngestion } from "@/lib/rag/ingestion";

export async function POST(request: NextRequest) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { runId } = body as { runId?: string };

    if (!runId) {
      return NextResponse.json(
        { error: "runId is required" },
        { status: 400 }
      );
    }

    const cancelled = await cancelIngestion(runId);

    if (!cancelled) {
      return NextResponse.json(
        { error: "No running ingestion found with that ID" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "cancelled" });
  } catch (error) {
    console.error("RAG cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel ingestion" },
      { status: 500 }
    );
  }
}
