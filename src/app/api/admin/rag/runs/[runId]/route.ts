import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { RagIngestionRunModel } from "@/lib/db/models/RagIngestionRun";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectToDatabase();

    const { runId } = await params;
    const run = await RagIngestionRunModel.findOne({ runId }).lean();

    if (!run) {
      return NextResponse.json(
        { error: "Ingestion run not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ run });
  } catch (error) {
    console.error("RAG run detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch run details" },
      { status: 500 }
    );
  }
}
