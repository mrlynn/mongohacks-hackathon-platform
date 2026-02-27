import { createHash, randomUUID } from "crypto";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connection";
import { RagDocumentModel } from "@/lib/db/models/RagDocument";
import { RagIngestionRunModel } from "@/lib/db/models/RagIngestionRun";
import { parseMarkdown, chunkDocument } from "./chunker";
import { embedDocuments } from "./embeddings";
import type {
  IngestionOptions,
  FileChange,
  IngestionRunStats,
  DocumentChunk,
} from "./types";

const DEFAULT_DOCS_PATH = "../docs/mongohacks-docs/docs";

// Marketing / public categories — available to anonymous users
const PUBLIC_CATEGORIES = new Set([
  "getting-started",
  "general",
]);

/**
 * Run the full ingestion pipeline.
 * Returns the run ID for tracking.
 */
export async function runIngestion(
  options: IngestionOptions
): Promise<string> {
  await connectToDatabase();

  const runId = randomUUID();
  const docsPath = options.docsPath || resolveDocsPath();

  // Create ingestion run record
  const run = await RagIngestionRunModel.create({
    runId,
    status: "running",
    stats: {
      filesProcessed: 0,
      filesSkipped: 0,
      chunksCreated: 0,
      chunksDeleted: 0,
      embeddingsGenerated: 0,
      totalTokens: 0,
      errors: [],
    },
    startedAt: new Date(),
    triggeredBy: options.triggeredBy,
  });

  try {
    const stats = await executeIngestion(
      runId,
      docsPath,
      options.triggeredBy,
      options.forceReindex || false
    );

    // Mark completed
    const completedAt = new Date();
    await RagIngestionRunModel.updateOne(
      { _id: run._id },
      {
        status: stats.errors.length > 0 ? "completed" : "completed",
        stats,
        completedAt,
        durationMs: completedAt.getTime() - run.startedAt.getTime(),
      }
    );

    return runId;
  } catch (error) {
    const completedAt = new Date();
    await RagIngestionRunModel.updateOne(
      { _id: run._id },
      {
        status: "failed",
        "stats.errors": [
          {
            file: "pipeline",
            error:
              error instanceof Error ? error.message : String(error),
          },
        ],
        completedAt,
        durationMs: completedAt.getTime() - run.startedAt.getTime(),
      }
    );
    throw error;
  }
}

