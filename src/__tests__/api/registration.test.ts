import { setupTestDB, teardownTestDB, clearCollections, seedTestData } from "../utils/db";
import { testUsers } from "../fixtures/users";
import { testEvent } from "../fixtures/events";
import { UserModel } from "@/lib/db/models/User";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";

describe("Event Registration API", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  describe("POST /api/events/[eventId]/register", () => {
    it("should register a user for an event", async () => {
      // Seed data
      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [testEvent],
      });

      const user = seeded.users[0];
      const event = seeded.events[0];

      // Create participant record
      const participant = await ParticipantModel.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        skills: ["JavaScript", "MongoDB"],
        experience_level: "intermediate",
        bio: "Test bio",
        registeredEvents: [
          {
            eventId: event._id,
            registrationDate: new Date(),
            status: "registered",
          },
        ],
      });

      expect(participant).toBeDefined();
      expect(participant.userId.toString()).toBe(user._id.toString());
      expect(participant.registeredEvents).toHaveLength(1);
      expect(participant.registeredEvents[0].eventId.toString()).toBe(
        event._id.toString()
      );
    });

    it("should prevent duplicate registrations", async () => {
      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [testEvent],
      });

      const user = seeded.users[0];
      const event = seeded.events[0];

      // First registration
      await ParticipantModel.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        skills: ["JavaScript"],
        experience_level: "intermediate",
        registeredEvents: [
          {
            eventId: event._id,
            registrationDate: new Date(),
            status: "registered",
          },
        ],
      });

      // Check if already registered
      const existing = await ParticipantModel.findOne({
        userId: user._id,
        "registeredEvents.eventId": event._id,
      });

      expect(existing).toBeDefined();
    });

    it("should reject registration after deadline", async () => {
      const pastEvent = {
        ...testEvent,
        registrationDeadline: new Date("2020-01-01"), // Past deadline
      };

      const seeded = await seedTestData({
        users: [testUsers.participant1],
        events: [pastEvent],
      });

      const event = seeded.events[0];
      const now = new Date();

      expect(now > event.registrationDeadline).toBe(true);
    });
  });
});
