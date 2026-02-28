import { ObjectId } from "mongodb";

export interface HackathonEvent {
  _id: ObjectId;
  name: string;
  description: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  location: string;
  capacity: number;
  isVirtual: boolean;
  tags: string[];
  rules: string;
  judging_criteria: string[];
  organizers: ObjectId[];
  status: "draft" | "open" | "in_progress" | "concluded";
  descriptionEmbedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  _id: ObjectId;
  userId: ObjectId;
  email: string;
  name: string;
  bio: string;
  skills: string[];
  interests: string[];
  experience_level: "beginner" | "intermediate" | "advanced";
  skillsEmbedding?: number[];
  pastProjects: string[];
  invitedToEvents: ObjectId[];
  registeredEvents: {
    eventId: ObjectId;
    registrationDate: Date;
    status: "registered" | "attended" | "no_show";
  }[];
  teamId: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  _id: ObjectId;
  eventId: ObjectId;
  recipientEmail: string;
  senderUserId: ObjectId;
  personalMessage: string;
  status: "sent" | "accepted" | "declined";
  sentDate: Date;
  responseDate?: Date;
}

export interface AttendanceRecord {
  _id: ObjectId;
  eventId: ObjectId;
  participantId: ObjectId;
  checkInTime: Date;
  checkOutTime?: Date;
  status: "checked_in" | "checked_out" | "absent";
  source: "qr_code" | "manual" | "auto_verified";
  createdAt: Date;
}

export interface Project {
  _id: ObjectId;
  eventId: ObjectId;
  teamId: ObjectId;
  name: string;
  description: string;
  descriptionEmbedding?: number[];
  category: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  documentationUrl?: string;
  submissionDate: Date;
  lastModified: Date;
  status: "draft" | "submitted" | "under_review" | "judged";
  innovations: string;
  teamMembers: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JudgingRubric {
  _id: ObjectId;
  eventId: ObjectId;
  criteria: {
    name: string;
    description: string;
    weight: number;
    maxScore: number;
  }[];
  totalWeight: number;
}

export interface JudgeAssignment {
  _id: ObjectId;
  eventId: ObjectId;
  judgeUserId: ObjectId;
  assignedProjects: ObjectId[];
  category?: string;
  conflictsOfInterest: string[];
  createdAt: Date;
}

export interface ProjectScore {
  _id: ObjectId;
  projectId: ObjectId;
  judgeId: ObjectId;
  rubricId: ObjectId;
  scores: {
    criteriaId: string;
    score: number;
    feedback: string;
  }[];
  aiGeneratedSummary: string;
  overallComments: string;
  overallScore: number;
  submittedAt: Date;
}

export interface AwardRecommendation {
  _id: ObjectId;
  eventId: ObjectId;
  projectId: ObjectId;
  awardCategory: string;
  recommendationScore: number;
  justification: string;
  isFinal: boolean;
  createdAt: Date;
}

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: "super_admin" | "admin" | "organizer" | "marketer" | "mentor" | "judge" | "participant";
  createdAt: Date;
  updatedAt: Date;
}

export type EventStatus = HackathonEvent["status"];
export type ExperienceLevel = Participant["experience_level"];
export type UserRole = User["role"];
