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

export const createPartnerSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().min(2).max(100),
  tier: z.enum(["platinum", "gold", "silver", "bronze", "community"]).default("bronze"),
  status: z.enum(["active", "inactive", "pending"]).default("pending"),
  companyInfo: z.object({
    size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
    headquarters: z.string().max(200).optional(),
    foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
    employeeCount: z.string().max(50).optional(),
  }).optional(),
  contacts: z.array(
    z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      phone: z.string().max(30).optional(),
      role: z.string().min(2).max(100),
      isPrimary: z.boolean().default(false),
    })
  ).min(1).max(10),
  social: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    youtube: z.string().url().optional(),
  }).optional(),
  tags: z.array(z.string()).max(20).default([]),
  notes: z.string().max(5000).optional(),
});

export const updatePartnerSchema = createPartnerSchema.partial();

export const createPrizeSchema = z.object({
  eventId: z.string(),
  partnerId: z.string().optional(),
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  category: z.enum(["grand", "track", "sponsor", "special", "community"]),
  value: z.string().max(100).optional(),
  monetaryValue: z.number().min(0).optional(),
  eligibility: z.string().max(1000).optional(),
  criteria: z.array(z.string()).max(20).optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
});

export const updatePrizeSchema = createPrizeSchema.partial();

export const awardPrizeSchema = z.object({
  prizeId: z.string(),
  projectId: z.string(),
  teamId: z.string(),
  notes: z.string().max(1000).optional(),
});
