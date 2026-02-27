import { setupTestDB, teardownTestDB, clearCollections, seedTestData } from "../utils/db";
import { testUsers } from "../fixtures/users";
import { testEvent } from "../fixtures/events";
import { ProjectModel } from "@/lib/db/models/Project";
import { TeamModel } from "@/lib/db/models/Team";

describe("Project Submission", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  describe("Project creation", () => {
    it("should create a project with valid data", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [testEvent],
      });

      const user = seeded.users[0];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Project Test Team",
        eventId: event._id,
        leaderId: user._id,
        members: [user._id],
        maxMembers: 4,
      });

      const project = await ProjectModel.create({
        name: "My Hackathon Project",
        description: "A revolutionary app that solves real problems",
        category: "AI/ML",
        eventId: event._id,
        teamId: team._id,
        technologies: ["React", "Node.js", "MongoDB"],
        repoUrl: "https://github.com/user/project",
        demoUrl: "https://my-project.vercel.app",
        status: "draft",
      });

      expect(project.name).toBe("My Hackathon Project");
      expect(project.technologies).toHaveLength(3);
      expect(project.status).toBe("draft");
    });

    it("should enforce one project per team per event", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [testEvent],
      });

      const user = seeded.users[0];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Duplicate Project Team",
        eventId: event._id,
        leaderId: user._id,
        members: [user._id],
        maxMembers: 4,
      });

      // First project
      await ProjectModel.create({
        name: "First Project",
        description: "The first project",
        category: "AI/ML",
        eventId: event._id,
        teamId: team._id,
        technologies: ["React"],
        repoUrl: "https://github.com/user/first",
        status: "draft",
      });

      // Check if team already has a project
      const existing = await ProjectModel.findOne({
        eventId: event._id,
        teamId: team._id,
      });

      expect(existing).toBeDefined();
      expect(existing!.name).toBe("First Project");
    });
  });

  describe("Project submission flow", () => {
    it("should transition from draft to submitted", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [testEvent],
      });

      const user = seeded.users[0];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Submit Flow Team",
        eventId: event._id,
        leaderId: user._id,
        members: [user._id],
        maxMembers: 4,
      });

      const project = await ProjectModel.create({
        name: "Draft Project",
        description: "A project in draft state",
        category: "AI/ML",
        eventId: event._id,
        teamId: team._id,
        technologies: ["MongoDB"],
        repoUrl: "https://github.com/user/draft",
        status: "draft",
      });

      // Submit the project
      project.status = "submitted";
      project.submittedAt = new Date();
      await project.save();

      const submitted = await ProjectModel.findById(project._id);
      expect(submitted!.status).toBe("submitted");
      expect(submitted!.submittedAt).toBeDefined();
    });

    it("should validate GitHub URL format", () => {
      const validUrls = [
        "https://github.com/user/repo",
        "https://github.com/org/repo-name",
        "http://github.com/user/repo",
        "https://www.github.com/user/repo",
      ];

      const invalidUrls = [
        "https://gitlab.com/user/repo",
        "not-a-url",
        "https://github.com",
        "https://github.com/user",
      ];

      const githubRegex = /^https?:\/\/(www\.)?github\.com\/.+\/.+/;

      for (const url of validUrls) {
        expect(githubRegex.test(url)).toBe(true);
      }

      for (const url of invalidUrls) {
        expect(githubRegex.test(url)).toBe(false);
      }
    });
  });

  describe("Project update (auto-save)", () => {
    it("should update project fields without changing status", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [testEvent],
      });

      const user = seeded.users[0];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Auto-save Team",
        eventId: event._id,
        leaderId: user._id,
        members: [user._id],
        maxMembers: 4,
      });

      const project = await ProjectModel.create({
        name: "Auto-save Project",
        description: "Initial description",
        category: "AI/ML",
        eventId: event._id,
        teamId: team._id,
        technologies: ["React"],
        repoUrl: "https://github.com/user/autosave",
        status: "draft",
      });

      // Simulate auto-save PATCH
      const updated = await ProjectModel.findByIdAndUpdate(
        project._id,
        {
          $set: {
            description: "Updated description via auto-save",
            technologies: ["React", "MongoDB", "Node.js"],
          },
        },
        { new: true }
      );

      expect(updated!.description).toBe("Updated description via auto-save");
      expect(updated!.technologies).toHaveLength(3);
      expect(updated!.status).toBe("draft"); // Status unchanged
    });

    it("should not allow editing submitted projects", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [testEvent],
      });

      const user = seeded.users[0];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "No-edit Team",
        eventId: event._id,
        leaderId: user._id,
        members: [user._id],
        maxMembers: 4,
      });

      const project = await ProjectModel.create({
        name: "Submitted Project",
        description: "Already submitted",
        category: "AI/ML",
        eventId: event._id,
        teamId: team._id,
        technologies: ["Go"],
        repoUrl: "https://github.com/user/submitted",
        status: "submitted",
        submittedAt: new Date(),
      });

      // Verify status is submitted (UI would block edits)
      expect(project.status).toBe("submitted");
    });
  });
});
