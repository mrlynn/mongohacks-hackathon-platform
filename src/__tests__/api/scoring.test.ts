import { setupTestDB, teardownTestDB, clearCollections, seedTestData } from "../utils/db";
import { testUsers } from "../fixtures/users";
import { testEvent } from "../fixtures/events";
import { ScoreModel } from "@/lib/db/models/Score";
import { ProjectModel } from "@/lib/db/models/Project";
import { TeamModel } from "@/lib/db/models/Team";

describe("Scoring Operations", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  async function createProjectWithTeam(eventId: string, leaderId: string) {
    const team = await TeamModel.create({
      name: "Scoring Test Team",
      eventId,
      leaderId,
      members: [leaderId],
      maxMembers: 4,
    });

    const project = await ProjectModel.create({
      name: "Test Project",
      description: "A test project for scoring",
      category: "AI/ML",
      eventId,
      teamId: team._id,
      technologies: ["React", "MongoDB"],
      repoUrl: "https://github.com/test/project",
      status: "submitted",
    });

    return { team, project };
  }

  describe("Score submission", () => {
    it("should create a score with dynamic criteria", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.judge],
        events: [testEvent],
      });

      const participant = seeded.users[0];
      const judge = seeded.users[1];
      const event = seeded.events[0];

      const { project } = await createProjectWithTeam(
        event._id.toString(),
        participant._id.toString()
      );

      const score = await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge._id,
        scores: {
          innovation: 8,
          technical: 7,
          impact: 9,
          presentation: 6,
        },
        comments: "Great project!",
        submittedAt: new Date(),
      });

      expect(score.scores.innovation).toBe(8);
      expect(score.scores.technical).toBe(7);
      expect(score.totalScore).toBe(30); // 8+7+9+6 via pre-save hook
    });

    it("should support custom rubric criteria", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.judge],
        events: [testEvent],
      });

      const participant = seeded.users[0];
      const judge = seeded.users[1];
      const event = seeded.events[0];

      const { project } = await createProjectWithTeam(
        event._id.toString(),
        participant._id.toString()
      );

      // Score with custom criteria names
      const score = await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge._id,
        scores: {
          creativity: 9,
          technical_complexity: 8,
          user_experience: 7,
          mongodb_usage: 10,
          demo_quality: 6,
        },
        submittedAt: new Date(),
      });

      expect(score.scores.creativity).toBe(9);
      expect(score.scores.mongodb_usage).toBe(10);
      expect(score.totalScore).toBe(40); // 9+8+7+10+6
    });

    it("should enforce one score per judge per project", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.judge],
        events: [testEvent],
      });

      const participant = seeded.users[0];
      const judge = seeded.users[1];
      const event = seeded.events[0];

      const { project } = await createProjectWithTeam(
        event._id.toString(),
        participant._id.toString()
      );

      // First score
      await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge._id,
        scores: { innovation: 5, technical: 5, impact: 5, presentation: 5 },
        submittedAt: new Date(),
      });

      // Duplicate should fail due to unique index
      await expect(
        ScoreModel.create({
          projectId: project._id,
          eventId: event._id,
          judgeId: judge._id,
          scores: { innovation: 8, technical: 8, impact: 8, presentation: 8 },
          submittedAt: new Date(),
        })
      ).rejects.toThrow();
    });

    it("should allow upsert (update existing score)", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.judge],
        events: [testEvent],
      });

      const participant = seeded.users[0];
      const judge = seeded.users[1];
      const event = seeded.events[0];

      const { project } = await createProjectWithTeam(
        event._id.toString(),
        participant._id.toString()
      );

      // Initial score
      await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge._id,
        scores: { innovation: 5, technical: 5, impact: 5, presentation: 5 },
        submittedAt: new Date(),
      });

      // Upsert with new scores
      const updated = await ScoreModel.findOneAndUpdate(
        { projectId: project._id, judgeId: judge._id },
        {
          $set: {
            scores: { innovation: 9, technical: 8, impact: 7, presentation: 6 },
            totalScore: 30,
            submittedAt: new Date(),
          },
        },
        { new: true }
      );

      expect(updated!.scores.innovation).toBe(9);
      expect(updated!.totalScore).toBe(30);
    });
  });

  describe("Results aggregation", () => {
    it("should calculate average scores across judges", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.judge, testUsers.admin],
        events: [testEvent],
      });

      const participant = seeded.users[0];
      const judge1 = seeded.users[1];
      const judge2 = seeded.users[2];
      const event = seeded.events[0];

      const { project } = await createProjectWithTeam(
        event._id.toString(),
        participant._id.toString()
      );

      // Two judges score the project
      await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge1._id,
        scores: { innovation: 8, technical: 6, impact: 10, presentation: 4 },
        submittedAt: new Date(),
      });

      await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge2._id,
        scores: { innovation: 6, technical: 8, impact: 6, presentation: 8 },
        submittedAt: new Date(),
      });

      // Calculate averages
      const scores = await ScoreModel.find({ projectId: project._id });
      expect(scores).toHaveLength(2);

      const criteria = ["innovation", "technical", "impact", "presentation"];
      const averages: Record<string, number> = {};
      for (const c of criteria) {
        const sum = scores.reduce(
          (acc, s) => acc + ((s.scores as Record<string, number>)[c] || 0),
          0
        );
        averages[c] = sum / scores.length;
      }

      expect(averages.innovation).toBe(7);  // (8+6)/2
      expect(averages.technical).toBe(7);    // (6+8)/2
      expect(averages.impact).toBe(8);       // (10+6)/2
      expect(averages.presentation).toBe(6); // (4+8)/2
    });

    it("should rank projects by total score", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.participant2, testUsers.judge],
        events: [testEvent],
      });

      const user1 = seeded.users[0];
      const user2 = seeded.users[1];
      const judge = seeded.users[2];
      const event = seeded.events[0];

      const { project: project1 } = await createProjectWithTeam(
        event._id.toString(),
        user1._id.toString()
      );

      // Create second team + project
      const team2 = await TeamModel.create({
        name: "Second Team",
        eventId: event._id,
        leaderId: user2._id,
        members: [user2._id],
        maxMembers: 4,
      });

      const project2 = await ProjectModel.create({
        name: "Second Project",
        description: "Another project",
        category: "AI/ML",
        eventId: event._id,
        teamId: team2._id,
        technologies: ["Python"],
        repoUrl: "https://github.com/test/project2",
        status: "submitted",
      });

      // Score project 1 (lower)
      await ScoreModel.create({
        projectId: project1._id,
        eventId: event._id,
        judgeId: judge._id,
        scores: { innovation: 5, technical: 5, impact: 5, presentation: 5 },
        submittedAt: new Date(),
      });

      // Score project 2 (higher)
      await ScoreModel.create({
        projectId: project2._id,
        eventId: event._id,
        judgeId: judge._id,
        scores: { innovation: 9, technical: 9, impact: 9, presentation: 9 },
        submittedAt: new Date(),
      });

      // Rank by totalScore
      const allScores = await ScoreModel.find({ eventId: event._id }).sort({
        totalScore: -1,
      });

      expect(allScores[0].projectId.toString()).toBe(project2._id.toString());
      expect(allScores[0].totalScore).toBe(36);
      expect(allScores[1].projectId.toString()).toBe(project1._id.toString());
      expect(allScores[1].totalScore).toBe(20);
    });
  });
});
