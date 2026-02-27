import { NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db/connection";
import { RagDocumentModel } from "@/lib/db/models/RagDocument";

export async function GET() {
  if (!(await isUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectToDatabase();

    const files = await RagDocumentModel.aggregate([
      {
        $group: {
          _id: "$source.filePath",
          title: { $first: "$source.title" },
          category: { $first: "$source.category" },
          url: { $first: "$source.url" },
          accessLevel: { $first: "$accessLevel" },
          chunks: { $sum: 1 },
          totalTokens: { $sum: "$chunk.tokens" },
          lastIngested: { $max: "$ingestion.ingestedAt" },
        },
      },
      { $sort: { category: 1, _id: 1 } },
    ]);

    return NextResponse.json({
      files: files.map((f) => ({
        filePath: f._id,
        title: f.title,
        category: f.category,
        url: f.url,
        accessLevel: f.accessLevel,
        chunks: f.chunks,
        totalTokens: f.totalTokens,
        lastIngested: f.lastIngested,
      })),
    });
  } catch (error) {
    console.error("RAG files error:", error);
    return NextResponse.json(
      { error: "Failed to fetch indexed files" },
      { status: 500 }
    );
  }
}
