import { connectToDatabase } from "@/lib/db/connection";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { generateEmbedding } from "./embedding-service";
import type { Participant } from "@/types";
import { Types } from "mongoose";

export async function findMatchingTeammates(
  participant: Participant,
  eventId: Types.ObjectId,
  limit: number = 5
): Promise<Participant[]> {
  const participantSkillText = `${participant.skills.join(" ")} ${participant.bio}`;
  const skillEmbedding = await generateEmbedding(participantSkillText);

  await connectToDatabase();

  const matchedParticipants = await ParticipantModel.aggregate([
    {
      $vectorSearch: {
        index: "participant_skills_vector",
        path: "skillsEmbedding",
        queryVector: skillEmbedding,
        numCandidates: limit * 10,
        limit: limit + 1,
      },
    },
    {
      $match: {
        "registeredEvents.eventId": eventId,
        _id: { $ne: participant._id },
      },
    },
    {
      $limit: limit,
    },
  ]);

  return matchedParticipants;
}
