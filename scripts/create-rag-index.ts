/**
 * Script to create the MongoDB Atlas Vector Search index for RAG documents.
 *
 * Usage: npx tsx scripts/create-rag-index.ts
 *
 * Note: This creates the index via the Atlas admin API. The index may take
 * a few minutes to build after creation. You can also create it manually
 * in the Atlas UI under Search Indexes.
 */

import mongoose from "mongoose";
import { config } from "dotenv";
config({ path: ".env.local" });

async function createRagVectorIndex() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set in environment");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  if (!db) {
    console.error("Failed to get database reference");
    process.exit(1);
  }

  // Ensure the collection exists
  const collections = await db.listCollections({ name: "ragdocuments" }).toArray();
  if (collections.length === 0) {
    console.log("Creating ragdocuments collection...");
    await db.createCollection("ragdocuments");
  }

  console.log("Creating vector search index...");
  console.log(
    "Index definition:\n",
    JSON.stringify(
      {
        name: "rag_document_vector",
        type: "vectorSearch",
        definition: {
          fields: [
            {
              type: "vector",
              path: "embedding",
              numDimensions: 1024,
              similarity: "cosine",
            },
            {
              type: "filter",
              path: "source.category",
            },
            {
              type: "filter",
              path: "accessLevel",
            },
          ],
        },
      },
      null,
      2
    )
  );

  try {
    const collection = db.collection("ragdocuments");

    // Use the createSearchIndex command
    await collection.createSearchIndex({
      name: "rag_document_vector",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 1024,
            similarity: "cosine",
          },
          {
            type: "filter",
            path: "source.category",
          },
          {
            type: "filter",
            path: "accessLevel",
          },
        ],
      },
    });

    console.log("Vector search index 'rag_document_vector' created successfully!");
    console.log(
      "Note: The index may take a few minutes to finish building on Atlas."
    );
  } catch (error: unknown) {
    const err = error as { codeName?: string; message?: string };
    if (err.codeName === "IndexAlreadyExists" || err.message?.includes("already exists")) {
      console.log("Index 'rag_document_vector' already exists. Skipping.");
    } else {
      console.error("Failed to create index:", error);
      process.exit(1);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

createRagVectorIndex();
