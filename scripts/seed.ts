#!/usr/bin/env tsx

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
import { seedBuiltInTemplates } from "../src/lib/db/seed-templates";
import { generateProjectSummary } from "../src/lib/ai/summary-service";
import bcrypt from "bcryptjs";

const CLEAR_EXISTING = process.argv.includes("--clear");

console.log("🌱 Seeding database...\n");

async function seed() {
  await connectToDatabase();

  const existingUsers = await UserModel.countDocuments();

  if (existingUsers > 0 && !CLEAR_EXISTING) {
    console.log("⚠️  Database already has data!");
    console.log(`   Found ${existingUsers} existing users.\n`);
    console.log("💡 Run 'npm run seed:clear' to wipe and reload fresh data\n");
    console.log("🔑 Test Credentials:");
    console.log("   Super Admin: superadmin@mongohacks.com / password123");
    console.log("   Admin:       admin@mongohacks.com / password123");
    console.log("   Organizer:   organizer@mongohacks.com / password123");
    console.log("   Judge:       sarah.judge@mongohacks.com / password123");
    console.log("   Participant:  alice@example.com / password123");
    console.log("   Solo (no team): priya@example.com / password123\n");
    process.exit(0);
  }

  if (CLEAR_EXISTING) {
    console.log("🗑️  Clearing existing data...");
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
    ]);
    console.log("✅ Data cleared\n");
  }

  // ═══════════════════════════════════════════════════════════════════
  // USERS — 28 total: 1 super_admin, 2 admins, 1 organizer, 4 judges, 20 participants
  // ═══════════════════════════════════════════════════════════════════
  console.log("👥 Creating users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const userDefs = [
    // Staff
    { name: "Super Admin", email: "superadmin@mongohacks.com", role: "super_admin" },
    { name: "Admin User", email: "admin@mongohacks.com", role: "admin" },
    { name: "Jamie Organizer", email: "organizer@mongohacks.com", role: "organizer" },
    // Judges
    { name: "Sarah Chen", email: "sarah.judge@mongohacks.com", role: "judge" },
    { name: "Mike Rodriguez", email: "mike.judge@mongohacks.com", role: "judge" },
    { name: "Aisha Patel", email: "aisha.judge@mongohacks.com", role: "judge" },
    { name: "Liam O'Brien", email: "liam.judge@mongohacks.com", role: "judge" },
    // Participants — Spring Hackathon (primary event, most active)
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
    // Participants — Solo / cross-event
    { name: "Priya Sharma", email: "priya@example.com", role: "participant" },
    { name: "Quinn Jackson", email: "quinn@example.com", role: "participant" },
    { name: "Ravi Gupta", email: "ravi@example.com", role: "participant" },
    { name: "Sofia Hernandez", email: "sofia@example.com", role: "participant" },
    { name: "Tomas Novak", email: "tomas@example.com", role: "participant" },
    { name: "Uma Osei", email: "uma@example.com", role: "participant" },
    { name: "Victor Petrov", email: "victor@example.com", role: "participant" },
  ];

  const users = await UserModel.insertMany(
    userDefs.map((u) => ({ ...u, passwordHash }))
  );

  // Destructure for easy reference
  const [
    superAdmin, admin, organizer,
    judge1, judge2, judge3, judge4,
    alice, bob, carol, david, emma, frank, grace, henry,
    iris, jake, kira, leo, maya, noah,
    priya, quinn, ravi, sofia, tomas, uma, victor,
  ] = users;

  console.log(`✅ Created ${users.length} users\n`);

  // ═══════════════════════════════════════════════════════════════════
  // PARTICIPANT PROFILES — diverse skills, experience levels, bios
  // ═══════════════════════════════════════════════════════════════════
  console.log("🎯 Creating participant profiles...");

  const participantDefs = [
    { userId: alice._id, email: alice.email, name: alice.name, bio: "Full-stack developer passionate about AI and web technologies. 3x hackathon winner.", skills: ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "Python"], interests: ["AI", "Web Development", "Open Source"], experience_level: "advanced" },
    { userId: bob._id, email: bob.email, name: bob.name, bio: "Backend engineer specializing in scalable distributed systems and cloud architecture.", skills: ["Python", "Go", "PostgreSQL", "Docker", "AWS", "Kubernetes"], interests: ["Cloud Architecture", "DevOps", "Microservices"], experience_level: "advanced" },
    { userId: carol._id, email: carol.email, name: carol.name, bio: "Frontend developer and UX enthusiast. I make things beautiful and accessible.", skills: ["React", "TypeScript", "CSS", "Figma", "Next.js", "Tailwind CSS"], interests: ["UI/UX", "Design Systems", "Accessibility"], experience_level: "intermediate" },
    { userId: david._id, email: david.email, name: david.name, bio: "Data scientist exploring ML applications. Kaggle top 5% in NLP competitions.", skills: ["Python", "TensorFlow", "PyTorch", "Pandas", "SQL", "Jupyter"], interests: ["Machine Learning", "Data Visualization", "NLP"], experience_level: "intermediate" },
    { userId: emma._id, email: emma.email, name: emma.name, bio: "Mobile developer building cross-platform apps. Former startup founder.", skills: ["React Native", "Swift", "Kotlin", "Firebase", "TypeScript"], interests: ["Mobile Development", "Startups", "IoT"], experience_level: "intermediate" },
    { userId: frank._id, email: frank.email, name: frank.name, bio: "DevOps engineer who loves automation. If I do something twice, I write a script.", skills: ["Docker", "Kubernetes", "Terraform", "Python", "Bash", "AWS"], interests: ["DevOps", "Infrastructure", "Automation"], experience_level: "advanced" },
    { userId: grace._id, email: grace.email, name: grace.name, bio: "AI researcher focused on computer vision and generative models.", skills: ["Python", "PyTorch", "OpenCV", "CUDA", "TensorFlow"], interests: ["AI", "Computer Vision", "Generative AI"], experience_level: "advanced" },
    { userId: henry._id, email: henry.email, name: henry.name, bio: "Game developer and creative coder. I bring ideas to life with interactive experiences.", skills: ["Unity", "C#", "Three.js", "WebGL", "Blender"], interests: ["Game Development", "Creative Coding", "VR/AR"], experience_level: "intermediate" },
    { userId: iris._id, email: iris.email, name: iris.name, bio: "Blockchain developer building decentralized applications and smart contracts.", skills: ["Solidity", "Web3.js", "Ethereum", "React", "Node.js"], interests: ["Blockchain", "DeFi", "Web3"], experience_level: "intermediate" },
    { userId: jake._id, email: jake.email, name: jake.name, bio: "First-time hackathon participant! Computer science student eager to learn.", skills: ["JavaScript", "Python", "HTML/CSS", "Git"], interests: ["Web Development", "Learning", "Open Source"], experience_level: "beginner" },
    { userId: kira._id, email: kira.email, name: kira.name, bio: "Product designer who codes. I bridge the gap between design and development.", skills: ["Figma", "React", "CSS", "Framer Motion", "Storybook"], interests: ["Design Systems", "Prototyping", "Interaction Design"], experience_level: "intermediate" },
    { userId: leo._id, email: leo.email, name: leo.name, bio: "Systems programmer interested in performance and low-level optimization.", skills: ["Rust", "C++", "Go", "Linux", "WebAssembly"], interests: ["Systems Programming", "Performance", "Open Source"], experience_level: "advanced" },
    { userId: maya._id, email: maya.email, name: maya.name, bio: "Data engineer building pipelines and real-time analytics platforms.", skills: ["Python", "Apache Spark", "Kafka", "MongoDB", "SQL", "Airflow"], interests: ["Data Engineering", "Real-time Analytics", "Streaming"], experience_level: "intermediate" },
    { userId: noah._id, email: noah.email, name: noah.name, bio: "Aspiring ML engineer. Currently learning deep learning and NLP.", skills: ["Python", "NumPy", "Scikit-learn", "Hugging Face", "SQL"], interests: ["Machine Learning", "NLP", "AI Ethics"], experience_level: "beginner" },
    { userId: priya._id, email: priya.email, name: priya.name, bio: "Full-stack developer with a focus on real-time applications and collaboration tools.", skills: ["TypeScript", "React", "Node.js", "WebSockets", "MongoDB", "Redis"], interests: ["Real-time Apps", "Collaboration Tools", "DX"], experience_level: "intermediate" },
    { userId: quinn._id, email: quinn.email, name: quinn.name, bio: "Security researcher and CTF player. I break things to make them stronger.", skills: ["Python", "Security", "Penetration Testing", "Cryptography", "Bash"], interests: ["Cybersecurity", "Ethical Hacking", "Privacy"], experience_level: "advanced" },
    { userId: ravi._id, email: ravi.email, name: ravi.name, bio: "Cloud architect passionate about serverless and event-driven architectures.", skills: ["AWS", "Serverless", "TypeScript", "DynamoDB", "GraphQL", "CDK"], interests: ["Serverless", "Event-Driven Architecture", "Cloud"], experience_level: "advanced" },
    { userId: sofia._id, email: sofia.email, name: sofia.name, bio: "Creative technologist exploring the intersection of art and code.", skills: ["p5.js", "JavaScript", "Python", "Processing", "Arduino"], interests: ["Creative Coding", "Generative Art", "Physical Computing"], experience_level: "intermediate" },
    { userId: tomas._id, email: tomas.email, name: tomas.name, bio: "Backend developer specializing in API design and database optimization.", skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "GraphQL", "REST API"], interests: ["API Design", "Database Optimization", "Developer Tools"], experience_level: "intermediate" },
    { userId: uma._id, email: uma.email, name: uma.name, bio: "Student developer passionate about open source. GSoC 2025 participant.", skills: ["JavaScript", "React", "Go", "Git", "Linux"], interests: ["Open Source", "Community", "Developer Tools"], experience_level: "beginner" },
    { userId: victor._id, email: victor.email, name: victor.name, bio: "Embedded systems engineer venturing into IoT and edge computing.", skills: ["C", "Rust", "MQTT", "Raspberry Pi", "Python", "Docker"], interests: ["IoT", "Edge Computing", "Embedded Systems"], experience_level: "intermediate" },
  ];

  const participants = await ParticipantModel.insertMany(participantDefs);
  console.log(`✅ Created ${participants.length} participant profiles\n`);

  // Helper to find participant by userId
  const pByUser = (userId: any) => participants.find((p) => p.userId.toString() === userId.toString())!;

  // ═══════════════════════════════════════════════════════════════════
  // EVENTS — 4 events at different lifecycle stages
  // ═══════════════════════════════════════════════════════════════════
  console.log("📅 Creating events...");

  // 1. Spring Hackathon — OPEN, primary event, most data
  const springEvent = await EventModel.create({
    name: "MongoDB Spring Hackathon 2026",
    description: "Build the next generation of database-powered applications. Three days of hacking, mentorship, and prizes. Use MongoDB Atlas, vector search, AI — push the boundaries of what's possible with modern data infrastructure.",
    theme: "AI & Data",
    startDate: new Date("2026-03-20T09:00:00Z"),
    endDate: new Date("2026-03-22T18:00:00Z"),
    registrationDeadline: new Date("2026-03-15T23:59:59Z"),
    location: "MongoDB HQ, New York, NY",
    city: "New York",
    country: "United States",
    venue: "MongoDB Headquarters",
    capacity: 100,
    isVirtual: false,
    tags: ["AI", "Database", "Web Development", "MongoDB", "Atlas"],
    rules: "Teams of 2-5 members. Projects must use MongoDB. All code must be written during the hackathon. Pre-existing libraries and frameworks are allowed.",
    judging_criteria: ["Innovation", "Technical Complexity", "Impact", "Presentation"],
    organizers: [admin._id, organizer._id],
    status: "open",
    coordinates: { type: "Point", coordinates: [-74.006, 40.7128] },
    landingPage: {
      template: "modern",
      slug: "mongodb-spring-2026",
      published: true,
      customContent: {
        hero: {
          headline: "MongoDB Spring Hackathon 2026",
          subheadline: "Build the future of data-driven applications",
          ctaText: "Register Now",
        },
        prizes: [
          { title: "1st Place", description: "Grand Prize", value: "$5,000" },
          { title: "2nd Place", description: "Runner Up", value: "$2,500" },
          { title: "3rd Place", description: "Third Place", value: "$1,000" },
          { title: "Best MongoDB Integration", description: "Sponsor Prize", value: "$2,500" },
        ],
        schedule: [
          { time: "9:00 AM - Day 1", title: "Opening Ceremony", description: "Welcome, rules, and team formation" },
          { time: "10:00 AM - Day 1", title: "Hacking Begins!", description: "Start building your project" },
          { time: "12:00 PM - Day 1", title: "Lunch & Workshops", description: "MongoDB Atlas deep dive" },
          { time: "9:00 AM - Day 2", title: "Hacking Continues", description: "Mentor office hours available" },
          { time: "3:00 PM - Day 3", title: "Submissions Due", description: "Final project submission deadline" },
          { time: "4:00 PM - Day 3", title: "Demos & Judging", description: "Project presentations" },
          { time: "6:00 PM - Day 3", title: "Awards Ceremony", description: "Winners announced!" },
        ],
        faq: [
          { question: "Do I need a team?", answer: "You can register solo and find a team on the platform, or bring your own team of 2-5 people." },
          { question: "What can I build?", answer: "Anything that uses MongoDB! Web apps, mobile apps, APIs, data pipelines, AI projects — surprise us." },
          { question: "Is there food?", answer: "Yes! Breakfast, lunch, dinner, and snacks provided for all three days." },
        ],
      },
    },
  });

  // 2. AI Challenge — OPEN, virtual, second active event
  const aiEvent = await EventModel.create({
    name: "AI Challenge 2026",
    description: "Harness the power of artificial intelligence to solve real-world problems. Build AI-powered applications using the latest models and techniques. Open to all skill levels.",
    theme: "Artificial Intelligence",
    startDate: new Date("2026-04-10T09:00:00Z"),
    endDate: new Date("2026-04-12T18:00:00Z"),
    registrationDeadline: new Date("2026-04-05T23:59:59Z"),
    location: "Virtual Event",
    city: "Online",
    country: "Global",
    venue: "Online Platform",
    capacity: 200,
    isVirtual: true,
    tags: ["AI", "Machine Learning", "Deep Learning", "LLM", "RAG"],
    rules: "Open to all skill levels. Individual or team entries. Must include an AI/ML component.",
    judging_criteria: ["Innovation", "Technical Merit", "Practicality", "Presentation"],
    organizers: [admin._id],
    status: "open",
    coordinates: { type: "Point", coordinates: [0, 0] },
    landingPage: {
      template: "tech",
      slug: "ai-challenge-2026",
      published: true,
      customContent: {
        hero: {
          headline: "AI Challenge 2026",
          subheadline: "Shape the future with artificial intelligence",
          ctaText: "Join Now",
        },
      },
    },
  });

  // 3. Web3 Summit — DRAFT, future event
  const web3Event = await EventModel.create({
    name: "Web3 Summit Hackathon",
    description: "Decentralize the web with blockchain technology. Build dApps, DeFi protocols, and Web3 infrastructure.",
    theme: "Blockchain & Web3",
    startDate: new Date("2026-05-15T09:00:00Z"),
    endDate: new Date("2026-05-17T18:00:00Z"),
    registrationDeadline: new Date("2026-05-10T23:59:59Z"),
    location: "San Francisco Convention Center",
    city: "San Francisco",
    country: "United States",
    venue: "Moscone Center",
    capacity: 150,
    isVirtual: false,
    tags: ["Blockchain", "Web3", "DeFi", "Smart Contracts"],
    rules: "Build a working prototype using blockchain technology.",
    judging_criteria: ["Innovation", "Security", "Usability", "Impact"],
    organizers: [admin._id],
    status: "draft",
    coordinates: { type: "Point", coordinates: [-122.4194, 37.7749] },
    landingPage: {
      template: "bold",
      slug: "web3-summit-2026",
      published: false,
      customContent: {
        hero: { headline: "Web3 Summit Hackathon", subheadline: "Decentralize everything", ctaText: "Register" },
      },
    },
  });

  // 4. Winter Hackathon — CONCLUDED, with full judging data
  const winterEvent = await EventModel.create({
    name: "MongoDB Winter Hackathon 2025",
    description: "Build full-stack applications powered by MongoDB. A weekend of intense coding, learning, and fun.",
    theme: "Full Stack Development",
    startDate: new Date("2025-12-10T09:00:00Z"),
    endDate: new Date("2025-12-12T18:00:00Z"),
    registrationDeadline: new Date("2025-12-05T23:59:59Z"),
    location: "Austin Convention Center",
    city: "Austin",
    country: "United States",
    venue: "Austin Convention Center",
    capacity: 80,
    isVirtual: false,
    tags: ["Full Stack", "MERN", "APIs"],
    rules: "Build full-stack applications using MongoDB.",
    judging_criteria: ["Functionality", "Design", "Code Quality", "Innovation"],
    organizers: [admin._id],
    status: "concluded",
    resultsPublished: true,
    resultsPublishedAt: new Date("2025-12-14T12:00:00Z"),
    coordinates: { type: "Point", coordinates: [-97.7431, 30.2672] },
    landingPage: {
      template: "modern",
      slug: "mongodb-winter-2025",
      published: true,
      customContent: {
        hero: { headline: "MongoDB Winter Hackathon 2025", subheadline: "Event concluded — See results!", ctaText: "View Results" },
      },
    },
  });

  console.log("✅ Created 4 events\n");

  // ═══════════════════════════════════════════════════════════════════
  // EVENT REGISTRATIONS
  // ═══════════════════════════════════════════════════════════════════
  console.log("📝 Registering participants for events...");

  // Spring Event — 16 participants (the primary testbed)
  const springParticipants = [alice, bob, carol, david, emma, frank, grace, henry, iris, jake, kira, leo, maya, noah, priya, quinn];
  for (const user of springParticipants) {
    const p = pByUser(user._id);
    p.registeredEvents.push({ eventId: springEvent._id, registrationDate: new Date("2026-02-15"), status: "registered" });
    await p.save();
  }

  // AI Event — 8 participants (some overlap with Spring)
  const aiParticipants = [david, grace, maya, noah, ravi, sofia, uma, victor];
  for (const user of aiParticipants) {
    const p = pByUser(user._id);
    p.registeredEvents.push({ eventId: aiEvent._id, registrationDate: new Date("2026-03-01"), status: "registered" });
    await p.save();
  }

  // Winter Event (concluded) — 8 participants
  const winterParticipants = [alice, bob, carol, iris, tomas, sofia, uma, victor];
  for (const user of winterParticipants) {
    const p = pByUser(user._id);
    p.registeredEvents.push({ eventId: winterEvent._id, registrationDate: new Date("2025-12-01"), status: "attended" });
    await p.save();
  }

  console.log("✅ Registered participants for events\n");

  // ═══════════════════════════════════════════════════════════════════
  // TEAMS — Spring Event gets the most teams to test Browse Teams
  // ═══════════════════════════════════════════════════════════════════
  console.log("👥 Creating teams...");

  // --- SPRING EVENT TEAMS ---
  const springTeam1 = await TeamModel.create({
    name: "Code Crushers",
    description: "We crush bugs and build amazing full-stack apps. Looking for a solid backend dev to round out our team.",
    eventId: springEvent._id,
    leaderId: alice._id,
    members: [alice._id, bob._id, carol._id],
    lookingForMembers: true,
    desiredSkills: ["MongoDB", "Node.js", "DevOps"],
    maxMembers: 5,
    status: "forming",
    communicationPlatform: "discord",
    discordChannelUrl: "https://discord.gg/codecrushers",
  });

  const springTeam2 = await TeamModel.create({
    name: "Data Wizards",
    description: "Turning raw data into magic with ML and real-time analytics. Need someone who can build great UIs.",
    eventId: springEvent._id,
    leaderId: david._id,
    members: [david._id, maya._id],
    lookingForMembers: true,
    desiredSkills: ["React", "TypeScript", "Data Visualization", "UI/UX"],
    maxMembers: 4,
    status: "forming",
    communicationPlatform: "slack",
    slackChannelUrl: "https://datawizards.slack.com",
  });

  const springTeam3 = await TeamModel.create({
    name: "The Fullstack Five",
    description: "End-to-end builders. We own the whole stack from DB to deploy. Currently looking for an AI/ML specialist.",
    eventId: springEvent._id,
    leaderId: frank._id,
    members: [frank._id, emma._id, henry._id],
    lookingForMembers: true,
    desiredSkills: ["Python", "Machine Learning", "AI", "TensorFlow"],
    maxMembers: 5,
    status: "forming",
  });

  const springTeam4 = await TeamModel.create({
    name: "Atlas Architects",
    description: "MongoDB Atlas power users building something incredible with vector search and aggregation pipelines.",
    eventId: springEvent._id,
    leaderId: grace._id,
    members: [grace._id, leo._id],
    lookingForMembers: true,
    desiredSkills: ["MongoDB", "Node.js", "React", "API Design"],
    maxMembers: 5,
    status: "forming",
  });

  const springTeam5 = await TeamModel.create({
    name: "Pixel Pioneers",
    description: "Design-forward team that believes great UX wins hackathons. Building a beautiful, intuitive app.",
    eventId: springEvent._id,
    leaderId: kira._id,
    members: [kira._id, iris._id],
    lookingForMembers: true,
    desiredSkills: ["Backend", "Node.js", "MongoDB", "API Design"],
    maxMembers: 4,
    status: "forming",
  });

  const springTeam6 = await TeamModel.create({
    name: "Security First",
    description: "Building secure-by-default applications. Looking for frontend devs who care about security.",
    eventId: springEvent._id,
    leaderId: quinn._id,
    members: [quinn._id],
    lookingForMembers: true,
    desiredSkills: ["React", "TypeScript", "Node.js", "Authentication"],
    maxMembers: 4,
    status: "forming",
  });

  // Note: jake, noah, priya are registered for Spring but NOT on any team — perfect for testing "join team" flow

  // --- AI EVENT TEAMS ---
  const aiTeam1 = await TeamModel.create({
    name: "Neural Navigators",
    description: "Exploring the frontiers of deep learning and neural networks.",
    eventId: aiEvent._id,
    leaderId: grace._id,
    members: [grace._id, david._id, noah._id],
    lookingForMembers: true,
    desiredSkills: ["Python", "React", "Deployment"],
    maxMembers: 5,
    status: "forming",
  });

  const aiTeam2 = await TeamModel.create({
    name: "Prompt Engineers",
    description: "Building the best LLM-powered app you've ever seen. RAG, agents, tool use — we do it all.",
    eventId: aiEvent._id,
    leaderId: ravi._id,
    members: [ravi._id, maya._id],
    lookingForMembers: true,
    desiredSkills: ["LLM", "Python", "JavaScript", "Vector Search"],
    maxMembers: 4,
    status: "forming",
  });

  // sofia, uma, victor registered for AI event but no team

  // --- WINTER EVENT TEAMS (concluded) ---
  const winterTeam1 = await TeamModel.create({
    name: "MERN Masters",
    description: "Full-stack MERN mastery.",
    eventId: winterEvent._id,
    leaderId: alice._id,
    members: [alice._id, bob._id, carol._id],
    lookingForMembers: false,
    maxMembers: 5,
    status: "active",
  });

  const winterTeam2 = await TeamModel.create({
    name: "API Artisans",
    description: "Crafting elegant APIs and developer tools.",
    eventId: winterEvent._id,
    leaderId: tomas._id,
    members: [tomas._id, iris._id, sofia._id],
    lookingForMembers: false,
    maxMembers: 5,
    status: "active",
  });

  const winterTeam3 = await TeamModel.create({
    name: "Open Sourcerers",
    description: "Everything we build is open source from day one.",
    eventId: winterEvent._id,
    leaderId: uma._id,
    members: [uma._id, victor._id],
    lookingForMembers: false,
    maxMembers: 5,
    status: "active",
  });

  console.log("✅ Created 11 teams\n");

  // ═══════════════════════════════════════════════════════════════════
  // UPDATE PARTICIPANT teamId REFERENCES
  // ═══════════════════════════════════════════════════════════════════
  console.log("🔗 Linking participants to teams...");

  const teamAssignments: Array<{ userId: any; teamId: any }> = [
    // Spring teams
    { userId: alice._id, teamId: springTeam1._id },
    { userId: bob._id, teamId: springTeam1._id },
    { userId: carol._id, teamId: springTeam1._id },
    { userId: david._id, teamId: springTeam2._id },
    { userId: maya._id, teamId: springTeam2._id },
    { userId: frank._id, teamId: springTeam3._id },
    { userId: emma._id, teamId: springTeam3._id },
    { userId: henry._id, teamId: springTeam3._id },
    { userId: grace._id, teamId: springTeam4._id },
    { userId: leo._id, teamId: springTeam4._id },
    { userId: kira._id, teamId: springTeam5._id },
    { userId: iris._id, teamId: springTeam5._id },
    { userId: quinn._id, teamId: springTeam6._id },
    // AI teams
    // Note: grace and david already have teamId from Spring, but teamId is per-participant not per-event
    // For simplicity, we leave their teamId pointing to Spring team (their primary event)
    // The AI event team membership is tracked via Team.members
    { userId: ravi._id, teamId: aiTeam2._id },
    // Winter teams — these users' teamId will point to their most recent active team
    { userId: tomas._id, teamId: winterTeam2._id },
  ];

  for (const { userId, teamId } of teamAssignments) {
    await ParticipantModel.findOneAndUpdate({ userId }, { $set: { teamId } });
  }

  console.log("✅ Linked participants to teams\n");

  // ═══════════════════════════════════════════════════════════════════
  // PROJECTS
  // ═══════════════════════════════════════════════════════════════════
  console.log("💻 Creating projects...");

  // Spring Event — 2 submitted projects, 1 draft (Code Crushers has submitted, Data Wizards has a draft)
  const springProject1 = await ProjectModel.create({
    name: "Atlas Intelligence",
    description: "An AI-powered MongoDB Atlas dashboard that uses natural language to query your database. Ask questions like 'show me all users who signed up last week' and get instant results with beautiful visualizations. Built with React, Node.js, and the OpenAI API for NLQ translation. Features include query history, saved queries, and automatic index recommendations based on query patterns.",
    eventId: springEvent._id,
    teamId: springTeam1._id,
    teamMembers: [alice._id, bob._id, carol._id],
    category: "Developer Tools",
    technologies: ["React", "Node.js", "MongoDB Atlas", "OpenAI", "Chart.js"],
    repoUrl: "https://github.com/codecrushers/atlas-intelligence",
    demoUrl: "https://atlas-intel-demo.vercel.app",
    documentationUrl: "https://github.com/codecrushers/atlas-intelligence/wiki",
    innovations: "Natural language to MongoDB aggregation pipeline translation using few-shot prompting with GPT-4. Automatic index recommendation engine that analyzes query patterns.",
    status: "submitted",
    submissionDate: new Date("2026-03-22T14:30:00Z"),
  });

  const springProject2 = await ProjectModel.create({
    name: "DataFlow Studio",
    description: "Visual data pipeline builder that lets you design, test, and deploy MongoDB change stream processors with a drag-and-drop interface. Think Zapier meets data engineering.",
    eventId: springEvent._id,
    teamId: springTeam2._id,
    teamMembers: [david._id, maya._id],
    category: "Data Engineering",
    technologies: ["React", "Python", "MongoDB Change Streams", "FastAPI", "D3.js"],
    repoUrl: "https://github.com/datawizards/dataflow-studio",
    innovations: "Visual pipeline DSL that compiles to MongoDB change stream aggregation pipelines.",
    status: "draft",
    lastModified: new Date("2026-03-21T22:00:00Z"),
  });

  const springProject3 = await ProjectModel.create({
    name: "HackMatch",
    description: "AI-powered team matching platform for hackathons. Uses vector embeddings of participant skills and interests to form optimal teams. Built during this very hackathon — so meta! Includes real-time chat, skill gap analysis, and team chemistry scoring.",
    eventId: springEvent._id,
    teamId: springTeam3._id,
    teamMembers: [frank._id, emma._id, henry._id],
    category: "Social",
    technologies: ["Next.js", "MongoDB Atlas Vector Search", "OpenAI Embeddings", "WebSockets", "Tailwind CSS"],
    repoUrl: "https://github.com/fullstack-five/hackmatch",
    demoUrl: "https://hackmatch.vercel.app",
    innovations: "Hybrid matching algorithm combining vector similarity (skill embeddings) with constraint satisfaction (timezone, experience level preferences).",
    status: "submitted",
    submissionDate: new Date("2026-03-22T15:00:00Z"),
  });

  // AI Event — 1 submitted project
  const aiProject1 = await ProjectModel.create({
    name: "MedMind",
    description: "AI medical literature assistant that helps researchers find and synthesize relevant studies. Uses RAG with MongoDB Atlas Vector Search to provide cited, trustworthy answers from PubMed abstracts.",
    eventId: aiEvent._id,
    teamId: aiTeam1._id,
    teamMembers: [grace._id, david._id, noah._id],
    category: "Healthcare",
    technologies: ["Python", "MongoDB Atlas Vector Search", "LangChain", "React", "PubMed API"],
    repoUrl: "https://github.com/neural-navigators/medmind",
    demoUrl: "https://medmind-demo.streamlit.app",
    innovations: "Multi-source RAG pipeline with citation tracking and confidence scoring for medical literature retrieval.",
    status: "submitted",
    submissionDate: new Date("2026-04-12T15:30:00Z"),
  });

  // Winter Event — 3 projects (all judged)
  const winterProject1 = await ProjectModel.create({
    name: "LiveBoard",
    description: "Real-time collaborative whiteboard with persistent storage in MongoDB. Supports drawing, sticky notes, diagrams, and live cursors.",
    eventId: winterEvent._id,
    teamId: winterTeam1._id,
    teamMembers: [alice._id, bob._id, carol._id],
    category: "Productivity",
    technologies: ["React", "Node.js", "MongoDB", "Socket.IO", "Canvas API"],
    repoUrl: "https://github.com/mern-masters/liveboard",
    demoUrl: "https://liveboard-demo.herokuapp.com",
    innovations: "CRDT-based conflict resolution for real-time collaborative drawing with MongoDB change streams for persistence.",
    status: "judged",
    submissionDate: new Date("2025-12-12T16:00:00Z"),
  });

  const winterProject2 = await ProjectModel.create({
    name: "DevPulse API",
    description: "Developer analytics API that aggregates GitHub activity, CI/CD metrics, and code quality data into a unified dashboard. GraphQL API with MongoDB aggregation pipelines.",
    eventId: winterEvent._id,
    teamId: winterTeam2._id,
    teamMembers: [tomas._id, iris._id, sofia._id],
    category: "Developer Tools",
    technologies: ["Node.js", "GraphQL", "MongoDB", "GitHub API", "Express"],
    repoUrl: "https://github.com/api-artisans/devpulse",
    innovations: "Intelligent aggregation pipeline builder that auto-generates MongoDB aggregations from GraphQL queries.",
    status: "judged",
    submissionDate: new Date("2025-12-12T15:30:00Z"),
  });

  const winterProject3 = await ProjectModel.create({
    name: "ContribGraph",
    description: "Open source contribution tracker and visualizer. Shows how code flows between repositories and contributors in an interactive force-directed graph.",
    eventId: winterEvent._id,
    teamId: winterTeam3._id,
    teamMembers: [uma._id, victor._id],
    category: "Data Visualization",
    technologies: ["D3.js", "Go", "MongoDB", "GitHub API", "WebAssembly"],
    repoUrl: "https://github.com/open-sourcerers/contribgraph",
    innovations: "WebAssembly-powered graph layout engine for smooth rendering of 10K+ node contribution networks.",
    status: "judged",
    submissionDate: new Date("2025-12-12T17:00:00Z"),
  });

  console.log("✅ Created 7 projects\n");

  // ═══════════════════════════════════════════════════════════════════
  // AI SUMMARIES — Generate for submitted/judged projects
  // ═══════════════════════════════════════════════════════════════════
  console.log("🤖 Generating AI summaries for submitted projects...");

  const submittedProjects = [
    springProject1,
    springProject3,
    aiProject1,
    winterProject1,
    winterProject2,
    winterProject3,
  ];

  let summariesGenerated = 0;

  if (!process.env.OPENAI_API_KEY) {
    console.log("⚠️  OPENAI_API_KEY not set - skipping AI summary generation");
    console.log("   Set OPENAI_API_KEY to enable AI summaries\n");
  } else {
    for (const project of submittedProjects) {
      try {
        const summary = await generateProjectSummary({
          name: project.name,
          description: project.description,
          technologies: project.technologies,
          innovations: project.innovations,
        });

        await ProjectModel.findByIdAndUpdate(project._id, {
          $set: { aiSummary: summary },
        });

        console.log(`   ✓ ${project.name}`);
        summariesGenerated++;
      } catch (error) {
        console.log(`   ✗ ${project.name} - ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    console.log(`✅ Generated ${summariesGenerated}/${submittedProjects.length} AI summaries\n`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // JUDGE ASSIGNMENTS — for Spring and Winter events
  // ═══════════════════════════════════════════════════════════════════
  console.log("⚖️  Creating judge assignments...");

  // Spring Event — assign judges to submitted projects
  const springAssignments = await JudgeAssignmentModel.insertMany([
    // Judge 1 (Sarah) — assigned to both Spring submitted projects
    { eventId: springEvent._id, judgeId: judge1._id, projectId: springProject1._id, status: "pending", assignedBy: admin._id },
    { eventId: springEvent._id, judgeId: judge1._id, projectId: springProject3._id, status: "pending", assignedBy: admin._id },
    // Judge 2 (Mike) — assigned to both Spring submitted projects
    { eventId: springEvent._id, judgeId: judge2._id, projectId: springProject1._id, status: "pending", assignedBy: admin._id },
    { eventId: springEvent._id, judgeId: judge2._id, projectId: springProject3._id, status: "pending", assignedBy: admin._id },
    // Judge 3 (Aisha) — assigned to project 1 only
    { eventId: springEvent._id, judgeId: judge3._id, projectId: springProject1._id, status: "pending", assignedBy: admin._id },
  ]);

  // AI Event — assign judges
  const aiAssignments = await JudgeAssignmentModel.insertMany([
    { eventId: aiEvent._id, judgeId: judge3._id, projectId: aiProject1._id, status: "pending", assignedBy: admin._id },
    { eventId: aiEvent._id, judgeId: judge4._id, projectId: aiProject1._id, status: "pending", assignedBy: admin._id },
  ]);

  // Winter Event — all completed (event concluded)
  const winterAssignments = await JudgeAssignmentModel.insertMany([
    { eventId: winterEvent._id, judgeId: judge1._id, projectId: winterProject1._id, status: "completed", assignedBy: admin._id, completedAt: new Date("2025-12-13T10:00:00Z") },
    { eventId: winterEvent._id, judgeId: judge1._id, projectId: winterProject2._id, status: "completed", assignedBy: admin._id, completedAt: new Date("2025-12-13T10:30:00Z") },
    { eventId: winterEvent._id, judgeId: judge1._id, projectId: winterProject3._id, status: "completed", assignedBy: admin._id, completedAt: new Date("2025-12-13T11:00:00Z") },
    { eventId: winterEvent._id, judgeId: judge2._id, projectId: winterProject1._id, status: "completed", assignedBy: admin._id, completedAt: new Date("2025-12-13T11:30:00Z") },
    { eventId: winterEvent._id, judgeId: judge2._id, projectId: winterProject2._id, status: "completed", assignedBy: admin._id, completedAt: new Date("2025-12-13T12:00:00Z") },
    { eventId: winterEvent._id, judgeId: judge2._id, projectId: winterProject3._id, status: "completed", assignedBy: admin._id, completedAt: new Date("2025-12-13T12:30:00Z") },
  ]);

  console.log(`✅ Created ${springAssignments.length + aiAssignments.length + winterAssignments.length} judge assignments\n`);

  // ═══════════════════════════════════════════════════════════════════
  // SCORES — Winter event fully scored
  // ═══════════════════════════════════════════════════════════════════
  console.log("⭐ Creating scores...");

  const scores = await ScoreModel.insertMany([
    // LiveBoard — strong project, 1st place
    {
      projectId: winterProject1._id, eventId: winterEvent._id, judgeId: judge1._id,
      scores: { innovation: 9, technical: 9, impact: 8, presentation: 9 },
      comments: "Exceptional real-time collaboration implementation. The CRDT approach is clever and the UX is polished. Best project of the event.",
      submittedAt: new Date("2025-12-13T10:00:00Z"),
    },
    {
      projectId: winterProject1._id, eventId: winterEvent._id, judgeId: judge2._id,
      scores: { innovation: 8, technical: 9, impact: 9, presentation: 8 },
      comments: "Very impressive technical execution. The change streams integration is seamless. Would love to see this as a real product.",
      submittedAt: new Date("2025-12-13T11:30:00Z"),
    },
    // DevPulse API — solid project, 2nd place
    {
      projectId: winterProject2._id, eventId: winterEvent._id, judgeId: judge1._id,
      scores: { innovation: 8, technical: 8, impact: 8, presentation: 7 },
      comments: "Great developer tool concept. The auto-generated aggregation pipelines from GraphQL queries is a standout feature.",
      submittedAt: new Date("2025-12-13T10:30:00Z"),
    },
    {
      projectId: winterProject2._id, eventId: winterEvent._id, judgeId: judge2._id,
      scores: { innovation: 7, technical: 9, impact: 8, presentation: 8 },
      comments: "Solid engineering throughout. The GraphQL-to-aggregation translation is technically impressive.",
      submittedAt: new Date("2025-12-13T12:00:00Z"),
    },
    // ContribGraph — creative project, 3rd place
    {
      projectId: winterProject3._id, eventId: winterEvent._id, judgeId: judge1._id,
      scores: { innovation: 9, technical: 7, impact: 7, presentation: 8 },
      comments: "Very creative visualization approach. The WebAssembly graph engine is ambitious for a hackathon. Needs some polish but great concept.",
      submittedAt: new Date("2025-12-13T11:00:00Z"),
    },
    {
      projectId: winterProject3._id, eventId: winterEvent._id, judgeId: judge2._id,
      scores: { innovation: 8, technical: 7, impact: 6, presentation: 7 },
      comments: "Interesting concept and technically adventurous. The WASM integration is impressive even if rough around the edges.",
      submittedAt: new Date("2025-12-13T12:30:00Z"),
    },
  ]);

  console.log(`✅ Created ${scores.length} scores\n`);

  // ═══════════════════════════════════════════════════════════════════
  // PARTNERS
  // ═══════════════════════════════════════════════════════════════════
  console.log("🤝 Creating partners...");

  const partners = await PartnerModel.insertMany([
    {
      name: "MongoDB Inc.", description: "The leading modern database platform.", logo: "https://www.mongodb.com/assets/images/global/favicon.ico", website: "https://www.mongodb.com", industry: "Database Technology", tier: "platinum", status: "active",
      companyInfo: { size: "enterprise", headquarters: "New York, NY", foundedYear: 2007, employeeCount: "5000+" },
      contacts: [{ name: "Developer Relations Team", email: "devrel@mongodb.com", role: "Developer Relations", isPrimary: true }],
      social: { linkedin: "https://www.linkedin.com/company/mongodb", twitter: "https://twitter.com/MongoDB", github: "https://github.com/mongodb" },
      tags: ["database", "nosql", "cloud", "atlas", "ai"],
      engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "high" },
    },
    {
      name: "Vercel", description: "Frontend cloud platform for developers.", logo: "https://vercel.com/favicon.ico", website: "https://vercel.com", industry: "Cloud Hosting", tier: "gold", status: "active",
      companyInfo: { size: "medium", headquarters: "San Francisco, CA", foundedYear: 2015, employeeCount: "500+" },
      contacts: [{ name: "Partnership Team", email: "partnerships@vercel.com", role: "Partnership Manager", isPrimary: true }],
      social: { linkedin: "https://www.linkedin.com/company/vercel", twitter: "https://twitter.com/vercel", github: "https://github.com/vercel" },
      tags: ["hosting", "serverless", "nextjs", "deployment"],
      engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "medium" },
    },
    {
      name: "GitHub", description: "Where the world builds software.", logo: "https://github.com/favicon.ico", website: "https://github.com", industry: "Developer Tools", tier: "gold", status: "active",
      companyInfo: { size: "enterprise", headquarters: "San Francisco, CA", foundedYear: 2008, employeeCount: "3000+" },
      contacts: [{ name: "Events Team", email: "events@github.com", role: "Event Coordinator", isPrimary: true }],
      social: { linkedin: "https://www.linkedin.com/company/github", twitter: "https://twitter.com/github", github: "https://github.com/github" },
      tags: ["git", "version-control", "open-source", "collaboration"],
      engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "high" },
    },
    {
      name: "JetBrains", description: "Essential tools for software developers.", logo: "https://www.jetbrains.com/favicon.ico", website: "https://www.jetbrains.com", industry: "Developer Tools", tier: "silver", status: "active",
      companyInfo: { size: "large", headquarters: "Prague, Czech Republic", foundedYear: 2000, employeeCount: "2000+" },
      contacts: [{ name: "Community Relations", email: "community@jetbrains.com", role: "Community Manager", isPrimary: true }],
      social: { linkedin: "https://www.linkedin.com/company/jetbrains", twitter: "https://twitter.com/jetbrains", github: "https://github.com/JetBrains" },
      tags: ["ide", "productivity", "development-tools"],
      engagement: { eventsParticipated: [], prizesOffered: [], engagementLevel: "medium" },
    },
  ]);

  console.log(`✅ Created ${partners.length} partners\n`);

  // ═══════════════════════════════════════════════════════════════════
  // PRIZES
  // ═══════════════════════════════════════════════════════════════════
  console.log("🏆 Creating prizes...");

  const mongodb = partners.find((p) => p.name === "MongoDB Inc.")!;
  const vercel = partners.find((p) => p.name === "Vercel")!;
  const github = partners.find((p) => p.name === "GitHub")!;
  const jetbrains = partners.find((p) => p.name === "JetBrains")!;

  const prizes = await PrizeModel.insertMany([
    // Spring Event
    { eventId: springEvent._id, title: "Grand Prize", description: "Overall winner of MongoDB Spring Hackathon 2026", category: "grand", value: "$5,000 + MongoDB Atlas Credits", monetaryValue: 5000, displayOrder: 1, isActive: true },
    { eventId: springEvent._id, partnerId: mongodb._id, title: "Best MongoDB Integration", description: "Best use of MongoDB Atlas features", category: "sponsor", value: "$2,500 + 1 Year Atlas M10 Cluster", monetaryValue: 2500, eligibility: "Must use MongoDB Atlas", criteria: ["Creative use of MongoDB features", "Data model design", "Query optimization"], displayOrder: 2, isActive: true },
    { eventId: springEvent._id, partnerId: vercel._id, title: "Best Deployment", description: "Best project deployed on Vercel", category: "sponsor", value: "$1,000 Vercel Pro subscription", monetaryValue: 1000, displayOrder: 3, isActive: true },
    { eventId: springEvent._id, partnerId: github._id, title: "Best Open Source Project", description: "Best project with clean code and documentation", category: "sponsor", value: "$500 + GitHub Swag Pack", monetaryValue: 500, displayOrder: 4, isActive: true },
    { eventId: springEvent._id, partnerId: jetbrains._id, title: "Most Innovative Code", description: "Most creative coding solution", category: "special", value: "JetBrains All Products Pack (1 year)", monetaryValue: 649, displayOrder: 5, isActive: true },
    // AI Event
    { eventId: aiEvent._id, title: "AI Champion", description: "Best overall AI-powered application", category: "grand", value: "$3,000", monetaryValue: 3000, displayOrder: 1, isActive: true },
    { eventId: aiEvent._id, partnerId: mongodb._id, title: "Best Vector Search Implementation", description: "Most innovative use of MongoDB Vector Search", category: "sponsor", value: "$1,500 + MongoDB Atlas AI Credits", monetaryValue: 1500, displayOrder: 2, isActive: true },
    // Winter Event — with winners assigned
    {
      eventId: winterEvent._id, title: "Grand Prize", description: "Overall winner", category: "grand", value: "$3,000", monetaryValue: 3000, displayOrder: 1, isActive: true,
      winners: [{ projectId: winterProject1._id, teamId: winterTeam1._id, awardedDate: new Date("2025-12-14"), notes: "Unanimous winner — exceptional real-time collaboration tool" }],
    },
    {
      eventId: winterEvent._id, title: "Best API Design", description: "Best API architecture and developer experience", category: "special", value: "$1,000", monetaryValue: 1000, displayOrder: 2, isActive: true,
      winners: [{ projectId: winterProject2._id, teamId: winterTeam2._id, awardedDate: new Date("2025-12-14"), notes: "Outstanding GraphQL implementation" }],
    },
  ]);

  console.log(`✅ Created ${prizes.length} prizes\n`);

  // Update partner engagement
  for (const prize of prizes) {
    if (prize.partnerId) {
      await PartnerModel.findByIdAndUpdate(prize.partnerId, {
        $addToSet: { "engagement.eventsParticipated": prize.eventId, "engagement.prizesOffered": prize._id },
        $set: { "engagement.lastEngagementDate": new Date() },
      });
    }
  }

  // Update events with partner references
  await EventModel.findByIdAndUpdate(springEvent._id, { $set: { partners: [mongodb._id, vercel._id, github._id, jetbrains._id] } });
  await EventModel.findByIdAndUpdate(aiEvent._id, { $set: { partners: [mongodb._id] } });

  console.log("✅ Updated partner-event relationships\n");

  // ═══════════════════════════════════════════════════════════════════
  // TEMPLATES
  // ═══════════════════════════════════════════════════════════════════
  console.log("🎨 Seeding built-in templates...");
  const templatesInserted = await seedBuiltInTemplates();
  console.log(`✅ Seeded ${templatesInserted} built-in templates\n`);

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  console.log("🎉 Seeding complete!\n");
  console.log("📊 Summary:");
  console.log(`   Users:             ${users.length}`);
  console.log(`   Participants:      ${participants.length}`);
  console.log(`   Events:            4`);
  console.log(`   Teams:             11`);
  console.log(`   Projects:          7`);
  console.log(`   AI Summaries:      ${summariesGenerated}`);
  console.log(`   Judge Assignments: ${springAssignments.length + aiAssignments.length + winterAssignments.length}`);
  console.log(`   Scores:            ${scores.length}`);
  console.log(`   Partners:          ${partners.length}`);
  console.log(`   Prizes:            ${prizes.length}`);
  console.log(`   Templates:         ${templatesInserted}\n`);

  console.log("🔑 Test Credentials (all passwords: password123):");
  console.log("   Super Admin:  superadmin@mongohacks.com");
  console.log("   Admin:        admin@mongohacks.com");
  console.log("   Organizer:    organizer@mongohacks.com");
  console.log("   Judge 1:      sarah.judge@mongohacks.com");
  console.log("   Judge 2:      mike.judge@mongohacks.com");
  console.log("   Judge 3:      aisha.judge@mongohacks.com");
  console.log("   Judge 4:      liam.judge@mongohacks.com\n");
  console.log("   🧪 Key test accounts:");
  console.log("   alice@example.com   — Spring: team lead (Code Crushers), submitted project");
  console.log("   david@example.com   — Spring: team (Data Wizards), draft project");
  console.log("   priya@example.com   — Spring: registered, NO team (test join flow)");
  console.log("   jake@example.com    — Spring: registered, NO team, beginner");
  console.log("   noah@example.com    — Spring: registered, NO team, beginner");
  console.log("   sofia@example.com   — AI Event: registered, NO team\n");

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
