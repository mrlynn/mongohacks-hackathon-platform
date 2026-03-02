import { NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/admin-guard";
import { deleteAllDocuments } from "@/lib/rag/ingestion";
import { apiLogger } from "@/lib/logger";

export async function DELETE() {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const deletedCount = await deleteAllDocuments();

    return NextResponse.json({
      status: "deleted",
      deletedCount,
    });
  } catch (error) {
    apiLogger.error({ err: error }, "RAG delete error");
    return NextResponse.json(
      { error: "Failed to delete documents" },
      { status: 500 }
    );
  }
}
