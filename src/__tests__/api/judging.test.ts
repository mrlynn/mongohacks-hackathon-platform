import { setupTestDB, teardownTestDB, clearCollections, seedTestData } from "../utils/db";
import { testUsers } from "../fixtures/users";
import { testEvent } from "../fixtures/events";
import { ScoreModel } from "@/lib/db/models/Score";
import { ProjectModel } from "@/lib/db/models/Project";

describe("Judging API", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  describe("Score Submission", () => {
    it("should create a valid score", async () => {
      const seeded = await seedTestData({
        users: [testUsers.judge, testUsers.participant1],
        events: [testEvent],
      });

      const judge = seeded.users[0];
      const event = seeded.events[0];
      const participant = seeded.users[1];

      // Create a team first
      const { TeamModel } = await import("@/lib/db/models/Team");
      const team = await TeamModel.create({
        name: "Test Team",
        eventId: event._id,
        members: [participant._id],
        leaderId: participant._id,
      });

      // Create a project
      const project = await ProjectModel.create({
        name: "Test Project",
        description: "A test project",
        eventId: event._id,
        teamId: team._id,
        teamMembers: [participant._id],
        repoUrl: "https://github.com/test/repo",
        category: "AI/ML",
        technologies: ["Python", "TensorFlow"],
        status: "submitted",
      });

      // Create score
      const score = await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge._id,
        scores: {
          innovation: 8,
          technical: 9,
          impact: 7,
          presentation: 8,
        },
        comments: "Great work!",
      });

      expect(score).toBeDefined();
      expect(score.totalScore).toBe(32); // Auto-calculated
      expect(score.scores.innovation).toBe(8);
    });

    it("should validate score ranges (1-10)", async () => {
      const seeded = await seedTestData({
        users: [testUsers.judge],
        events: [testEvent],
      });

      const judge = seeded.users[0];
      const event = seeded.events[0];

      const { TeamModel } = await import("@/lib/db/models/Team");
      const team = await TeamModel.create({
        name: "Test Team",
        eventId: event._id,
        members: [judge._id],
        leaderId: judge._id,
      });

      const project = await ProjectModel.create({
        name: "Test Project",
        description: "Test",
        eventId: event._id,
        teamId: team._id,
        teamMembers: [judge._id],
        repoUrl: "https://github.com/test/repo",
        category: "AI/ML",
        technologies: ["Python"],
        status: "submitted",
      });

      // Try invalid score (0)
      try {
        await ScoreModel.create({
          projectId: project._id,
          eventId: event._id,
          judgeId: judge._id,
          scores: {
            innovation: 0, // Invalid
            technical: 5,
            impact: 5,
            presentation: 5,
          },
        });
        fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.name).toBe("ValidationError");
      }

      // Try invalid score (11)
      try {
        await ScoreModel.create({
          projectId: project._id,
          eventId: event._id,
          judgeId: judge._id,
          scores: {
            innovation: 11, // Invalid
            technical: 5,
            impact: 5,
            presentation: 5,
          },
        });
        fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.name).toBe("ValidationError");
      }
    });

    it("should prevent duplicate scores from same judge", async () => {
      const seeded = await seedTestData({
        users: [testUsers.judge],
        events: [testEvent],
      });

      const judge = seeded.users[0];
      const event = seeded.events[0];

      const { TeamModel } = await import("@/lib/db/models/Team");
      const team = await TeamModel.create({
        name: "Test Team",
        eventId: event._id,
        members: [judge._id],
        leaderId: judge._id,
      });

      const project = await ProjectModel.create({
        name: "Test Project",
        description: "Test",
        eventId: event._id,
        teamId: team._id,
        teamMembers: [judge._id],
        repoUrl: "https://github.com/test/repo",
        category: "AI/ML",
        technologies: ["Python"],
        status: "submitted",
      });

      // First score
      await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge._id,
        scores: {
          innovation: 8,
          technical: 7,
          impact: 6,
          presentation: 7,
        },
      });

      // Try duplicate score
      try {
        await ScoreModel.create({
          projectId: project._id,
          eventId: event._id,
          judgeId: judge._id,
          scores: {
            innovation: 9,
            technical: 8,
            impact: 7,
            presentation: 8,
          },
        });
        fail("Should have thrown duplicate key error");
      } catch (error: any) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });

    it("should calculate average scores correctly", async () => {
      const seeded = await seedTestData({
        users: [testUsers.judge, testUsers.admin],
        events: [testEvent],
      });

      const judge1 = seeded.users[0];
      const judge2 = seeded.users[1];
      const event = seeded.events[0];

      const { TeamModel } = await import("@/lib/db/models/Team");
      const team = await TeamModel.create({
        name: "Test Team",
        eventId: event._id,
        members: [judge1._id],
        leaderId: judge1._id,
      });

      const project = await ProjectModel.create({
        name: "Test Project",
        description: "Test",
        eventId: event._id,
        teamId: team._id,
        teamMembers: [judge1._id],
        repoUrl: "https://github.com/test/repo",
        category: "AI/ML",
        technologies: ["Python"],
        status: "submitted",
      });

      // Judge 1 scores
      await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge1._id,
        scores: {
          innovation: 8,
          technical: 9,
          impact: 7,
          presentation: 8,
        },
      });

      // Judge 2 scores
      await ScoreModel.create({
        projectId: project._id,
        eventId: event._id,
        judgeId: judge2._id,
        scores: {
          innovation: 9,
          technical: 8,
          impact: 8,
          presentation: 9,
        },
      });

      // Get all scores for project
      const scores = await ScoreModel.find({ projectId: project._id });

      expect(scores).toHaveLength(2);

      // Calculate averages
      const avgInnovation =
        scores.reduce((sum, s) => sum + s.scores.innovation, 0) / scores.length;
      const avgTotal = scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length;

      expect(avgInnovation).toBe(8.5); // (8 + 9) / 2
      expect(avgTotal).toBe(33); // (32 + 34) / 2
    });
  });
});
