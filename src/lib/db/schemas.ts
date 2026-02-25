import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  theme: z.string().min(2).max(200),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  location: z.string().min(2).max(500),
  capacity: z.number().int().positive().max(10000),
  isVirtual: z.boolean(),
  tags: z.array(z.string()).max(20),
  rules: z.string().max(10000).optional(),
  judging_criteria: z.array(z.string()).max(20).optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const registerParticipantSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string()).max(30),
  interests: z.array(z.string()).max(20),
  experience_level: z.enum(["beginner", "intermediate", "advanced"]),
});

export const createProjectSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(10000),
  category: z.string().min(2).max(100),
  technologies: z.array(z.string()).max(20),
  repoUrl: z.string().url(),
  demoUrl: z.string().url().optional(),
  documentationUrl: z.string().url().optional(),
  innovations: z.string().max(5000).optional(),
});

export const submitScoreSchema = z.object({
  projectId: z.string(),
  rubricId: z.string(),
  scores: z.array(
    z.object({
      criteriaId: z.string(),
      score: z.number().min(0),
      feedback: z.string().max(2000),
    })
  ),
  overallComments: z.string().max(5000),
});
