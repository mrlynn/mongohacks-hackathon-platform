import { connectToDatabase } from "@/lib/db/connection";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { TeamModel } from "@/lib/db/models/Team";
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

/**
 * Finds teams in an event that best match a participant's skills.
 *
 * Strategy:
 * 1. If the participant has a `skillsEmbedding`, use MongoDB Vector Search
 *    against the `team_skills_vector` index on `desiredSkillsEmbedding`.
 * 2. Otherwise, fall back to a simple tag-overlap score so the feature
 *    still works before embeddings have been generated.
 *
 * Returns teams sorted by match score (descending), annotated with
 * `matchScore` (0-100) and `matchReasons` strings.
 */
export async function findMatchingTeams(
  participant: Participant & { skillsEmbedding?: number[] },
  eventId: string,
  limit: number = 6
): Promise<any[]> {
  await connectToDatabase();

  // Try vector search first when the participant has an embedding
  if (participant.skillsEmbedding?.length) {
    try {
      const results = await TeamModel.aggregate([
        {
          $vectorSearch: {
            index: "team_skills_vector",
            path: "desiredSkillsEmbedding",
            queryVector: participant.skillsEmbedding,
            numCandidates: limit * 10,
            limit,
            filter: {
              eventId: new Types.ObjectId(eventId),
              lookingForMembers: true,
            },
          },
        },
        {
          $addFields: {
            matchScore: { $multiply: [{ $meta: "vectorSearchScore" }, 100] },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "members",
            pipeline: [{ $project: { name: 1, email: 1 } }],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "leaderId",
            foreignField: "_id",
            as: "leaderArr",
            pipeline: [{ $project: { name: 1, email: 1 } }],
          },
        },
        { $addFields: { leaderId: { $arrayElemAt: ["$leaderArr", 0] } } },
        { $project: { leaderArr: 0, desiredSkillsEmbedding: 0 } },
      ]);

      if (results.length > 0) {
        return results.map((t) => ({
          ...t,
          matchScore: Math.round(t.matchScore),
          matchReasons: buildMatchReasons(
            participant.skills,
            t.desiredSkills || []
          ),
        }));
      }
    } catch {
      // Index may not exist yet — fall through to tag overlap
    }
  }

  // Fallback: tag-overlap ranking
  const teams = await TeamModel.find({ eventId, lookingForMembers: true })
    .populate("members", "name email")
    .populate("leaderId", "name email")
    .limit(limit * 3)
    .lean();

  const participantSkills = new Set(
    (participant.skills || []).map((s: string) => s.toLowerCase())
  );

  const scored = teams
    .map((team) => {
      const desired = (team.desiredSkills || []).map((s: string) => s.toLowerCase());
      const matches = desired.filter((s: string) => participantSkills.has(s));
      const score =
        desired.length > 0
          ? Math.round((matches.length / desired.length) * 100)
          : 0;
      return {
        ...team,
        matchScore: score,
        matchReasons: buildMatchReasons(participant.skills, team.desiredSkills || []),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
}

function buildMatchReasons(
  participantSkills: string[],
  teamDesiredSkills: string[]
): string[] {
  const pSet = new Set(participantSkills.map((s) => s.toLowerCase()));
  const matching = teamDesiredSkills.filter((s) => pSet.has(s.toLowerCase()));
  const missing = teamDesiredSkills.filter((s) => !pSet.has(s.toLowerCase()));

  const reasons: string[] = [];
  if (matching.length > 0) {
    reasons.push(`Your skills match: ${matching.slice(0, 3).join(", ")}`);
  }
  if (missing.length > 0) {
    reasons.push(`They need: ${missing.slice(0, 2).join(", ")}`);
  }
  return reasons;
}
