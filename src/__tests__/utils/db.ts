import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserModel } from "@/lib/db/models/User";
import { EventModel } from "@/lib/db/models/Event";
import { TeamModel } from "@/lib/db/models/Team";
import { ProjectModel } from "@/lib/db/models/Project";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { ScoreModel } from "@/lib/db/models/Score";

let mongoServer: MongoMemoryServer;

export async function setupTestDB() {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect mongoose
  await mongoose.connect(uri);
}

export async function teardownTestDB() {
  // Clear all collections
  await mongoose.connection.dropDatabase();
  
  // Close connection
  await mongoose.connection.close();
  
  // Stop MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export async function seedTestData(data: {
  users?: any[];
  events?: any[];
  teams?: any[];
  projects?: any[];
  participants?: any[];
  scores?: any[];
}) {
  const result: any = {};

  if (data.users) {
    result.users = await UserModel.insertMany(data.users);
  }

  if (data.events) {
    result.events = await EventModel.insertMany(data.events);
  }

  if (data.teams) {
    result.teams = await TeamModel.insertMany(data.teams);
  }

  if (data.projects) {
    result.projects = await ProjectModel.insertMany(data.projects);
  }

  if (data.participants) {
    result.participants = await ParticipantModel.insertMany(data.participants);
  }

  if (data.scores) {
    result.scores = await ScoreModel.insertMany(data.scores);
  }

  return result;
}
