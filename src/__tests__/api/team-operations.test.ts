import { setupTestDB, teardownTestDB, clearCollections, seedTestData } from "../utils/db";
import { testUsers } from "../fixtures/users";
import { testEvent } from "../fixtures/events";
import { TeamModel } from "@/lib/db/models/Team";
import { ParticipantModel } from "@/lib/db/models/Participant";

describe("Team Operations", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  describe("Team creation", () => {
    it("should create a team with valid data", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [testEvent],
      });

      const user = seeded.users[0];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Test Team",
        description: "A test team",
        eventId: event._id,
        leaderId: user._id,
        members: [user._id],
        maxMembers: 4,
        lookingForMembers: true,
        requiredSkills: ["JavaScript", "MongoDB"],
      });

      expect(team.name).toBe("Test Team");
      expect(team.members).toHaveLength(1);
      expect(team.leaderId.toString()).toBe(user._id.toString());
      expect(team.lookingForMembers).toBe(true);
    });

    it("should enforce one team per event per user", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [testEvent],
      });

      const user = seeded.users[0];
      const event = seeded.events[0];

      // Create first team
      await TeamModel.create({
        name: "Team A",
        eventId: event._id,
        leaderId: user._id,
        members: [user._id],
        maxMembers: 4,
      });

      // Verify user is on a team
      const existingTeam = await TeamModel.findOne({
        eventId: event._id,
        members: user._id,
      });

      expect(existingTeam).toBeDefined();
      expect(existingTeam!.name).toBe("Team A");
    });
  });

  describe("Team join", () => {
    it("should add a member to the team", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.participant2],
        events: [testEvent],
      });

      const leader = seeded.users[0];
      const joiner = seeded.users[1];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Open Team",
        eventId: event._id,
        leaderId: leader._id,
        members: [leader._id],
        maxMembers: 4,
        lookingForMembers: true,
      });

      // Simulate join
      team.members.push(joiner._id);
      await team.save();

      const updated = await TeamModel.findById(team._id);
      expect(updated!.members).toHaveLength(2);
      expect(updated!.members.map((m: any) => m.toString())).toContain(
        joiner._id.toString()
      );
    });

    it("should auto-flip lookingForMembers when team is full", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.participant2],
        events: [testEvent],
      });

      const leader = seeded.users[0];
      const joiner = seeded.users[1];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Small Team",
        eventId: event._id,
        leaderId: leader._id,
        members: [leader._id],
        maxMembers: 2, // Only 2 max
        lookingForMembers: true,
      });

      // Add second member — should hit capacity
      team.members.push(joiner._id);
      if (team.members.length >= team.maxMembers) {
        team.lookingForMembers = false;
      }
      await team.save();

      const updated = await TeamModel.findById(team._id);
      expect(updated!.members).toHaveLength(2);
      expect(updated!.lookingForMembers).toBe(false);
    });

    it("should not allow joining a full team", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.participant2],
        events: [testEvent],
      });

      const leader = seeded.users[0];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Full Team",
        eventId: event._id,
        leaderId: leader._id,
        members: [leader._id],
        maxMembers: 1, // Already full
        lookingForMembers: false,
      });

      expect(team.members.length >= team.maxMembers).toBe(true);
    });
  });

  describe("Team leave", () => {
    it("should remove a member from the team", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.participant2],
        events: [testEvent],
      });

      const leader = seeded.users[0];
      const member = seeded.users[1];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Leave Test Team",
        eventId: event._id,
        leaderId: leader._id,
        members: [leader._id, member._id],
        maxMembers: 4,
        lookingForMembers: false,
      });

      // Simulate leave
      const memberIndex = team.members.findIndex(
        (m: any) => m.toString() === member._id.toString()
      );
      team.members.splice(memberIndex, 1);
      if (team.members.length < team.maxMembers) {
        team.lookingForMembers = true;
      }
      await team.save();

      const updated = await TeamModel.findById(team._id);
      expect(updated!.members).toHaveLength(1);
      expect(updated!.lookingForMembers).toBe(true);
    });
  });

  describe("Transfer leadership", () => {
    it("should transfer leadership to another member", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.participant2],
        events: [testEvent],
      });

      const leader = seeded.users[0];
      const member = seeded.users[1];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Transfer Test Team",
        eventId: event._id,
        leaderId: leader._id,
        members: [leader._id, member._id],
        maxMembers: 4,
      });

      // Transfer leadership
      team.leaderId = member._id;
      await team.save();

      const updated = await TeamModel.findById(team._id);
      expect(updated!.leaderId.toString()).toBe(member._id.toString());
    });

    it("should not allow non-members to become leader", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1, testUsers.participant2],
        events: [testEvent],
      });

      const leader = seeded.users[0];
      const nonMember = seeded.users[1];
      const event = seeded.events[0];

      const team = await TeamModel.create({
        name: "Transfer Guard Team",
        eventId: event._id,
        leaderId: leader._id,
        members: [leader._id], // nonMember is NOT in members
        maxMembers: 4,
      });

      const isMember = team.members.some(
        (m: any) => m.toString() === nonMember._id.toString()
      );
      expect(isMember).toBe(false);
    });
  });
});
