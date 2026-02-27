/**
 * CLI script to run RAG document ingestion.
 *
 * Usage:
 *   npx tsx scripts/run-ingestion.ts                    # Incremental (changed files only)
 *   npx tsx scripts/run-ingestion.ts --force             # Force full re-index
 *   npx tsx scripts/run-ingestion.ts --path /custom/path # Custom docs path
 */

import mongoose, { Types } from "mongoose";
import { config } from "dotenv";
config({ path: ".env.local" });
import { runIngestion, getIngestionStats } from "../src/lib/rag/ingestion";
import { RagIngestionRunModel } from "../src/lib/db/models/RagIngestionRun";

async function main() {
  const args = process.argv.slice(2);
  const forceReindex = args.includes("--force");
  const pathIdx = args.indexOf("--path");
  const docsPath = pathIdx >= 0 ? args[pathIdx + 1] : undefined;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set in environment");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);

  // Use a placeholder ObjectId for CLI-triggered ingestion
  const systemUserId = new Types.ObjectId("000000000000000000000000");

  console.log(
    `Starting ingestion (${forceReindex ? "full re-index" : "incremental"})...`
  );
  if (docsPath) {
    console.log(`Custom docs path: ${docsPath}`);
  }

  const startTime = Date.now();

  try {
    const runId = await runIngestion({
      forceReindex,
      docsPath,
      triggeredBy: systemUserId,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Fetch the run details
    const run = await RagIngestionRunModel.findOne({ runId });
    if (run) {
      console.log(`\nIngestion completed in ${elapsed}s`);
      console.log(`  Run ID: ${runId}`);
      console.log(`  Files processed: ${run.stats.filesProcessed}`);
      console.log(`  Files skipped (unchanged): ${run.stats.filesSkipped}`);
      console.log(`  Chunks created: ${run.stats.chunksCreated}`);
      console.log(`  Chunks deleted: ${run.stats.chunksDeleted}`);
      console.log(`  Embeddings generated: ${run.stats.embeddingsGenerated}`);
      console.log(`  Total tokens: ${run.stats.totalTokens}`);
      if (run.stats.errors.length > 0) {
        console.log(`  Errors:`);
        for (const err of run.stats.errors) {
          console.log(`    - ${err.file}: ${err.error}`);
        }
      }
    }

    // Show overall stats
    const stats = await getIngestionStats();
    console.log(`\nKnowledge base: ${stats.totalChunks} chunks from ${stats.totalFiles} files`);
  } catch (error) {
    console.error("Ingestion failed:", error);
    process.exit(1);
  }

  await mongoose.disconnect();
}

main();
