import { NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { RagIngestionRunModel } from "@/lib/db/models/RagIngestionRun";
import { apiLogger } from "@/lib/logger";

export async function GET() {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectToDatabase();

    const runs = await RagIngestionRunModel.find()
      .sort({ startedAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ runs });
  } catch (error) {
    apiLogger.error({ err: error }, "RAG runs error");
    return NextResponse.json(
      { error: "Failed to fetch ingestion runs" },
      { status: 500 }
    );
  }
}
