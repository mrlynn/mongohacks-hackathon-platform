import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin-guard";
import {
  runIngestion,
  isIngestionRunning,
} from "@/lib/rag/ingestion";
import { apiLogger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  try {
    // Check if already running
    if (await isIngestionRunning()) {
      return NextResponse.json(
        { error: "An ingestion is already running" },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const forceReindex = body.forceReindex === true;

    // Start ingestion (runs async — returns immediately with the runId)
    const runId = await runIngestion({
      forceReindex,
      triggeredBy: new Types.ObjectId(userId),
    });

    return NextResponse.json({ runId, status: "started" });
  } catch (error) {
    apiLogger.error({ err: error }, "Ingestion trigger error");
    return NextResponse.json(
      { error: "Failed to start ingestion" },
      { status: 500 }
    );
  }
}