async function executeIngestion(
  runId: string,
  docsPath: string,
  triggeredBy: Types.ObjectId,
  forceReindex: boolean
): Promise<IngestionRunStats> {
  const stats: IngestionRunStats = {
    filesProcessed: 0,
    filesSkipped: 0,
    chunksCreated: 0,
    chunksDeleted: 0,
    embeddingsGenerated: 0,
    totalTokens: 0,
    errors: [],
  };

  // 1. Scan all markdown files
  const markdownFiles = scanMarkdownFiles(docsPath);

  // 2. Detect changes
  const fileChanges = await detectChanges(markdownFiles, docsPath, forceReindex);

  // 3. Process changed/new files
  const toProcess = fileChanges.filter(
    (f) => f.status === "new" || f.status === "changed"
  );
  stats.filesSkipped = fileChanges.filter(
    (f) => f.status === "unchanged"
  ).length;

  for (const file of toProcess) {
    try {
      const doc = parseMarkdown(file.rawContent, file.filePath);
      const chunks = chunkDocument(doc);

      if (chunks.length === 0) continue;

      // Set totalChunks on all chunks
      const totalChunks = chunks.length;
      const enrichedChunks = chunks.map((c) => ({
        ...c,
        totalChunks,
      }));

      // Generate embeddings in batch
      const texts = enrichedChunks.map((c) => c.content);
      const { embeddings, totalTokens } = await embedDocuments(texts);
      stats.embeddingsGenerated += embeddings.length;
      stats.totalTokens += totalTokens;

      // Delete old chunks for this file
      const deleteResult = await RagDocumentModel.deleteMany({
        "source.filePath": file.filePath,
      });
      stats.chunksDeleted += deleteResult.deletedCount;

      // Determine access level based on category
      const accessLevel = PUBLIC_CATEGORIES.has(doc.category)
        ? "public"
        : "authenticated";

      // Insert new chunks
      const documents = enrichedChunks.map(
        (chunk: DocumentChunk & { totalChunks: number }, i: number) => ({
          content: chunk.content,
          contentHash: file.contentHash,
          accessLevel,
          source: {
            filePath: file.filePath,
            title: doc.title,
            section: chunk.section,
            category: doc.category,
            url: doc.url,
            type: "docs" as const,
          },
          chunk: {
            index: chunk.index,
            totalChunks: chunk.totalChunks,
            tokens: chunk.tokens,
          },
          embedding: embeddings[i],
          ingestion: {
            runId,
            ingestedAt: new Date(),
            ingestedBy: triggeredBy,
            version: 1,
          },
        })
      );

      await RagDocumentModel.insertMany(documents);
      stats.chunksCreated += documents.length;
      stats.filesProcessed++;
    } catch (error) {
      stats.errors.push({
        file: file.filePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // 4. Clean up deleted files
  const deleted = fileChanges.filter((f) => f.status === "deleted");
  for (const file of deleted) {
    const deleteResult = await RagDocumentModel.deleteMany({
      "source.filePath": file.filePath,
    });
    stats.chunksDeleted += deleteResult.deletedCount;
    stats.filesProcessed++;
  }

  return stats;
}

/**
 * Recursively scan for .md/.mdx files in the docs directory.
 */
function scanMarkdownFiles(docsPath: string): string[] {
  const files: string[] = [];

  function walk(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        // Skip hidden dirs and node_modules
        if (!entry.startsWith(".") && entry !== "node_modules") {
          walk(fullPath);
        }
      } else if (/\.mdx?$/.test(entry) && !entry.startsWith("_")) {
        files.push(fullPath);
      }
    }
  }

  walk(docsPath);
  return files;
}

/**
 * Compare current files against stored hashes to detect changes.
 */
async function detectChanges(
  filePaths: string[],
  docsPath: string,
  forceReindex: boolean
): Promise<FileChange[]> {
  // Get all stored file paths and hashes
  const storedDocs = await RagDocumentModel.aggregate([
    { $match: { "source.type": "docs" } },
    {
      $group: {
        _id: "$source.filePath",
        contentHash: { $first: "$contentHash" },
      },
    },
  ]);

  const storedMap = new Map<string, string>();
  for (const doc of storedDocs) {
    storedMap.set(doc._id, doc.contentHash);
  }

  const changes: FileChange[] = [];
  const currentPaths = new Set<string>();

  for (const fullPath of filePaths) {
    const relativePath = relative(docsPath, fullPath);
    currentPaths.add(relativePath);

    const rawContent = readFileSync(fullPath, "utf-8");
    const contentHash = createHash("sha256")
      .update(rawContent)
      .digest("hex");

    const storedHash = storedMap.get(relativePath);

    if (forceReindex || !storedHash) {
      changes.push({
        filePath: relativePath,
        status: storedHash ? "changed" : "new",
        contentHash,
        rawContent,
      });
    } else if (storedHash !== contentHash) {
      changes.push({
        filePath: relativePath,
        status: "changed",
        contentHash,
        rawContent,
      });
    } else {
      changes.push({
        filePath: relativePath,
        status: "unchanged",
        contentHash,
        rawContent: "",
      });
    }
  }

  // Detect deleted files
  storedMap.forEach((_, storedPath) => {
    if (!currentPaths.has(storedPath)) {
      changes.push({
        filePath: storedPath,
        status: "deleted",
        contentHash: "",
        rawContent: "",
      });
    }
  });

  return changes;
}

function resolveDocsPath(): string {
  const envPath = process.env.RAG_DOCS_PATH;
  if (envPath) {
    // If absolute, use directly; otherwise resolve from cwd
    return envPath.startsWith("/")
      ? envPath
      : join(process.cwd(), envPath);
  }
  return join(process.cwd(), DEFAULT_DOCS_PATH);
}

/**
 * Get current ingestion stats (for admin dashboard).
 */
export async function getIngestionStats() {
  await connectToDatabase();

  const [documentCount, fileCount, lastRun] = await Promise.all([
    RagDocumentModel.countDocuments(),
    RagDocumentModel.distinct("source.filePath").then((paths) => paths.length),
    RagIngestionRunModel.findOne({ status: "completed" }).sort({
      completedAt: -1,
    }),
  ]);

  return {
    totalChunks: documentCount,
    totalFiles: fileCount,
    lastRun: lastRun
      ? {
          runId: lastRun.runId,
          completedAt: lastRun.completedAt,
          stats: lastRun.stats,
        }
      : null,
  };
}

/**
 * Check if an ingestion is currently running.
 */
export async function isIngestionRunning(): Promise<boolean> {
  await connectToDatabase();
  const running = await RagIngestionRunModel.findOne({ status: "running" });
  return !!running;
}

/**
 * Cancel a running ingestion by runId.
 */
export async function cancelIngestion(runId: string): Promise<boolean> {
  await connectToDatabase();
  const result = await RagIngestionRunModel.updateOne(
    { runId, status: "running" },
    {
      status: "cancelled",
      completedAt: new Date(),
    }
  );
  return result.modifiedCount > 0;
}

/**
 * Delete all RAG documents (full re-index).
 */
export async function deleteAllDocuments(): Promise<number> {
  await connectToDatabase();
  const result = await RagDocumentModel.deleteMany({});
  return result.deletedCount;
}
