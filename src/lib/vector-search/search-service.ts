import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ProjectModel } from "@/lib/db/models/Project";
import { generateEmbedding } from "@/lib/ai/embedding-service";

export async function searchSimilarEvents(query: string, limit: number = 5) {
  const embedding = await generateEmbedding(query);
  await connectToDatabase();

  return EventModel.aggregate([
    {
      $vectorSearch: {
        index: "event_description_vector",
        path: "descriptionEmbedding",
        queryVector: embedding,
        numCandidates: limit * 10,
        limit,
      },
    },
  ]);
}

export async function searchSimilarProjects(
  query: string,
  limit: number = 5
) {
  const embedding = await generateEmbedding(query);
  await connectToDatabase();

  return ProjectModel.aggregate([
    {
      $vectorSearch: {
        index: "project_description_vector",
        path: "descriptionEmbedding",
        queryVector: embedding,
        numCandidates: limit * 10,
        limit,
      },
    },
  ]);
}
