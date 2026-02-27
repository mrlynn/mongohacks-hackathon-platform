#!/usr/bin/env tsx

/**
 * Enhanced seed script — generates a rich dataset across ALL models.
 *
 * Run:  npm run seed:enhanced
 * Clear first:  npm run seed:enhanced -- --clear
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { connectToDatabase } from "../src/lib/db/connection";
import { UserModel } from "../src/lib/db/models/User";
import { EventModel } from "../src/lib/db/models/Event";
import { TeamModel } from "../src/lib/db/models/Team";
import { ProjectModel } from "../src/lib/db/models/Project";
import { ParticipantModel } from "../src/lib/db/models/Participant";
import { ScoreModel } from "../src/lib/db/models/Score";
import { JudgeAssignmentModel } from "../src/lib/db/models/JudgeAssignment";
import { TemplateConfigModel } from "../src/lib/db/models/TemplateConfig";
import { PartnerModel } from "../src/lib/db/models/Partner";
import { PrizeModel } from "../src/lib/db/models/Prize";
import { NotificationModel } from "../src/lib/db/models/Notification";
import { TeamNoteModel } from "../src/lib/db/models/TeamNote";
import { FeedbackFormConfigModel } from "../src/lib/db/models/FeedbackFormConfig";
import { FeedbackResponseModel } from "../src/lib/db/models/FeedbackResponse";
import { seedBuiltInTemplates } from "../src/lib/db/seed-templates";
import bcrypt from "bcryptjs";

const CLEAR_EXISTING = process.argv.includes("--clear");

// ─── Helpers ──────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Unsplash thumbnails
const thumbnails = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1550439062-609e1531270e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1537432376149-e84978e1fe48?w=600&h=400&fit=crop",
];

async function seed() {
  console.log("🌱 Enhanced Seed — Populating ALL models with rich data...\n");
  await connectToDatabase();

  if (CLEAR_EXISTING) {
    console.log("🗑️  Clearing ALL existing data...");
    await Promise.all([
      UserModel.deleteMany({}),
      EventModel.deleteMany({}),
      TeamModel.deleteMany({}),
      ProjectModel.deleteMany({}),
      ParticipantModel.deleteMany({}),
      ScoreModel.deleteMany({}),
      JudgeAssignmentModel.deleteMany({}),
      TemplateConfigModel.deleteMany({}),
      PartnerModel.deleteMany({}),
      PrizeModel.deleteMany({}),
      NotificationModel.deleteMany({}),
      TeamNoteModel.deleteMany({}),
      FeedbackResponseModel.deleteMany({}),
    ]);
    console.log("✅ Cleared\n");
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  // ═══════════════════════════════════════════════════════════════════
  // 1. USERS — 75 total
  // ═══════════════════════════════════════════════════════════════════
  console.log("👥 Creating 75 users...");

  const userDefs = [
    // Staff (5)
    { name: "Super Admin", email: "superadmin@mongohacks.com", role: "super_admin" },
    { name: "Admin User", email: "admin@mongohacks.com", role: "admin" },
    { name: "Rebecca Torres", email: "rebecca.admin@mongohacks.com", role: "admin" },
    { name: "Jamie Organizer", email: "organizer@mongohacks.com", role: "organizer" },
    { name: "Nadia Reeves", email: "nadia.organizer@mongohacks.com", role: "organizer" },
    // Judges (8)
    { name: "Sarah Chen", email: "sarah.judge@mongohacks.com", role: "judge" },
    { name: "Mike Rodriguez", email: "mike.judge@mongohacks.com", role: "judge" },
    { name: "Aisha Patel", email: "aisha.judge@mongohacks.com", role: "judge" },
    { name: "Liam O'Brien", email: "liam.judge@mongohacks.com", role: "judge" },
    { name: "Yuki Tanaka", email: "yuki.judge@mongohacks.com", role: "judge" },
    { name: "Marcus Webb", email: "marcus.judge@mongohacks.com", role: "judge" },
    { name: "Elena Vasquez", email: "elena.judge@mongohacks.com", role: "judge" },
    { name: "Daniel Okafor", email: "daniel.judge@mongohacks.com", role: "judge" },
    // Participants (62)
    { name: "Alice Developer", email: "alice@example.com", role: "participant" },
    { name: "Bob Chen", email: "bob@example.com", role: "participant" },
    { name: "Carol Martinez", email: "carol@example.com", role: "participant" },
    { name: "David Kim", email: "david@example.com", role: "participant" },
    { name: "Emma Wilson", email: "emma@example.com", role: "participant" },
    { name: "Frank Zhang", email: "frank@example.com", role: "participant" },
    { name: "Grace Lee", email: "grace@example.com", role: "participant" },
    { name: "Henry Patel", email: "henry@example.com", role: "participant" },
    { name: "Iris Nakamura", email: "iris@example.com", role: "participant" },
    { name: "Jake Thompson", email: "jake@example.com", role: "participant" },
    { name: "Kira Okonkwo", email: "kira@example.com", role: "participant" },
    { name: "Leo Rossi", email: "leo@example.com", role: "participant" },
    { name: "Maya Singh", email: "maya@example.com", role: "participant" },
    { name: "Noah Williams", email: "noah@example.com", role: "participant" },
    { name: "Priya Sharma", email: "priya@example.com", role: "participant" },
    { name: "Quinn Jackson", email: "quinn@example.com", role: "participant" },
    { name: "Ravi Gupta", email: "ravi@example.com", role: "participant" },
    { name: "Sofia Hernandez", email: "sofia@example.com", role: "participant" },
    { name: "Tomas Novak", email: "tomas@example.com", role: "participant" },
    { name: "Uma Osei", email: "uma@example.com", role: "participant" },
    { name: "Victor Petrov", email: "victor@example.com", role: "participant" },
    // New participants (41 more)
    { name: "Wendy Liu", email: "wendy@example.com", role: "participant" },
    { name: "Xander Brooks", email: "xander@example.com", role: "participant" },
    { name: "Yara Farouk", email: "yara@example.com", role: "participant" },
    { name: "Zane Mitchell", email: "zane@example.com", role: "participant" },
    { name: "Ava Richardson", email: "ava@example.com", role: "participant" },
    { name: "Brandon Wu", email: "brandon@example.com", role: "participant" },
    { name: "Chloe Dupont", email: "chloe@example.com", role: "participant" },
    { name: "Derek Olsen", email: "derek@example.com", role: "participant" },
    { name: "Elena Morales", email: "elena.m@example.com", role: "participant" },
    { name: "Finn O'Connell", email: "finn@example.com", role: "participant" },
    { name: "Gabriela Santos", email: "gabriela@example.com", role: "participant" },
    { name: "Hassan Ali", email: "hassan@example.com", role: "participant" },
    { name: "Ines Johansson", email: "ines@example.com", role: "participant" },
    { name: "Jasper Kang", email: "jasper@example.com", role: "participant" },
    { name: "Katya Volkov", email: "katya@example.com", role: "participant" },
    { name: "Luca Bianchi", email: "luca@example.com", role: "participant" },
    { name: "Mei-Lin Huang", email: "meilin@example.com", role: "participant" },
    { name: "Nico Fernandez", email: "nico@example.com", role: "participant" },
    { name: "Olivia Park", email: "olivia@example.com", role: "participant" },
    { name: "Pavel Sorokin", email: "pavel@example.com", role: "participant" },
    { name: "Rosa Iglesias", email: "rosa@example.com", role: "participant" },
    { name: "Sanjay Reddy", email: "sanjay@example.com", role: "participant" },
    { name: "Tara Byrne", email: "tara@example.com", role: "participant" },
    { name: "Ulrich Weber", email: "ulrich@example.com", role: "participant" },
    { name: "Valeria Costa", email: "valeria@example.com", role: "participant" },
    { name: "Will Chambers", email: "will@example.com", role: "participant" },
    { name: "Xiomara Reyes", email: "xiomara@example.com", role: "participant" },
    { name: "Yusuf Demir", email: "yusuf@example.com", role: "participant" },
    { name: "Zara Okafor", email: "zara@example.com", role: "participant" },
    { name: "Amir Haddad", email: "amir@example.com", role: "participant" },
    { name: "Bianca Florea", email: "bianca@example.com", role: "participant" },
    { name: "Caleb Nguyen", email: "caleb@example.com", role: "participant" },
    { name: "Dina Kowalski", email: "dina@example.com", role: "participant" },
    { name: "Eliot Russo", email: "eliot@example.com", role: "participant" },
    { name: "Fatima Al-Rashid", email: "fatima@example.com", role: "participant" },
    { name: "Giorgio Conti", email: "giorgio@example.com", role: "participant" },
    { name: "Harper Evans", email: "harper@example.com", role: "participant" },
    { name: "Ivan Popov", email: "ivan@example.com", role: "participant" },
    { name: "Jia Chen", email: "jia@example.com", role: "participant" },
    { name: "Kenji Mori", email: "kenji@example.com", role: "participant" },
    { name: "Luna Ramirez", email: "luna@example.com", role: "participant" },
  ];

  const users = await UserModel.insertMany(
    userDefs.map((u) => ({ ...u, passwordHash }))
  );

  // Index for easy lookup
  const u = Object.fromEntries(users.map((x) => [x.email.split("@")[0].replace(".", "_"), x]));
  // Also by array position for judges
  const judges = users.filter((x) => x.role === "judge");
  const admins = users.filter((x) => x.role === "admin" || x.role === "super_admin");
  const participantUsers = users.filter((x) => x.role === "participant");

  console.log(`✅ Created ${users.length} users\n`);

  // ═══════════════════════════════════════════════════════════════════
  // 2. PARTICIPANT PROFILES
  // ═══════════════════════════════════════════════════════════════════
  console.log("🎯 Creating participant profiles...");

  const skillSets = [
    { skills: ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB"], interests: ["AI", "Web Development", "Open Source"], exp: "advanced" },
    { skills: ["Python", "Go", "PostgreSQL", "Docker", "AWS", "Kubernetes"], interests: ["Cloud Architecture", "DevOps"], exp: "advanced" },
    { skills: ["React", "TypeScript", "CSS", "Figma", "Next.js"], interests: ["UI/UX", "Design Systems"], exp: "intermediate" },
    { skills: ["Python", "TensorFlow", "PyTorch", "Pandas", "SQL"], interests: ["Machine Learning", "NLP"], exp: "intermediate" },
    { skills: ["React Native", "Swift", "Kotlin", "Firebase"], interests: ["Mobile Development", "IoT"], exp: "intermediate" },
    { skills: ["Docker", "Kubernetes", "Terraform", "Python", "Bash"], interests: ["DevOps", "Automation"], exp: "advanced" },
    { skills: ["Python", "PyTorch", "OpenCV", "CUDA"], interests: ["AI", "Computer Vision"], exp: "advanced" },
    { skills: ["Unity", "C#", "Three.js", "WebGL"], interests: ["Game Development", "VR/AR"], exp: "intermediate" },
    { skills: ["Solidity", "Web3.js", "Ethereum", "React"], interests: ["Blockchain", "DeFi"], exp: "intermediate" },
    { skills: ["JavaScript", "Python", "HTML/CSS", "Git"], interests: ["Web Development", "Learning"], exp: "beginner" },
    { skills: ["Figma", "React", "CSS", "Framer Motion"], interests: ["Design Systems", "Prototyping"], exp: "intermediate" },
    { skills: ["Rust", "C++", "Go", "Linux", "WebAssembly"], interests: ["Systems Programming", "Performance"], exp: "advanced" },
    { skills: ["Python", "Apache Spark", "Kafka", "MongoDB", "Airflow"], interests: ["Data Engineering", "Streaming"], exp: "intermediate" },
    { skills: ["Python", "NumPy", "Scikit-learn", "Hugging Face"], interests: ["Machine Learning", "AI Ethics"], exp: "beginner" },
    { skills: ["TypeScript", "React", "Node.js", "WebSockets", "Redis"], interests: ["Real-time Apps", "DX"], exp: "intermediate" },
    { skills: ["Python", "Security", "Cryptography", "Bash"], interests: ["Cybersecurity", "Privacy"], exp: "advanced" },
    { skills: ["AWS", "Serverless", "TypeScript", "GraphQL"], interests: ["Serverless", "Cloud"], exp: "advanced" },
    { skills: ["p5.js", "JavaScript", "Python", "Arduino"], interests: ["Creative Coding", "Generative Art"], exp: "intermediate" },
    { skills: ["Node.js", "Express", "MongoDB", "GraphQL"], interests: ["API Design", "Developer Tools"], exp: "intermediate" },
    { skills: ["JavaScript", "React", "Go", "Git"], interests: ["Open Source", "Community"], exp: "beginner" },
    { skills: ["C", "Rust", "MQTT", "Raspberry Pi", "Python"], interests: ["IoT", "Edge Computing"], exp: "intermediate" },
    { skills: ["Vue.js", "Nuxt", "TypeScript", "Tailwind CSS"], interests: ["Frontend", "DX"], exp: "intermediate" },
    { skills: ["Java", "Spring Boot", "MongoDB", "Kafka"], interests: ["Backend", "Microservices"], exp: "advanced" },
    { skills: ["Flutter", "Dart", "Firebase", "GraphQL"], interests: ["Mobile Development", "Cross-Platform"], exp: "intermediate" },
    { skills: ["Python", "FastAPI", "MongoDB", "LangChain", "OpenAI"], interests: ["AI", "RAG", "LLM"], exp: "advanced" },
  ];

  const bios = [
    "Full-stack developer passionate about AI and web technologies. 3x hackathon winner.",
    "Backend engineer specializing in scalable distributed systems.",
    "Frontend developer and UX enthusiast. I make things beautiful and accessible.",
    "Data scientist exploring ML applications. Kaggle competitor.",
    "Mobile developer building cross-platform apps. Former startup founder.",
    "DevOps engineer who loves automation. If I do something twice, I script it.",
    "AI researcher focused on computer vision and generative models.",
    "Game developer and creative coder. I bring ideas to life.",
    "Blockchain developer building decentralized applications.",
    "First-time hackathon participant! Eager to learn and build.",
    "Product designer who codes. Bridging design and development.",
    "Systems programmer interested in performance optimization.",
    "Data engineer building real-time analytics platforms.",
    "Aspiring ML engineer learning deep learning and NLP.",
    "Real-time apps specialist. WebSockets are my jam.",
    "Security researcher and CTF player. I break things to make them stronger.",
    "Cloud architect passionate about serverless architectures.",
    "Creative technologist at the intersection of art and code.",
    "Backend developer specializing in API design.",
    "Student developer passionate about open source.",
    "Embedded systems engineer venturing into IoT.",
    "Vue.js specialist building elegant frontends.",
    "Java veteran who loves MongoDB and microservices.",
    "Flutter developer creating beautiful mobile experiences.",
    "AI engineer building RAG pipelines and LLM applications.",
  ];

  const participantDefs = participantUsers.map((user, i) => {
    const s = skillSets[i % skillSets.length];
    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      bio: bios[i % bios.length],
      skills: s.skills,
      interests: s.interests,
      experience_level: s.exp,
    };
  });

  const participants = await ParticipantModel.insertMany(participantDefs);
  console.log(`✅ Created ${participants.length} participant profiles\n`);

  const pByUser = (userId: any) =>
    participants.find((p) => p.userId.toString() === userId.toString())!;

  // ═══════════════════════════════════════════════════════════════════
  // 3. PARTNERS — 10 companies
  // ═══════════════════════════════════════════════════════════════════
  console.log("🤝 Creating partners...");

  const partners = await PartnerModel.insertMany([
    {
      name: "MongoDB Inc.", description: "The leading modern database platform.", website: "https://www.mongodb.com", industry: "Database Technology", tier: "platinum", status: "active",
      companyInfo: { size: "enterprise", headquarters: "New York, NY", foundedYear: 2007, employeeCount: "5000+" },
      contacts: [{ name: "Developer Relations Team", email: "devrel@mongodb.com", role: "Developer Relations", isPrimary: true }],
      social: { linkedin: "https://linkedin.com/company/mongodb", twitter: "https://twitter.com/MongoDB", github: "https://github.com/mongodb" },
      tags: ["database", "nosql", "cloud", "atlas", "ai"],
      engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "high" },
    },
    {
      name: "Vercel", description: "Frontend cloud platform for developers.", website: "https://vercel.com", industry: "Cloud Hosting", tier: "gold", status: "active",
      companyInfo: { size: "medium", headquarters: "San Francisco, CA", foundedYear: 2015 },
      contacts: [{ name: "Partnership Team", email: "partnerships@vercel.com", role: "Partnerships", isPrimary: true }],
      tags: ["hosting", "serverless", "nextjs"], engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "medium" },
    },
    {
      name: "GitHub", description: "Where the world builds software.", website: "https://github.com", industry: "Developer Tools", tier: "gold", status: "active",
      companyInfo: { size: "enterprise", headquarters: "San Francisco, CA", foundedYear: 2008 },
      contacts: [{ name: "Events Team", email: "events@github.com", role: "Events", isPrimary: true }],
      tags: ["git", "open-source", "collaboration"], engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "high" },
    },
    {
      name: "JetBrains", description: "Essential tools for software developers.", website: "https://www.jetbrains.com", industry: "Developer Tools", tier: "silver", status: "active",
      companyInfo: { size: "large", headquarters: "Prague, Czech Republic", foundedYear: 2000 },
      contacts: [{ name: "Community Relations", email: "community@jetbrains.com", role: "Community", isPrimary: true }],
      tags: ["ide", "productivity", "development-tools"], engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "medium" },
    },
    {
      name: "AWS", description: "Amazon Web Services — cloud computing platform.", website: "https://aws.amazon.com", industry: "Cloud Computing", tier: "platinum", status: "active",
      companyInfo: { size: "enterprise", headquarters: "Seattle, WA", foundedYear: 2006 },
      contacts: [{ name: "Startup Programs", email: "startups@aws.amazon.com", role: "Startup Programs", isPrimary: true }],
      tags: ["cloud", "serverless", "ai", "infrastructure"], engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "high" },
    },
    {
      name: "Anthropic", description: "AI safety company building reliable AI systems.", website: "https://www.anthropic.com", industry: "Artificial Intelligence", tier: "gold", status: "active",
      companyInfo: { size: "medium", headquarters: "San Francisco, CA", foundedYear: 2021 },
      contacts: [{ name: "Developer Relations", email: "devrel@anthropic.com", role: "Developer Relations", isPrimary: true }],
      tags: ["ai", "llm", "safety", "claude"], engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "medium" },
    },
    {
      name: "Stripe", description: "Financial infrastructure for the internet.", website: "https://stripe.com", industry: "FinTech", tier: "silver", status: "active",
      companyInfo: { size: "large", headquarters: "San Francisco, CA", foundedYear: 2010 },
      contacts: [{ name: "Developer Advocacy", email: "dev-advocacy@stripe.com", role: "Developer Advocacy", isPrimary: true }],
      tags: ["payments", "fintech", "api"], engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "low" },
    },
    {
      name: "Datadog", description: "Monitoring and analytics platform for cloud applications.", website: "https://www.datadoghq.com", industry: "Observability", tier: "silver", status: "active",
      companyInfo: { size: "large", headquarters: "New York, NY", foundedYear: 2010 },
      contacts: [{ name: "Partner Team", email: "partners@datadoghq.com", role: "Partnerships", isPrimary: true }],
      tags: ["monitoring", "observability", "devops"], engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "low" },
    },
    {
      name: "Twilio", description: "Cloud communications platform for developers.", website: "https://www.twilio.com", industry: "Communications", tier: "bronze", status: "active",
      companyInfo: { size: "large", headquarters: "San Francisco, CA", foundedYear: 2008 },
      contacts: [{ name: "Developer Events", email: "events@twilio.com", role: "Events", isPrimary: true }],
      tags: ["communications", "api", "sms", "voice"], engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "low" },
    },
    {
      name: "DigitalOcean", description: "Cloud infrastructure for developers.", website: "https://www.digitalocean.com", industry: "Cloud Hosting", tier: "community", status: "active",
      companyInfo: { size: "medium", headquarters: "New York, NY", foundedYear: 2011 },
      contacts: [{ name: "Community Team", email: "community@digitalocean.com", role: "Community", isPrimary: true }],
      tags: ["cloud", "hosting", "kubernetes"], engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "low" },
    },
  ]);

  const partnerByName = (n: string) => partners.find((p) => p.name === n)!;
  console.log(`✅ Created ${partners.length} partners\n`);

  // ═══════════════════════════════════════════════════════════════════
  // 4. EVENTS — 8 events across all lifecycle stages
  // ═══════════════════════════════════════════════════════════════════
  console.log("📅 Creating events...");
  const admin = admins[1]; // admin@mongohacks.com
  const organizer = users.find((u) => u.email === "organizer@mongohacks.com")!;

  // Event 1: CONCLUDED — Summer Hackathon 2025 (fully judged, winners, feedback)
  const summerEvent = await EventModel.create({
    name: "MongoDB Summer Hackathon 2025",
    description: "Our flagship summer event. Three days of building data-driven apps with MongoDB Atlas, real-time features, and AI integration.",
    theme: "Data Innovation",
    startDate: new Date("2025-07-15T09:00:00Z"),
    endDate: new Date("2025-07-17T18:00:00Z"),
    registrationDeadline: new Date("2025-07-10T23:59:59Z"),
    submissionDeadline: new Date("2025-07-17T15:00:00Z"),
    location: "MongoDB HQ, New York, NY",
    city: "New York", country: "United States", venue: "MongoDB Headquarters",
    capacity: 120, isVirtual: false,
    tags: ["AI", "Database", "Full Stack", "MongoDB"],
    rules: "Teams of 2-5. Must use MongoDB. All code written during the event.",
    judging_criteria: ["Innovation", "Technical Complexity", "Impact", "Presentation"],
    judgingRubric: [
      { name: "Innovation", description: "Originality and creativity of the solution", weight: 25, maxScore: 10 },
      { name: "Technical Complexity", description: "Depth of technical implementation", weight: 25, maxScore: 10 },
      { name: "Impact", description: "Potential real-world impact", weight: 25, maxScore: 10 },
      { name: "Presentation", description: "Demo quality and communication", weight: 25, maxScore: 10 },
    ],
    organizers: [admin._id, organizer._id],
    partners: [partnerByName("MongoDB Inc.")._id, partnerByName("AWS")._id, partnerByName("GitHub")._id],
    status: "concluded",
    resultsPublished: true,
    resultsPublishedAt: new Date("2025-07-19T12:00:00Z"),
    coordinates: { type: "Point", coordinates: [-74.006, 40.7128] },
    landingPage: {
      template: "modern", slug: "mongodb-summer-2025", published: true,
      customContent: {
        hero: { headline: "MongoDB Summer Hackathon 2025", subheadline: "Event concluded — See results!", ctaText: "View Results" },
        prizes: [
          { title: "Grand Prize", description: "Overall winner", value: "$5,000" },
          { title: "Best AI Integration", description: "Best use of AI", value: "$2,500" },
          { title: "Best MongoDB Use", description: "Creative MongoDB usage", value: "$2,000" },
        ],
      },
    },
  });

  // Event 2: CONCLUDED — Winter Hackathon 2025
  const winterEvent = await EventModel.create({
    name: "MongoDB Winter Hackathon 2025",
    description: "Build full-stack applications powered by MongoDB. A weekend of intense coding, learning, and fun.",
    theme: "Full Stack Development",
    startDate: new Date("2025-12-10T09:00:00Z"),
    endDate: new Date("2025-12-12T18:00:00Z"),
    registrationDeadline: new Date("2025-12-05T23:59:59Z"),
    submissionDeadline: new Date("2025-12-12T15:00:00Z"),
    location: "Austin Convention Center",
    city: "Austin", country: "United States", venue: "Austin Convention Center",
    capacity: 80, isVirtual: false,
    tags: ["Full Stack", "MERN", "APIs"],
    rules: "Build full-stack applications using MongoDB.",
    judging_criteria: ["Functionality", "Design", "Code Quality", "Innovation"],
    judgingRubric: [
      { name: "Functionality", description: "Does it work well?", weight: 30, maxScore: 10 },
      { name: "Design", description: "UI/UX quality", weight: 20, maxScore: 10 },
      { name: "Code Quality", description: "Clean, maintainable code", weight: 25, maxScore: 10 },
      { name: "Innovation", description: "Creative approach", weight: 25, maxScore: 10 },
    ],
    organizers: [admin._id],
    partners: [partnerByName("MongoDB Inc.")._id, partnerByName("Vercel")._id],
    status: "concluded",
    resultsPublished: true,
    resultsPublishedAt: new Date("2025-12-14T12:00:00Z"),
    coordinates: { type: "Point", coordinates: [-97.7431, 30.2672] },
    landingPage: {
      template: "modern", slug: "mongodb-winter-2025", published: true,
      customContent: {
        hero: { headline: "MongoDB Winter Hackathon 2025", subheadline: "Event concluded — See results!", ctaText: "View Results" },
      },
    },
  });

  // Event 3: IN_PROGRESS — Global AI Hackathon (happening NOW)
  const aiGlobalEvent = await EventModel.create({
    name: "Global AI Hackathon 2026",
    description: "A worldwide virtual hackathon focused on building AI-powered applications. Use LLMs, RAG, vector search, and more.",
    theme: "Artificial Intelligence",
    startDate: new Date("2026-02-25T09:00:00Z"),
    endDate: new Date("2026-02-28T18:00:00Z"),
    registrationDeadline: new Date("2026-02-24T23:59:59Z"),
    submissionDeadline: new Date("2026-02-28T15:00:00Z"),
    location: "Virtual Event",
    city: "Online", country: "Global", venue: "Online Platform",
    capacity: 500, isVirtual: true,
    tags: ["AI", "LLM", "RAG", "Vector Search", "MongoDB"],
    rules: "Open to all. Must include an AI/ML component. Teams up to 5.",
    judging_criteria: ["Innovation", "Technical Merit", "Practicality", "Demo Quality"],
    judgingRubric: [
      { name: "Innovation", description: "Novel use of AI", weight: 30, maxScore: 10 },
      { name: "Technical Merit", description: "Technical depth", weight: 25, maxScore: 10 },
      { name: "Practicality", description: "Real-world usefulness", weight: 25, maxScore: 10 },
      { name: "Demo Quality", description: "Presentation and polish", weight: 20, maxScore: 10 },
    ],
    organizers: [admin._id, organizer._id],
    partners: [partnerByName("MongoDB Inc.")._id, partnerByName("Anthropic")._id, partnerByName("AWS")._id],
    status: "in_progress",
    coordinates: { type: "Point", coordinates: [0, 0] },
    landingPage: {
      template: "tech", slug: "global-ai-2026", published: true,
      customContent: {
        hero: { headline: "Global AI Hackathon 2026", subheadline: "Build the future with AI", ctaText: "Hacking in Progress!" },
      },
    },
  });

  // Event 4: OPEN — Spring Hackathon 2026 (primary upcoming event)
  const springEvent = await EventModel.create({
    name: "MongoDB Spring Hackathon 2026",
    description: "Build the next generation of database-powered applications. Three days of hacking, mentorship, and prizes.",
    theme: "AI & Data",
    startDate: new Date("2026-03-20T09:00:00Z"),
    endDate: new Date("2026-03-22T18:00:00Z"),
    registrationDeadline: new Date("2026-03-15T23:59:59Z"),
    submissionDeadline: new Date("2026-03-22T15:00:00Z"),
    location: "MongoDB HQ, New York, NY",
    city: "New York", country: "United States", venue: "MongoDB Headquarters",
    capacity: 100, isVirtual: false,
    tags: ["AI", "Database", "Web Development", "MongoDB", "Atlas"],
    rules: "Teams of 2-5 members. Projects must use MongoDB. All code written during the hackathon.",
    judging_criteria: ["Innovation", "Technical Complexity", "Impact", "Presentation"],
    judgingRubric: [
      { name: "Innovation", description: "Originality", weight: 25, maxScore: 10 },
      { name: "Technical Complexity", description: "Technical depth", weight: 25, maxScore: 10 },
      { name: "Impact", description: "Real-world impact", weight: 25, maxScore: 10 },
      { name: "Presentation", description: "Demo quality", weight: 25, maxScore: 10 },
    ],
    organizers: [admin._id, organizer._id],
    partners: [partnerByName("MongoDB Inc.")._id, partnerByName("Vercel")._id, partnerByName("GitHub")._id, partnerByName("JetBrains")._id],
    status: "open",
    coordinates: { type: "Point", coordinates: [-74.006, 40.7128] },
    landingPage: {
      template: "modern", slug: "mongodb-spring-2026", published: true,
      customContent: {
        hero: { headline: "MongoDB Spring Hackathon 2026", subheadline: "Build the future of data-driven apps", ctaText: "Register Now" },
        prizes: [
          { title: "Grand Prize", description: "Overall winner", value: "$5,000" },
          { title: "Runner Up", description: "Second place", value: "$2,500" },
          { title: "Best MongoDB Integration", description: "Sponsor Prize", value: "$2,500" },
        ],
        schedule: [
          { time: "9:00 AM - Day 1", title: "Opening Ceremony", description: "Welcome and rules" },
          { time: "10:00 AM - Day 1", title: "Hacking Begins!", description: "Start building" },
          { time: "3:00 PM - Day 3", title: "Submissions Due", description: "Final deadline" },
          { time: "6:00 PM - Day 3", title: "Awards Ceremony", description: "Winners announced!" },
        ],
        faq: [
          { question: "Do I need a team?", answer: "You can register solo and find a team on the platform." },
          { question: "What can I build?", answer: "Anything that uses MongoDB!" },
        ],
      },
    },
  });

  // Event 5: OPEN — European Hackathon
  const euroEvent = await EventModel.create({
    name: "MongoDB Europe Hackathon 2026",
    description: "European edition of our hackathon series. Build innovative solutions with MongoDB technology.",
    theme: "Cloud Native",
    startDate: new Date("2026-04-15T09:00:00Z"),
    endDate: new Date("2026-04-17T18:00:00Z"),
    registrationDeadline: new Date("2026-04-10T23:59:59Z"),
    location: "Berlin Tech Hub",
    city: "Berlin", country: "Germany", venue: "Factory Berlin",
    capacity: 80, isVirtual: false,
    tags: ["Cloud Native", "Kubernetes", "Serverless", "MongoDB"],
    rules: "Teams of 2-5. Cloud-native architecture required.",
    judging_criteria: ["Architecture", "Scalability", "Innovation", "Presentation"],
    organizers: [admin._id],
    partners: [partnerByName("MongoDB Inc.")._id, partnerByName("Datadog")._id],
    status: "open",
    coordinates: { type: "Point", coordinates: [13.405, 52.52] },
    landingPage: {
      template: "bold", slug: "mongodb-europe-2026", published: true,
      customContent: {
        hero: { headline: "MongoDB Europe Hackathon 2026", subheadline: "Cloud native innovation in Berlin", ctaText: "Register Now" },
      },
    },
  });

  // Event 6: OPEN — DevTools Hackathon (virtual)
  const devtoolsEvent = await EventModel.create({
    name: "DevTools Hackathon 2026",
    description: "Build the developer tools of tomorrow. CLI tools, IDE extensions, SDKs, documentation — if it helps devs, we want to see it.",
    theme: "Developer Experience",
    startDate: new Date("2026-05-01T09:00:00Z"),
    endDate: new Date("2026-05-03T18:00:00Z"),
    registrationDeadline: new Date("2026-04-28T23:59:59Z"),
    location: "Virtual Event",
    city: "Online", country: "Global", venue: "Online Platform",
    capacity: 200, isVirtual: true,
    tags: ["DevTools", "CLI", "SDK", "DX", "Open Source"],
    rules: "Open to all. Must be a developer tool or improvement to developer workflows.",
    judging_criteria: ["Usefulness", "Innovation", "Code Quality", "Documentation"],
    organizers: [organizer._id],
    partners: [partnerByName("GitHub")._id, partnerByName("JetBrains")._id],
    status: "open",
    coordinates: { type: "Point", coordinates: [0, 0] },
    landingPage: {
      template: "tech", slug: "devtools-2026", published: true,
      customContent: { hero: { headline: "DevTools Hackathon 2026", subheadline: "Build what devs need", ctaText: "Join Now" } },
    },
  });

  // Event 7: DRAFT — FinTech Hackathon (future)
  const fintechEvent = await EventModel.create({
    name: "FinTech Innovation Hackathon",
    description: "Build the future of financial technology. Payments, lending, trading, and more.",
    theme: "Financial Technology",
    startDate: new Date("2026-06-20T09:00:00Z"),
    endDate: new Date("2026-06-22T18:00:00Z"),
    registrationDeadline: new Date("2026-06-15T23:59:59Z"),
    location: "London, UK",
    city: "London", country: "United Kingdom", venue: "TechHub London",
    capacity: 100, isVirtual: false,
    tags: ["FinTech", "Payments", "Blockchain", "AI"],
    rules: "Teams of 2-5. Financial services theme required.",
    judging_criteria: ["Innovation", "Security", "Scalability", "Business Viability"],
    organizers: [admin._id],
    partners: [partnerByName("Stripe")._id],
    status: "draft",
    coordinates: { type: "Point", coordinates: [-0.1276, 51.5074] },
    landingPage: { template: "modern", slug: "fintech-2026", published: false, customContent: { hero: { headline: "FinTech Innovation Hackathon", subheadline: "Coming soon", ctaText: "Stay Tuned" } } },
  });

  // Event 8: DRAFT — IoT Hackathon
  const iotEvent = await EventModel.create({
    name: "IoT & Edge Computing Hackathon",
    description: "Build connected solutions with IoT devices and edge computing. Raspberry Pi, Arduino, sensors, and MongoDB.",
    theme: "Internet of Things",
    startDate: new Date("2026-08-10T09:00:00Z"),
    endDate: new Date("2026-08-12T18:00:00Z"),
    registrationDeadline: new Date("2026-08-05T23:59:59Z"),
    location: "Tokyo Innovation Center",
    city: "Tokyo", country: "Japan", venue: "Tokyo Big Sight",
    capacity: 60, isVirtual: false,
    tags: ["IoT", "Edge Computing", "Embedded", "Sensors"],
    rules: "Must involve hardware or IoT protocols.",
    judging_criteria: ["Hardware Integration", "Innovation", "Practicality", "Demo"],
    organizers: [admin._id],
    status: "draft",
    coordinates: { type: "Point", coordinates: [139.6917, 35.6895] },
    landingPage: { template: "bold", slug: "iot-2026", published: false, customContent: { hero: { headline: "IoT & Edge Hackathon", subheadline: "Connect everything", ctaText: "Coming Soon" } } },
  });

  const allEvents = [summerEvent, winterEvent, aiGlobalEvent, springEvent, euroEvent, devtoolsEvent, fintechEvent, iotEvent];
  console.log(`✅ Created ${allEvents.length} events\n`);

  // ═══════════════════════════════════════════════════════════════════
  // 5. EVENT REGISTRATIONS
  // ═══════════════════════════════════════════════════════════════════
  console.log("📝 Registering participants for events...");

  // Helper: register participants for an event using atomic $push to avoid version conflicts
  async function registerParticipants(users: typeof participantUsers, eventId: any, registrationDate: Date, status: string) {
    for (const user of users) {
      await ParticipantModel.updateOne(
        { userId: user._id },
        { $push: { registeredEvents: { eventId, registrationDate, status } } }
      );
    }
  }

  // Summer 2025 (concluded) — 30 participants
  await registerParticipants(participantUsers.slice(0, 30), summerEvent._id, new Date("2025-07-01"), "attended");

  // Winter 2025 (concluded) — 20 participants
  await registerParticipants(participantUsers.slice(5, 25), winterEvent._id, new Date("2025-12-01"), "attended");

  // Global AI (in_progress) — 40 participants
  await registerParticipants(participantUsers.slice(0, 40), aiGlobalEvent._id, new Date("2026-02-20"), "registered");

  // Spring 2026 (open) — 25 participants
  await registerParticipants(participantUsers.slice(0, 25), springEvent._id, new Date("2026-02-15"), "registered");

  // Europe (open) — 15 participants
  await registerParticipants(participantUsers.slice(20, 35), euroEvent._id, new Date("2026-03-15"), "registered");

  // DevTools (open) — 18 participants
  await registerParticipants(participantUsers.slice(10, 28), devtoolsEvent._id, new Date("2026-04-01"), "registered");

  // Keep references for use in later sections (notifications, activity logs, etc.)
  const summerParts = participantUsers.slice(0, 30);
  const winterParts = participantUsers.slice(5, 25);
  const aiParts = participantUsers.slice(0, 40);
  const springParts = participantUsers.slice(0, 25);

  console.log("✅ Registered participants across all events\n");

  // ═══════════════════════════════════════════════════════════════════
  // 6. TEAMS — across all active events
  // ═══════════════════════════════════════════════════════════════════
  console.log("👥 Creating teams...");

  // Helper to create a team
  async function createTeam(opts: { name: string; desc: string; eventId: any; leader: any; members: any[]; skills?: string[]; lookingForMembers?: boolean; status?: string; platform?: string }) {
    return TeamModel.create({
      name: opts.name,
      description: opts.desc,
      eventId: opts.eventId,
      leaderId: opts.leader._id,
      members: opts.members.map((m: any) => m._id),
      lookingForMembers: opts.lookingForMembers ?? true,
      desiredSkills: opts.skills || [],
      maxMembers: 5,
      status: opts.status || "forming",
      communicationPlatform: opts.platform || undefined,
    });
  }

  // --- SUMMER EVENT TEAMS (concluded, 8 teams) ---
  const summerTeam1 = await createTeam({ name: "Quantum Coders", desc: "AI-first development team pushing boundaries.", eventId: summerEvent._id, leader: participantUsers[0], members: participantUsers.slice(0, 4), status: "active", lookingForMembers: false });
  const summerTeam2 = await createTeam({ name: "Data Dynamos", desc: "Data engineering specialists.", eventId: summerEvent._id, leader: participantUsers[4], members: participantUsers.slice(4, 7), status: "active", lookingForMembers: false });
  const summerTeam3 = await createTeam({ name: "Cloud Riders", desc: "Cloud-native builders.", eventId: summerEvent._id, leader: participantUsers[7], members: participantUsers.slice(7, 10), status: "active", lookingForMembers: false });
  const summerTeam4 = await createTeam({ name: "Byte Builders", desc: "Full-stack app creators.", eventId: summerEvent._id, leader: participantUsers[10], members: participantUsers.slice(10, 14), status: "active", lookingForMembers: false });
  const summerTeam5 = await createTeam({ name: "Neural Nets", desc: "ML and deep learning enthusiasts.", eventId: summerEvent._id, leader: participantUsers[14], members: participantUsers.slice(14, 17), status: "active", lookingForMembers: false });
  const summerTeam6 = await createTeam({ name: "Green Stack", desc: "Sustainable tech solutions.", eventId: summerEvent._id, leader: participantUsers[17], members: participantUsers.slice(17, 20), status: "active", lookingForMembers: false });
  const summerTeam7 = await createTeam({ name: "Rapid Prototypers", desc: "Speed is our superpower.", eventId: summerEvent._id, leader: participantUsers[20], members: participantUsers.slice(20, 23), status: "active", lookingForMembers: false });
  const summerTeam8 = await createTeam({ name: "Code Alchemists", desc: "Turning ideas into gold.", eventId: summerEvent._id, leader: participantUsers[23], members: participantUsers.slice(23, 26), status: "active", lookingForMembers: false });
  const summerTeams = [summerTeam1, summerTeam2, summerTeam3, summerTeam4, summerTeam5, summerTeam6, summerTeam7, summerTeam8];

  // --- WINTER EVENT TEAMS (concluded, 5 teams) ---
  const winterTeam1 = await createTeam({ name: "MERN Masters", desc: "Full-stack MERN mastery.", eventId: winterEvent._id, leader: participantUsers[5], members: participantUsers.slice(5, 9), status: "active", lookingForMembers: false });
  const winterTeam2 = await createTeam({ name: "API Artisans", desc: "Crafting elegant APIs.", eventId: winterEvent._id, leader: participantUsers[9], members: participantUsers.slice(9, 12), status: "active", lookingForMembers: false });
  const winterTeam3 = await createTeam({ name: "Open Sourcerers", desc: "Everything open source.", eventId: winterEvent._id, leader: participantUsers[12], members: participantUsers.slice(12, 14), status: "active", lookingForMembers: false });
  const winterTeam4 = await createTeam({ name: "Pixel Perfect", desc: "Design-driven development.", eventId: winterEvent._id, leader: participantUsers[14], members: participantUsers.slice(14, 17), status: "active", lookingForMembers: false });
  const winterTeam5 = await createTeam({ name: "Stack Overflow", desc: "We debug everything.", eventId: winterEvent._id, leader: participantUsers[17], members: participantUsers.slice(17, 20), status: "active", lookingForMembers: false });
  const winterTeams = [winterTeam1, winterTeam2, winterTeam3, winterTeam4, winterTeam5];

  // --- GLOBAL AI EVENT TEAMS (in_progress, 10 teams) ---
  const aiTeam1 = await createTeam({ name: "Neural Navigators", desc: "Deep learning explorers.", eventId: aiGlobalEvent._id, leader: participantUsers[0], members: participantUsers.slice(0, 4), status: "active", lookingForMembers: false });
  const aiTeam2 = await createTeam({ name: "Prompt Engineers", desc: "LLM-powered innovation.", eventId: aiGlobalEvent._id, leader: participantUsers[4], members: participantUsers.slice(4, 7), status: "active", lookingForMembers: false });
  const aiTeam3 = await createTeam({ name: "RAG Masters", desc: "Retrieval-augmented everything.", eventId: aiGlobalEvent._id, leader: participantUsers[7], members: participantUsers.slice(7, 10), status: "active", lookingForMembers: false });
  const aiTeam4 = await createTeam({ name: "Vector Voyagers", desc: "Embeddings are our compass.", eventId: aiGlobalEvent._id, leader: participantUsers[10], members: participantUsers.slice(10, 13), status: "active", lookingForMembers: false });
  const aiTeam5 = await createTeam({ name: "Transformer Tribe", desc: "Attention is all we need.", eventId: aiGlobalEvent._id, leader: participantUsers[13], members: participantUsers.slice(13, 16), status: "active", lookingForMembers: false });
  const aiTeam6 = await createTeam({ name: "Agent Architects", desc: "Building autonomous AI agents.", eventId: aiGlobalEvent._id, leader: participantUsers[16], members: participantUsers.slice(16, 19), status: "active", lookingForMembers: false });
  const aiTeam7 = await createTeam({ name: "ML Mavericks", desc: "Machine learning pioneers.", eventId: aiGlobalEvent._id, leader: participantUsers[19], members: participantUsers.slice(19, 22), status: "active", lookingForMembers: true, skills: ["Python", "React"] });
  const aiTeam8 = await createTeam({ name: "DataSense", desc: "Making sense of data with AI.", eventId: aiGlobalEvent._id, leader: participantUsers[22], members: participantUsers.slice(22, 25), status: "active", lookingForMembers: false });
  const aiTeam9 = await createTeam({ name: "Cognitive Coders", desc: "AI-augmented development.", eventId: aiGlobalEvent._id, leader: participantUsers[25], members: participantUsers.slice(25, 28), status: "active", lookingForMembers: true, skills: ["UI/UX", "React"] });
  const aiTeam10 = await createTeam({ name: "DeepDive", desc: "Going deep into AI research.", eventId: aiGlobalEvent._id, leader: participantUsers[28], members: participantUsers.slice(28, 31), status: "active", lookingForMembers: false });
  const aiTeams = [aiTeam1, aiTeam2, aiTeam3, aiTeam4, aiTeam5, aiTeam6, aiTeam7, aiTeam8, aiTeam9, aiTeam10];

  // --- SPRING EVENT TEAMS (open, 6 teams, some looking for members) ---
  const springTeam1 = await createTeam({ name: "Code Crushers", desc: "We crush bugs and build amazing apps.", eventId: springEvent._id, leader: participantUsers[0], members: participantUsers.slice(0, 3), skills: ["MongoDB", "Node.js", "DevOps"], platform: "discord" });
  const springTeam2 = await createTeam({ name: "Data Wizards", desc: "Turning data into magic with ML.", eventId: springEvent._id, leader: participantUsers[3], members: participantUsers.slice(3, 5), skills: ["React", "TypeScript", "UI/UX"] });
  const springTeam3 = await createTeam({ name: "The Fullstack Five", desc: "End-to-end builders.", eventId: springEvent._id, leader: participantUsers[5], members: participantUsers.slice(5, 8), skills: ["Python", "AI", "TensorFlow"] });
  const springTeam4 = await createTeam({ name: "Atlas Architects", desc: "MongoDB Atlas power users.", eventId: springEvent._id, leader: participantUsers[8], members: participantUsers.slice(8, 10), skills: ["MongoDB", "Node.js", "React"] });
  const springTeam5 = await createTeam({ name: "Pixel Pioneers", desc: "Design-forward hackathon team.", eventId: springEvent._id, leader: participantUsers[10], members: participantUsers.slice(10, 12), skills: ["Backend", "MongoDB"] });
  const springTeam6 = await createTeam({ name: "Security First", desc: "Building secure-by-default apps.", eventId: springEvent._id, leader: participantUsers[12], members: [participantUsers[12]], skills: ["React", "TypeScript", "Auth"] });
  const springTeams = [springTeam1, springTeam2, springTeam3, springTeam4, springTeam5, springTeam6];

  // --- EUROPE EVENT TEAMS (open, 3 teams) ---
  const euroTeam1 = await createTeam({ name: "Berlin Bytes", desc: "Cloud-native from the heart of Europe.", eventId: euroEvent._id, leader: participantUsers[20], members: participantUsers.slice(20, 24), skills: ["Kubernetes", "Go"] });
  const euroTeam2 = await createTeam({ name: "Nordic Nodes", desc: "Distributed systems specialists.", eventId: euroEvent._id, leader: participantUsers[24], members: participantUsers.slice(24, 27), skills: ["Docker", "AWS"] });
  const euroTeam3 = await createTeam({ name: "Alpine Architects", desc: "Scaling to the peaks.", eventId: euroEvent._id, leader: participantUsers[27], members: participantUsers.slice(27, 29), skills: ["React", "MongoDB", "Serverless"] });
  const euroTeams = [euroTeam1, euroTeam2, euroTeam3];

  // --- DEVTOOLS EVENT TEAMS (open, 4 teams) ---
  const dtTeam1 = await createTeam({ name: "CLI Crafters", desc: "Terminal is our IDE.", eventId: devtoolsEvent._id, leader: participantUsers[10], members: participantUsers.slice(10, 13), skills: ["Go", "Rust"] });
  const dtTeam2 = await createTeam({ name: "Extension Factory", desc: "IDE extensions for everyone.", eventId: devtoolsEvent._id, leader: participantUsers[13], members: participantUsers.slice(13, 16), skills: ["TypeScript", "VS Code API"] });
  const dtTeam3 = await createTeam({ name: "DX Engineers", desc: "Developer experience first.", eventId: devtoolsEvent._id, leader: participantUsers[16], members: participantUsers.slice(16, 19), skills: ["React", "Documentation"] });
  const dtTeam4 = await createTeam({ name: "SDK Smiths", desc: "Building SDKs that developers love.", eventId: devtoolsEvent._id, leader: participantUsers[19], members: participantUsers.slice(19, 22), skills: ["Python", "Node.js", "API Design"] });
  const dtTeams = [dtTeam1, dtTeam2, dtTeam3, dtTeam4];

  const allTeams = [...summerTeams, ...winterTeams, ...aiTeams, ...springTeams, ...euroTeams, ...dtTeams];
  console.log(`✅ Created ${allTeams.length} teams\n`);

  // ═══════════════════════════════════════════════════════════════════
  // 7. PROJECTS — rich variety across events
  // ═══════════════════════════════════════════════════════════════════
  console.log("💻 Creating projects...");

  // Project definitions organized by event
  const projectDefs: Array<{
    name: string; description: string; eventId: any; teamId: any; teamMembers: any[];
    category: string; technologies: string[]; repoUrl: string; demoUrl?: string;
    innovations: string; status: string; featured?: boolean; thumbnailUrl?: string;
    submissionDate?: Date;
  }> = [
    // ── SUMMER EVENT (concluded) — 8 projects, all judged ──
    { name: "AtlasVision", description: "Real-time MongoDB Atlas monitoring dashboard with AI anomaly detection. Visualizes cluster metrics, slow queries, and connection patterns using change streams and time-series data.", eventId: summerEvent._id, teamId: summerTeam1._id, teamMembers: summerTeam1.members, category: "DevTools", technologies: ["React", "Node.js", "MongoDB Atlas", "D3.js", "OpenAI"], repoUrl: "https://github.com/mongodb-developer/get-started-nodejs", demoUrl: "https://atlasvision-demo.vercel.app", innovations: "Anomaly detection using MongoDB time-series collections with sliding window aggregations.", status: "judged", featured: true, thumbnailUrl: thumbnails[0], submissionDate: new Date("2025-07-17T14:00:00Z") },
    { name: "StreamForge", description: "Visual data pipeline builder for MongoDB change streams. Drag-and-drop interface to create, test, and deploy real-time data processors.", eventId: summerEvent._id, teamId: summerTeam2._id, teamMembers: summerTeam2.members, category: "Data Engineering", technologies: ["React", "Python", "MongoDB Change Streams", "FastAPI"], repoUrl: "https://github.com/mongodb-developer/mongodb-with-fastapi", innovations: "Visual DSL that compiles to MongoDB change stream aggregation pipelines.", status: "judged", featured: true, thumbnailUrl: thumbnails[1], submissionDate: new Date("2025-07-17T14:30:00Z") },
    { name: "CloudMap", description: "Interactive cloud infrastructure mapper that discovers and visualizes your cloud resources stored in MongoDB. Shows dependencies and costs.", eventId: summerEvent._id, teamId: summerTeam3._id, teamMembers: summerTeam3.members, category: "Infrastructure", technologies: ["Next.js", "MongoDB", "AWS SDK", "Cytoscape.js"], repoUrl: "https://github.com/mongodb-developer/search-lab", innovations: "Graph-based resource discovery using MongoDB $graphLookup.", status: "judged", featured: true, thumbnailUrl: thumbnails[2], submissionDate: new Date("2025-07-17T13:00:00Z") },
    { name: "DocuSearch", description: "Full-text and semantic search engine for technical documentation. Indexes markdown files and provides AI-powered Q&A.", eventId: summerEvent._id, teamId: summerTeam4._id, teamMembers: summerTeam4.members, category: "AI/ML", technologies: ["Python", "MongoDB Atlas Vector Search", "LangChain", "React"], repoUrl: "https://github.com/mongodb-developer/GenAI-Showcase", innovations: "Hybrid search combining Atlas Search full-text with vector similarity.", status: "judged", featured: true, thumbnailUrl: thumbnails[3], submissionDate: new Date("2025-07-17T15:00:00Z") },
    { name: "PredictFlow", description: "No-code ML pipeline builder that stores models, data, and predictions in MongoDB. Train, evaluate, and deploy models from a web UI.", eventId: summerEvent._id, teamId: summerTeam5._id, teamMembers: summerTeam5.members, category: "AI/ML", technologies: ["Python", "Scikit-learn", "MongoDB", "React", "FastAPI"], repoUrl: "https://github.com/mongodb-labs/mongo-snippets", innovations: "Model versioning and A/B testing powered by MongoDB document versioning.", status: "judged", featured: true, thumbnailUrl: thumbnails[4], submissionDate: new Date("2025-07-17T14:45:00Z") },
    { name: "GreenGrid", description: "Climate data aggregation platform collecting real-time environmental sensor data. Visualizes carbon footprint patterns across cities.", eventId: summerEvent._id, teamId: summerTeam6._id, teamMembers: summerTeam6.members, category: "Climate Tech", technologies: ["Python", "Flask", "MongoDB Atlas", "Leaflet", "Redis"], repoUrl: "https://github.com/mongodb-developer/mongodb-with-fastapi", demoUrl: "https://greengrid.streamlit.app", innovations: "Geospatial aggregation with MongoDB 2dsphere indexes for environmental zone classification.", status: "judged", featured: true, thumbnailUrl: thumbnails[5], submissionDate: new Date("2025-07-17T13:30:00Z") },
    { name: "SkillForge", description: "AI-powered coding challenge platform that adapts difficulty based on your skill level using vector embeddings.", eventId: summerEvent._id, teamId: summerTeam7._id, teamMembers: summerTeam7.members, category: "EdTech", technologies: ["React", "Node.js", "MongoDB Atlas Vector Search", "Python"], repoUrl: "https://github.com/mongodb-developer/search-lab", innovations: "Adaptive difficulty using vector similarity between skill profiles and challenges.", status: "judged", thumbnailUrl: thumbnails[6], submissionDate: new Date("2025-07-17T14:15:00Z") },
    { name: "MongoMesh", description: "Real-time service mesh dashboard built on MongoDB change streams. Visualizes microservice communication patterns.", eventId: summerEvent._id, teamId: summerTeam8._id, teamMembers: summerTeam8.members, category: "DevTools", technologies: ["TypeScript", "React", "MongoDB Change Streams", "D3.js"], repoUrl: "https://github.com/mongodb-labs/mongo-snippets", innovations: "Sub-second latency tracking with MongoDB time-series collections.", status: "judged", thumbnailUrl: thumbnails[7], submissionDate: new Date("2025-07-17T15:00:00Z") },

    // ── WINTER EVENT (concluded) — 5 projects, all judged ──
    { name: "LiveBoard", description: "Real-time collaborative whiteboard with persistent storage. Supports drawing, sticky notes, diagrams, and live cursors.", eventId: winterEvent._id, teamId: winterTeam1._id, teamMembers: winterTeam1.members, category: "Productivity", technologies: ["React", "Node.js", "MongoDB", "Socket.IO", "Canvas API"], repoUrl: "https://github.com/mongodb-developer/get-started-nodejs", innovations: "CRDT-based conflict resolution with MongoDB change streams.", status: "judged", featured: true, thumbnailUrl: thumbnails[8], submissionDate: new Date("2025-12-12T16:00:00Z") },
    { name: "DevPulse API", description: "Developer analytics API aggregating GitHub activity, CI/CD metrics, and code quality into a unified GraphQL dashboard.", eventId: winterEvent._id, teamId: winterTeam2._id, teamMembers: winterTeam2.members, category: "Developer Tools", technologies: ["Node.js", "GraphQL", "MongoDB", "GitHub API"], repoUrl: "https://github.com/mongodb-developer/get-started-nodejs", innovations: "Auto-generated MongoDB aggregations from GraphQL queries.", status: "judged", featured: true, thumbnailUrl: thumbnails[9], submissionDate: new Date("2025-12-12T15:30:00Z") },
    { name: "ContribGraph", description: "Open source contribution tracker showing code flow between repos in an interactive force-directed graph.", eventId: winterEvent._id, teamId: winterTeam3._id, teamMembers: winterTeam3.members, category: "Data Visualization", technologies: ["D3.js", "Go", "MongoDB", "WebAssembly"], repoUrl: "https://github.com/mongodb-labs/mongo-snippets", innovations: "WebAssembly graph layout for 10K+ node networks.", status: "judged", featured: true, thumbnailUrl: thumbnails[10], submissionDate: new Date("2025-12-12T17:00:00Z") },
    { name: "FormFlow", description: "Dynamic form builder with conditional logic, validation rules, and submission analytics stored in MongoDB.", eventId: winterEvent._id, teamId: winterTeam4._id, teamMembers: winterTeam4.members, category: "Productivity", technologies: ["React", "Node.js", "MongoDB", "JSON Schema"], repoUrl: "https://github.com/mongodb-developer/get-started-nodejs", innovations: "Schema-driven form generation using MongoDB JSON Schema validation.", status: "judged", thumbnailUrl: thumbnails[11], submissionDate: new Date("2025-12-12T14:00:00Z") },
    { name: "BugHunter", description: "Automated bug detection tool that analyzes code repos, runs static analysis, and stores findings in MongoDB for tracking.", eventId: winterEvent._id, teamId: winterTeam5._id, teamMembers: winterTeam5.members, category: "Developer Tools", technologies: ["Python", "MongoDB", "GitHub API", "AST", "React"], repoUrl: "https://github.com/mongodb-developer/search-lab", innovations: "AST-based code analysis with MongoDB aggregation for pattern matching.", status: "judged", submissionDate: new Date("2025-12-12T16:30:00Z") },

    // ── GLOBAL AI EVENT (in_progress) — 10 projects, mix of submitted/draft ──
    { name: "MedMind", description: "AI medical literature assistant using RAG with MongoDB Atlas Vector Search to provide cited answers from PubMed.", eventId: aiGlobalEvent._id, teamId: aiTeam1._id, teamMembers: aiTeam1.members, category: "Healthcare", technologies: ["Python", "MongoDB Atlas Vector Search", "LangChain", "React"], repoUrl: "https://github.com/mongodb-developer/GenAI-Showcase", innovations: "Multi-source RAG pipeline with citation tracking.", status: "submitted", featured: true, thumbnailUrl: thumbnails[0], submissionDate: new Date("2026-02-27T10:00:00Z") },
    { name: "QueryCraft", description: "Natural language to MongoDB aggregation pipeline converter with visual pipeline editor.", eventId: aiGlobalEvent._id, teamId: aiTeam2._id, teamMembers: aiTeam2.members, category: "AI/ML", technologies: ["Next.js", "MongoDB Atlas", "OpenAI", "Monaco Editor"], repoUrl: "https://github.com/mongodb-developer/get-started-nodejs", innovations: "Few-shot pipeline generation with $explain integration.", status: "submitted", featured: true, thumbnailUrl: thumbnails[1], submissionDate: new Date("2026-02-27T12:00:00Z") },
    { name: "CodeReview AI", description: "AI-powered code review assistant that provides contextual feedback using your team's coding standards.", eventId: aiGlobalEvent._id, teamId: aiTeam3._id, teamMembers: aiTeam3.members, category: "DevTools", technologies: ["Python", "MongoDB", "Claude API", "GitHub API", "React"], repoUrl: "https://github.com/mongodb-developer/search-lab", innovations: "Team-specific code review using RAG on your codebase conventions.", status: "submitted", submissionDate: new Date("2026-02-27T11:30:00Z") },
    { name: "SentimentPulse", description: "Real-time social media sentiment analyzer with MongoDB change streams feeding an AI classification pipeline.", eventId: aiGlobalEvent._id, teamId: aiTeam4._id, teamMembers: aiTeam4.members, category: "AI/ML", technologies: ["Python", "MongoDB Change Streams", "Transformers", "React", "D3.js"], repoUrl: "https://github.com/mongodb-labs/mongo-snippets", innovations: "Streaming sentiment classification with dynamic topic modeling.", status: "submitted", submissionDate: new Date("2026-02-27T09:00:00Z") },
    { name: "StudyBuddy", description: "AI tutoring platform that generates personalized quizzes and explanations based on uploaded course materials.", eventId: aiGlobalEvent._id, teamId: aiTeam5._id, teamMembers: aiTeam5.members, category: "EdTech", technologies: ["Next.js", "MongoDB Atlas Vector Search", "OpenAI", "Tailwind CSS"], repoUrl: "https://github.com/mongodb-developer/GenAI-Showcase", innovations: "Adaptive quiz generation using spaced repetition algorithms with vector search.", status: "submitted", submissionDate: new Date("2026-02-27T13:00:00Z") },
    { name: "AgentFlow", description: "Visual builder for AI agent workflows. Chain LLM calls, tools, and data sources with a drag-and-drop interface.", eventId: aiGlobalEvent._id, teamId: aiTeam6._id, teamMembers: aiTeam6.members, category: "AI/ML", technologies: ["React", "Python", "MongoDB", "LangGraph", "Claude API"], repoUrl: "https://github.com/mongodb-developer/GenAI-Showcase", innovations: "Visual agent orchestration with MongoDB-backed state persistence.", status: "draft" },
    { name: "ImageInsight", description: "Multi-modal image analysis platform combining vision models with text search for image cataloging.", eventId: aiGlobalEvent._id, teamId: aiTeam7._id, teamMembers: aiTeam7.members, category: "AI/ML", technologies: ["Python", "MongoDB", "CLIP", "FastAPI", "React"], repoUrl: "https://github.com/mongodb-developer/search-lab", innovations: "Multi-modal embeddings for combined text+image search.", status: "draft" },
    { name: "LegalLens", description: "AI contract analyzer that identifies risks, obligations, and key clauses in legal documents.", eventId: aiGlobalEvent._id, teamId: aiTeam8._id, teamMembers: aiTeam8.members, category: "LegalTech", technologies: ["Python", "MongoDB Atlas Vector Search", "Claude API", "React"], repoUrl: "https://github.com/mongodb-developer/GenAI-Showcase", innovations: "Clause-level RAG with hierarchical document chunking.", status: "submitted", submissionDate: new Date("2026-02-27T14:00:00Z") },
    { name: "VoiceNote AI", description: "Meeting transcription and summarization tool. Records, transcribes, and extracts action items automatically.", eventId: aiGlobalEvent._id, teamId: aiTeam9._id, teamMembers: aiTeam9.members, category: "Productivity", technologies: ["React", "Node.js", "Whisper", "MongoDB", "OpenAI"], repoUrl: "https://github.com/mongodb-labs/mongo-snippets", innovations: "Speaker diarization with action item extraction using structured outputs.", status: "draft" },
    { name: "DataStory", description: "AI-powered data storytelling tool. Upload a dataset, ask questions in natural language, get visualizations and insights.", eventId: aiGlobalEvent._id, teamId: aiTeam10._id, teamMembers: aiTeam10.members, category: "Data Visualization", technologies: ["Python", "MongoDB", "Streamlit", "OpenAI", "Plotly"], repoUrl: "https://github.com/mongodb-developer/mongodb-with-fastapi", innovations: "Natural language to aggregation pipeline to chart generation pipeline.", status: "submitted", submissionDate: new Date("2026-02-27T08:00:00Z") },

    // ── SPRING EVENT (open) — 3 projects, drafts/submitted ──
    { name: "Atlas Intelligence", description: "AI-powered MongoDB Atlas dashboard with natural language querying. Ask questions and get instant visualizations.", eventId: springEvent._id, teamId: springTeam1._id, teamMembers: springTeam1.members, category: "Developer Tools", technologies: ["React", "Node.js", "MongoDB Atlas", "OpenAI", "Chart.js"], repoUrl: "https://github.com/mongodb-developer/get-started-nodejs", innovations: "NLQ to aggregation pipeline translation with GPT-4.", status: "submitted", submissionDate: new Date("2026-03-22T14:30:00Z") },
    { name: "DataFlow Studio", description: "Visual data pipeline builder with drag-and-drop MongoDB change stream processors.", eventId: springEvent._id, teamId: springTeam2._id, teamMembers: springTeam2.members, category: "Data Engineering", technologies: ["React", "Python", "MongoDB Change Streams", "FastAPI"], repoUrl: "https://github.com/mongodb-developer/mongodb-with-fastapi", innovations: "Visual pipeline DSL compiling to change stream aggregations.", status: "draft" },
    { name: "HackMatch", description: "AI-powered team matching for hackathons using vector embeddings of skills and interests.", eventId: springEvent._id, teamId: springTeam3._id, teamMembers: springTeam3.members, category: "Social", technologies: ["Next.js", "MongoDB Atlas Vector Search", "OpenAI Embeddings", "WebSockets"], repoUrl: "https://github.com/mongodb-developer/search-lab", innovations: "Hybrid matching combining vector similarity with constraint satisfaction.", status: "submitted", submissionDate: new Date("2026-03-22T15:00:00Z") },
  ];

  const projects = [];
  for (const p of projectDefs) {
    const project = await ProjectModel.create({
      ...p,
      submittedAt: p.submissionDate,
    });
    projects.push(project);
  }

  console.log(`✅ Created ${projects.length} projects\n`);

  // Helper to find project by name
  const projByName = (name: string) => projects.find((p) => p.name === name)!;

  // ═══════════════════════════════════════════════════════════════════
  // 8. JUDGE ASSIGNMENTS & SCORES
  // ═══════════════════════════════════════════════════════════════════
  console.log("⚖️  Creating judge assignments and scores...");

  const criteria4 = ["innovation", "technical", "impact", "presentation"];
  const criteriaWinter = ["functionality", "design", "codeQuality", "innovation"];

  // Helper: create assignment + score for a concluded event
  async function judgeProject(opts: {
    eventId: any; judgeId: any; projectId: any; criteriaKeys: string[];
    scores: number[]; comment: string; completedAt: Date;
  }) {
    await JudgeAssignmentModel.create({
      eventId: opts.eventId, judgeId: opts.judgeId, projectId: opts.projectId,
      status: "completed", assignedBy: admin._id, completedAt: opts.completedAt,
    });
    await ScoreModel.create({
      projectId: opts.projectId, eventId: opts.eventId, judgeId: opts.judgeId,
      scores: Object.fromEntries(opts.criteriaKeys.map((k, i) => [k, opts.scores[i]])),
      comments: opts.comment,
      submittedAt: opts.completedAt,
    });
  }

  // --- SUMMER EVENT SCORES (8 projects x 3 judges = 24 scores) ---
  const summerProjects = projects.filter((p) => p.eventId.toString() === summerEvent._id.toString());
  const summerJudges = [judges[0], judges[1], judges[2]]; // Sarah, Mike, Aisha
  const summerComments = [
    "Excellent technical execution and creative approach.",
    "Strong project with great potential. Well-designed architecture.",
    "Impressive use of MongoDB features. Clean, well-structured code.",
    "Good concept but could use more polish. Solid foundation.",
    "Very ambitious project. Some rough edges but great innovation.",
    "Nice work! The demo was convincing and the code is clean.",
    "Creative solution with practical applications. Well done.",
    "Solid engineering. Would benefit from better error handling.",
  ];

  for (let pi = 0; pi < summerProjects.length; pi++) {
    for (let ji = 0; ji < summerJudges.length; ji++) {
      const baseScores = [
        randInt(6, 10), randInt(6, 10), randInt(5, 10), randInt(6, 9),
      ];
      // Top projects get higher scores
      if (pi < 3) baseScores.forEach((_, i) => baseScores[i] = Math.min(10, baseScores[i] + 1));
      await judgeProject({
        eventId: summerEvent._id,
        judgeId: summerJudges[ji]._id,
        projectId: summerProjects[pi]._id,
        criteriaKeys: criteria4,
        scores: baseScores,
        comment: summerComments[pi] || "Good project overall.",
        completedAt: new Date(Date.UTC(2025, 6, 18, 10 + ji, pi * 5)),
      });
    }
  }

  // --- WINTER EVENT SCORES (5 projects x 2 judges = 10 scores) ---
  const winterProjects = projects.filter((p) => p.eventId.toString() === winterEvent._id.toString());
  const winterJudges = [judges[0], judges[1]]; // Sarah, Mike

  for (let pi = 0; pi < winterProjects.length; pi++) {
    for (let ji = 0; ji < winterJudges.length; ji++) {
      const baseScores = [randInt(6, 10), randInt(6, 9), randInt(6, 9), randInt(5, 9)];
      if (pi < 2) baseScores.forEach((_, i) => baseScores[i] = Math.min(10, baseScores[i] + 1));
      await judgeProject({
        eventId: winterEvent._id,
        judgeId: winterJudges[ji]._id,
        projectId: winterProjects[pi]._id,
        criteriaKeys: criteriaWinter,
        scores: baseScores,
        comment: `Winter hackathon review for ${winterProjects[pi].name}. ${pi < 2 ? "Outstanding work!" : "Solid entry."}`,
        completedAt: new Date(Date.UTC(2025, 11, 13, 10 + ji, pi * 15)),
      });
    }
  }

  // --- AI EVENT: Pending assignments for submitted projects ---
  const aiSubmitted = projects.filter(
    (p) => p.eventId.toString() === aiGlobalEvent._id.toString() && p.status === "submitted"
  );
  const aiJudges = [judges[2], judges[3], judges[4]]; // Aisha, Liam, Yuki

  for (const proj of aiSubmitted) {
    for (const judge of pickN(aiJudges, 2)) {
      await JudgeAssignmentModel.create({
        eventId: aiGlobalEvent._id, judgeId: judge._id, projectId: proj._id,
        status: "pending", assignedBy: admin._id,
      });
    }
  }

  // --- SPRING EVENT: Pending assignments ---
  const springSubmitted = projects.filter(
    (p) => p.eventId.toString() === springEvent._id.toString() && p.status === "submitted"
  );
  for (const proj of springSubmitted) {
    for (const judge of [judges[0], judges[1]]) {
      await JudgeAssignmentModel.create({
        eventId: springEvent._id, judgeId: judge._id, projectId: proj._id,
        status: "pending", assignedBy: admin._id,
      });
    }
  }

  const totalAssignments = await JudgeAssignmentModel.countDocuments();
  const totalScores = await ScoreModel.countDocuments();
  console.log(`✅ Created ${totalAssignments} judge assignments, ${totalScores} scores\n`);

  // ═══════════════════════════════════════════════════════════════════
  // 9. PRIZES — with winners for concluded events
  // ═══════════════════════════════════════════════════════════════════
  console.log("🏆 Creating prizes...");

  const allPrizes = await PrizeModel.insertMany([
    // Summer Event prizes (with winners)
    { eventId: summerEvent._id, title: "Grand Prize", description: "Overall winner of Summer Hackathon", category: "grand", value: "$5,000", monetaryValue: 5000, displayOrder: 1, isActive: true, winners: [{ projectId: projByName("AtlasVision")._id, teamId: summerTeam1._id, awardedDate: new Date("2025-07-19"), notes: "Best overall project" }] },
    { eventId: summerEvent._id, title: "Best AI Integration", description: "Best use of AI/ML", category: "track", value: "$2,500", monetaryValue: 2500, displayOrder: 2, isActive: true, partnerId: partnerByName("Anthropic")._id, winners: [{ projectId: projByName("DocuSearch")._id, teamId: summerTeam4._id, awardedDate: new Date("2025-07-19") }] },
    { eventId: summerEvent._id, title: "Best MongoDB Integration", description: "Creative use of MongoDB Atlas", category: "sponsor", value: "$2,000", monetaryValue: 2000, displayOrder: 3, isActive: true, partnerId: partnerByName("MongoDB Inc.")._id, winners: [{ projectId: projByName("StreamForge")._id, teamId: summerTeam2._id, awardedDate: new Date("2025-07-19") }] },
    { eventId: summerEvent._id, title: "Best Cloud Architecture", description: "Best cloud-native design", category: "sponsor", value: "$1,500 AWS Credits", monetaryValue: 1500, displayOrder: 4, isActive: true, partnerId: partnerByName("AWS")._id, winners: [{ projectId: projByName("CloudMap")._id, teamId: summerTeam3._id, awardedDate: new Date("2025-07-19") }] },
    { eventId: summerEvent._id, title: "Climate Impact Award", description: "Best sustainability project", category: "special", value: "$1,000", monetaryValue: 1000, displayOrder: 5, isActive: true, winners: [{ projectId: projByName("GreenGrid")._id, teamId: summerTeam6._id, awardedDate: new Date("2025-07-19") }] },

    // Winter Event prizes (with winners)
    { eventId: winterEvent._id, title: "Grand Prize", description: "Overall winner", category: "grand", value: "$3,000", monetaryValue: 3000, displayOrder: 1, isActive: true, winners: [{ projectId: projByName("LiveBoard")._id, teamId: winterTeam1._id, awardedDate: new Date("2025-12-14"), notes: "Unanimous winner" }] },
    { eventId: winterEvent._id, title: "Best API Design", description: "Best API architecture", category: "special", value: "$1,000", monetaryValue: 1000, displayOrder: 2, isActive: true, winners: [{ projectId: projByName("DevPulse API")._id, teamId: winterTeam2._id, awardedDate: new Date("2025-12-14") }] },
    { eventId: winterEvent._id, title: "Best Visualization", description: "Most creative data viz", category: "special", value: "$500", monetaryValue: 500, displayOrder: 3, isActive: true, winners: [{ projectId: projByName("ContribGraph")._id, teamId: winterTeam3._id, awardedDate: new Date("2025-12-14") }] },
    { eventId: winterEvent._id, partnerId: partnerByName("Vercel")._id, title: "Best Deployment", description: "Best deployed project", category: "sponsor", value: "Vercel Pro (1 year)", monetaryValue: 240, displayOrder: 4, isActive: true },

    // AI Global Event prizes (no winners yet)
    { eventId: aiGlobalEvent._id, title: "AI Grand Prize", description: "Best overall AI application", category: "grand", value: "$10,000", monetaryValue: 10000, displayOrder: 1, isActive: true },
    { eventId: aiGlobalEvent._id, partnerId: partnerByName("MongoDB Inc.")._id, title: "Best Vector Search", description: "Most innovative use of vector search", category: "sponsor", value: "$3,000 + Atlas AI Credits", monetaryValue: 3000, displayOrder: 2, isActive: true },
    { eventId: aiGlobalEvent._id, partnerId: partnerByName("Anthropic")._id, title: "Best Claude Integration", description: "Best use of Claude API", category: "sponsor", value: "$2,000 + API Credits", monetaryValue: 2000, displayOrder: 3, isActive: true },
    { eventId: aiGlobalEvent._id, title: "People's Choice", description: "Community voted favorite", category: "community", value: "$1,000", monetaryValue: 1000, displayOrder: 4, isActive: true },

    // Spring Event prizes
    { eventId: springEvent._id, title: "Grand Prize", description: "Overall winner", category: "grand", value: "$5,000 + MongoDB Atlas Credits", monetaryValue: 5000, displayOrder: 1, isActive: true },
    { eventId: springEvent._id, partnerId: partnerByName("MongoDB Inc.")._id, title: "Best MongoDB Integration", description: "Best use of MongoDB Atlas", category: "sponsor", value: "$2,500 + Atlas M10 (1 year)", monetaryValue: 2500, displayOrder: 2, isActive: true },
    { eventId: springEvent._id, partnerId: partnerByName("Vercel")._id, title: "Best Deployment", description: "Best deployed project", category: "sponsor", value: "$1,000 Vercel Pro", monetaryValue: 1000, displayOrder: 3, isActive: true },
    { eventId: springEvent._id, partnerId: partnerByName("GitHub")._id, title: "Best Open Source", description: "Best open source project", category: "sponsor", value: "$500 + GitHub Swag", monetaryValue: 500, displayOrder: 4, isActive: true },
    { eventId: springEvent._id, partnerId: partnerByName("JetBrains")._id, title: "Most Innovative Code", description: "Most creative solution", category: "special", value: "JetBrains All Products (1 year)", monetaryValue: 649, displayOrder: 5, isActive: true },

    // Europe Event prizes
    { eventId: euroEvent._id, title: "Grand Prize", description: "European champion", category: "grand", value: "$3,000", monetaryValue: 3000, displayOrder: 1, isActive: true },
    { eventId: euroEvent._id, partnerId: partnerByName("Datadog")._id, title: "Best Observability", description: "Best monitoring integration", category: "sponsor", value: "$1,000 + Datadog credits", monetaryValue: 1000, displayOrder: 2, isActive: true },

    // DevTools Event prizes
    { eventId: devtoolsEvent._id, title: "Grand Prize", description: "Best developer tool", category: "grand", value: "$3,000", monetaryValue: 3000, displayOrder: 1, isActive: true },
    { eventId: devtoolsEvent._id, partnerId: partnerByName("GitHub")._id, title: "Best GitHub Integration", description: "Best GitHub ecosystem tool", category: "sponsor", value: "$1,500 + GitHub Pro", monetaryValue: 1500, displayOrder: 2, isActive: true },
    { eventId: devtoolsEvent._id, partnerId: partnerByName("JetBrains")._id, title: "Best IDE Extension", description: "Best IDE plugin/extension", category: "sponsor", value: "JetBrains Pack (1 year)", monetaryValue: 649, displayOrder: 3, isActive: true },
  ]);

  // Update partner engagement
  for (const prize of allPrizes) {
    if (prize.partnerId) {
      await PartnerModel.findByIdAndUpdate(prize.partnerId, {
        $addToSet: { "engagement.eventsParticipated": prize.eventId, "engagement.prizesOffered": prize._id },
        $set: { "engagement.lastEngagementDate": new Date() },
      });
    }
  }

  console.log(`✅ Created ${allPrizes.length} prizes\n`);

  // ═══════════════════════════════════════════════════════════════════
  // 10. NOTIFICATIONS — realistic notifications for various users
  // ═══════════════════════════════════════════════════════════════════
  console.log("🔔 Creating notifications...");

  const notifDefs: any[] = [];

  // Registration confirmations for Spring event participants
  for (const user of springParts.slice(0, 10)) {
    notifDefs.push({
      userId: user._id, type: "registration_confirmed",
      title: "Registration Confirmed",
      message: `You're registered for ${springEvent.name}! See you on March 20th.`,
      read: Math.random() > 0.3, relatedEvent: springEvent._id,
      actionUrl: `/events/${springEvent._id}`,
    });
  }

  // Event reminders for AI Global
  for (const user of aiParts.slice(0, 15)) {
    notifDefs.push({
      userId: user._id, type: "event_reminder",
      title: "Hackathon In Progress!",
      message: `${aiGlobalEvent.name} is happening now! Submit your project before Feb 28th.`,
      read: Math.random() > 0.5, relatedEvent: aiGlobalEvent._id,
      actionUrl: `/events/${aiGlobalEvent._id}`,
    });
  }

  // Team join notifications
  for (const team of springTeams.slice(0, 3)) {
    notifDefs.push({
      userId: team.leaderId, type: "team_member_joined",
      title: "New Team Member",
      message: `A new member has joined your team "${team.name}"!`,
      read: true, relatedTeam: team._id, relatedEvent: springEvent._id,
    });
  }

  // Project submitted notifications
  for (const proj of springSubmitted) {
    notifDefs.push({
      userId: proj.teamMembers[0], type: "project_submitted",
      title: "Project Submitted",
      message: `Your project "${proj.name}" has been submitted successfully!`,
      read: true, relatedProject: proj._id, relatedEvent: springEvent._id,
    });
  }

  // Results published for concluded events
  for (const user of summerParts.slice(0, 15)) {
    notifDefs.push({
      userId: user._id, type: "results_published",
      title: "Results Are In!",
      message: `Results for ${summerEvent.name} have been published. Check out the winners!`,
      read: Math.random() > 0.4, relatedEvent: summerEvent._id,
      actionUrl: `/events/${summerEvent._id}`,
    });
  }

  // Judge assigned notifications
  for (const judge of judges.slice(0, 4)) {
    notifDefs.push({
      userId: judge._id, type: "judge_assigned",
      title: "New Judging Assignment",
      message: "You've been assigned new projects to review.",
      read: Math.random() > 0.5,
    });
  }

  // Feedback requests for concluded events
  for (const user of winterParts.slice(0, 8)) {
    notifDefs.push({
      userId: user._id, type: "feedback_requested",
      title: "Share Your Feedback",
      message: `How was ${winterEvent.name}? We'd love to hear your thoughts.`,
      read: Math.random() > 0.6, relatedEvent: winterEvent._id,
    });
  }

  const notifications = await NotificationModel.insertMany(notifDefs);
  console.log(`✅ Created ${notifications.length} notifications\n`);

  // ═══════════════════════════════════════════════════════════════════
  // 11. TEAM NOTES — collaboration threads
  // ═══════════════════════════════════════════════════════════════════
  console.log("💬 Creating team notes...");

  const teamNoteDefs: any[] = [];
  const noteContents = [
    ["Let's use MongoDB Atlas Vector Search for the recommendation engine.", "Great idea! I'll set up the Atlas cluster.", "Don't forget to create the vector search index.", "Done! Index is live. Let's start embedding."],
    ["Who's working on the frontend?", "I'll take the dashboard UI.", "I can handle the form components.", "Perfect. Let's sync up tomorrow at 9 AM."],
    ["API design doc is ready for review.", "Looks good! One suggestion — let's add pagination.", "Agreed. I'll add cursor-based pagination.", "PR is up for review."],
    ["Demo day prep: who's presenting?", "I'll do the live demo.", "I'll handle the slides and architecture overview.", "Let's do a dry run tonight."],
  ];

  // Add notes for active teams
  const teamsWithNotes = [...aiTeams.slice(0, 4), ...springTeams.slice(0, 3)];
  for (let ti = 0; ti < teamsWithNotes.length; ti++) {
    const team = teamsWithNotes[ti];
    const thread = noteContents[ti % noteContents.length];
    let parentId: any = null;
    for (let ni = 0; ni < thread.length; ni++) {
      const memberId = team.members[ni % team.members.length];
      const note: any = {
        teamId: team._id,
        authorId: memberId,
        content: thread[ni],
      };
      if (ni > 0 && parentId) note.parentNoteId = parentId;
      const created = await TeamNoteModel.create(note);
      if (ni === 0) parentId = created._id;
    }
  }

  const totalNotes = await TeamNoteModel.countDocuments();
  console.log(`✅ Created ${totalNotes} team notes\n`);

  // ═══════════════════════════════════════════════════════════════════
  // 12. FEEDBACK RESPONSES — for concluded events
  // ═══════════════════════════════════════════════════════════════════
  console.log("📋 Creating feedback responses...");

  // Get built-in feedback form
  const feedbackForm = await FeedbackFormConfigModel.findOne({ isBuiltIn: true });

  if (feedbackForm) {
    const feedbackDefs: any[] = [];

    // Summer event feedback from participants
    for (const user of summerParts.slice(0, 15)) {
      feedbackDefs.push({
        formId: feedbackForm._id,
        eventId: summerEvent._id,
        respondentEmail: user.email,
        respondentName: user.name,
        respondentType: "participant",
        userId: user._id,
        answers: new Map([
          ["overall_rating", randInt(3, 5)],
          ["would_recommend", Math.random() > 0.2 ? "yes" : "maybe"],
          ["best_part", pick(["Mentorship", "Networking", "Workshops", "The prizes", "Learning new tech"])],
          ["improvement", pick(["More time", "Better wifi", "More food options", "Quieter workspace", "Nothing — it was great!"])],
        ]),
        submittedAt: new Date("2025-07-20"),
        completionTimeMinutes: randInt(3, 12),
      });
    }

    // Winter event feedback
    for (const user of winterParts.slice(0, 10)) {
      feedbackDefs.push({
        formId: feedbackForm._id,
        eventId: winterEvent._id,
        respondentEmail: user.email,
        respondentName: user.name,
        respondentType: "participant",
        userId: user._id,
        answers: new Map([
          ["overall_rating", randInt(3, 5)],
          ["would_recommend", Math.random() > 0.15 ? "yes" : "maybe"],
          ["best_part", pick(["The community", "Judging feedback", "Workshops", "Prizes"])],
        ]),
        submittedAt: new Date("2025-12-15"),
        completionTimeMinutes: randInt(2, 8),
      });
    }

    const feedbackResponses = await FeedbackResponseModel.insertMany(feedbackDefs);
    console.log(`✅ Created ${feedbackResponses.length} feedback responses\n`);
  } else {
    console.log("⚠️  No built-in feedback form found — skipping feedback responses\n");
  }

  // ═══════════════════════════════════════════════════════════════════
  // 13. TEMPLATES
  // ═══════════════════════════════════════════════════════════════════
  console.log("🎨 Seeding built-in templates...");
  const templatesInserted = await seedBuiltInTemplates();
  console.log(`✅ Seeded ${templatesInserted} built-in templates\n`);

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  const counts = await Promise.all([
    UserModel.countDocuments(),
    ParticipantModel.countDocuments(),
    EventModel.countDocuments(),
    TeamModel.countDocuments(),
    ProjectModel.countDocuments(),
    ProjectModel.countDocuments({ featured: true }),
    JudgeAssignmentModel.countDocuments(),
    ScoreModel.countDocuments(),
    PartnerModel.countDocuments(),
    PrizeModel.countDocuments(),
    NotificationModel.countDocuments(),
    TeamNoteModel.countDocuments(),
    FeedbackResponseModel.countDocuments(),
  ]);

  console.log("🎉 Enhanced seeding complete!\n");
  console.log("📊 Summary:");
  console.log(`   Users:              ${counts[0]}`);
  console.log(`   Participants:       ${counts[1]}`);
  console.log(`   Events:             ${counts[2]}`);
  console.log(`   Teams:              ${counts[3]}`);
  console.log(`   Projects:           ${counts[4]}`);
  console.log(`   Featured Projects:  ${counts[5]}`);
  console.log(`   Judge Assignments:  ${counts[6]}`);
  console.log(`   Scores:             ${counts[7]}`);
  console.log(`   Partners:           ${counts[8]}`);
  console.log(`   Prizes:             ${counts[9]}`);
  console.log(`   Notifications:      ${counts[10]}`);
  console.log(`   Team Notes:         ${counts[11]}`);
  console.log(`   Feedback Responses: ${counts[12]}`);
  console.log(`   Templates:          ${templatesInserted}\n`);

  console.log("🔑 Test Credentials (all passwords: password123):");
  console.log("   Super Admin:  superadmin@mongohacks.com");
  console.log("   Admin:        admin@mongohacks.com");
  console.log("   Admin 2:      rebecca.admin@mongohacks.com");
  console.log("   Organizer:    organizer@mongohacks.com");
  console.log("   Judge 1:      sarah.judge@mongohacks.com");
  console.log("   Judge 2:      mike.judge@mongohacks.com");
  console.log("   Judge 3:      aisha.judge@mongohacks.com");
  console.log("   Participant:  alice@example.com\n");

  console.log("📅 Events:");
  console.log("   Summer 2025:  CONCLUDED (8 teams, 8 projects, fully judged, winners)");
  console.log("   Winter 2025:  CONCLUDED (5 teams, 5 projects, fully judged, winners)");
  console.log("   Global AI:    IN PROGRESS (10 teams, 10 projects, judging pending)");
  console.log("   Spring 2026:  OPEN (6 teams, 3 projects, registrations open)");
  console.log("   Europe 2026:  OPEN (3 teams, registrations open)");
  console.log("   DevTools:     OPEN (4 teams, registrations open)");
  console.log("   FinTech:      DRAFT (upcoming)");
  console.log("   IoT:          DRAFT (upcoming)\n");

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
