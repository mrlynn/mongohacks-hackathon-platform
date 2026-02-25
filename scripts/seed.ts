#!/usr/bin/env tsx

import { connectToDatabase } from "../src/lib/db/connection";
import { UserModel } from "../src/lib/db/models/User";
import { EventModel } from "../src/lib/db/models/Event";
import { TeamModel } from "../src/lib/db/models/Team";
import { ProjectModel } from "../src/lib/db/models/Project";
import { ParticipantModel } from "../src/lib/db/models/Participant";
import { ScoreModel } from "../src/lib/db/models/Score";
import { TemplateConfigModel } from "../src/lib/db/models/TemplateConfig";
import { PartnerModel } from "../src/lib/db/models/Partner";
import { PrizeModel } from "../src/lib/db/models/Prize";
import { seedBuiltInTemplates } from "../src/lib/db/seed-templates";
import bcrypt from "bcryptjs";

const CLEAR_EXISTING = process.argv.includes("--clear");

console.log("🌱 Seeding database...\n");

async function seed() {
  await connectToDatabase();

  // Check if data already exists
  const existingUsers = await UserModel.countDocuments();
  
  if (existingUsers > 0 && !CLEAR_EXISTING) {
    console.log("⚠️  Database already has data!");
    console.log(`   Found ${existingUsers} existing users.\n`);
    console.log("💡 Options:");
    console.log("   1. Use existing data (you're all set!)");
    console.log("   2. Run 'npm run seed:clear' to wipe and reload fresh data\n");
    console.log("🔑 Test Credentials:");
    console.log("   Super Admin: superadmin@mongohacks.com / password123");
    console.log("   Admin:       admin@mongohacks.com / password123");
    console.log("   Judge:       sarah.judge@mongohacks.com / password123");
    console.log("   User:        alice@example.com / password123\n");
    process.exit(0);
  }

  // Clear existing data if flag is set
  if (CLEAR_EXISTING) {
    console.log("🗑️  Clearing existing data...");
    await UserModel.deleteMany({});
    await EventModel.deleteMany({});
    await TeamModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await ParticipantModel.deleteMany({});
    await ScoreModel.deleteMany({});
    await TemplateConfigModel.deleteMany({});
    await PartnerModel.deleteMany({});
    await PrizeModel.deleteMany({});
    console.log("✅ Data cleared\n");
  }

  // Create Users
  console.log("👥 Creating users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = await UserModel.insertMany([
    {
      name: "Super Admin",
      email: "superadmin@mongohacks.com",
      passwordHash,
      role: "super_admin",
    },
    {
      name: "Admin User",
      email: "admin@mongohacks.com",
      passwordHash,
      role: "admin",
    },
    {
      name: "Sarah Judge",
      email: "sarah.judge@mongohacks.com",
      passwordHash,
      role: "judge",
    },
    {
      name: "Mike Judge",
      email: "mike.judge@mongohacks.com",
      passwordHash,
      role: "judge",
    },
    {
      name: "Alice Developer",
      email: "alice@example.com",
      passwordHash,
      role: "participant",
    },
    {
      name: "Bob Chen",
      email: "bob@example.com",
      passwordHash,
      role: "participant",
    },
    {
      name: "Carol Martinez",
      email: "carol@example.com",
      passwordHash,
      role: "participant",
    },
    {
      name: "David Kim",
      email: "david@example.com",
      passwordHash,
      role: "participant",
    },
    {
      name: "Emma Wilson",
      email: "emma@example.com",
      passwordHash,
      role: "participant",
    },
    {
      name: "Frank Zhang",
      email: "frank@example.com",
      passwordHash,
      role: "participant",
    },
    {
      name: "Grace Lee",
      email: "grace@example.com",
      passwordHash,
      role: "participant",
    },
    {
      name: "Henry Patel",
      email: "henry@example.com",
      passwordHash,
      role: "participant",
    },
  ]);

  const [superAdmin, admin, judge1, judge2, alice, bob, carol, david, emma, frank, grace, henry] = users;
  console.log(`✅ Created ${users.length} users\n`);

  // Create Participants
  console.log("🎯 Creating participant profiles...");
  const participants = await ParticipantModel.insertMany([
    {
      userId: alice._id,
      email: alice.email,
      name: alice.name,
      bio: "Full-stack developer passionate about AI and web technologies",
      skills: ["JavaScript", "Python", "React", "Node.js", "MongoDB"],
      interests: ["AI", "Web Development", "Open Source"],
      experience_level: "intermediate",
    },
    {
      userId: bob._id,
      email: bob.email,
      name: bob.name,
      bio: "Backend engineer specializing in scalable systems",
      skills: ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
      interests: ["Cloud Architecture", "DevOps", "Microservices"],
      experience_level: "advanced",
    },
    {
      userId: carol._id,
      email: carol.email,
      name: carol.name,
      bio: "Frontend developer with a keen eye for design",
      skills: ["React", "TypeScript", "CSS", "Figma", "Next.js"],
      interests: ["UI/UX", "Design Systems", "Accessibility"],
      experience_level: "intermediate",
    },
    {
      userId: david._id,
      email: david.email,
      name: david.name,
      bio: "Data scientist exploring machine learning applications",
      skills: ["Python", "TensorFlow", "Pandas", "SQL", "Jupyter"],
      interests: ["Machine Learning", "Data Visualization", "NLP"],
      experience_level: "beginner",
    },
    {
      userId: emma._id,
      email: emma.email,
      name: emma.name,
      bio: "Mobile developer building iOS and Android apps",
      skills: ["Swift", "Kotlin", "React Native", "Firebase"],
      interests: ["Mobile Development", "AR/VR", "IoT"],
      experience_level: "intermediate",
    },
    {
      userId: frank._id,
      email: frank.email,
      name: frank.name,
      bio: "Security researcher focused on web application security",
      skills: ["Security", "Penetration Testing", "Python", "Bash"],
      interests: ["Cybersecurity", "Ethical Hacking", "Cryptography"],
      experience_level: "advanced",
    },
    {
      userId: grace._id,
      email: grace.email,
      name: grace.name,
      bio: "Blockchain enthusiast exploring decentralized applications",
      skills: ["Solidity", "Web3.js", "Ethereum", "Smart Contracts"],
      interests: ["Blockchain", "DeFi", "NFTs"],
      experience_level: "beginner",
    },
    {
      userId: henry._id,
      email: henry.email,
      name: henry.name,
      bio: "Game developer creating immersive experiences",
      skills: ["Unity", "C#", "3D Modeling", "Blender"],
      interests: ["Game Development", "Virtual Reality", "Animation"],
      experience_level: "intermediate",
    },
  ]);
  console.log(`✅ Created ${participants.length} participant profiles\n`);

  // Create Events
  console.log("📅 Creating events...");
  
    const springEvent = await EventModel.create({
    name: "MongoDB Spring Hackathon 2026",
    description: "Build the next generation of database-powered applications",
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
    tags: ["AI", "Database", "Web Development"],
    rules: "Standard hackathon rules apply. Teams of 2-5 members.",
    judging_criteria: ["Innovation", "Technical Complexity", "Impact", "Presentation"],
    organizers: [admin._id],
    status: "open",
    coordinates: {
      type: "Point",
      coordinates: [-74.006, 40.7128], // NYC
    },
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
        ],
      },
    },
  });

  // Virtual event - use dummy coordinates to satisfy schema
  // TODO: Fix Event model to make coordinates truly optional
  const aiEvent = await EventModel.create({
    name: "AI Challenge 2026",
    description: "Harness the power of artificial intelligence",
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
    tags: ["AI", "Machine Learning", "Deep Learning"],
    rules: "Open to all skill levels. Individual or team entries.",
    judging_criteria: ["Innovation", "Technical Merit", "Practicality", "Presentation"],
    organizers: [admin._id],
    status: "open",
    coordinates: {
      type: "Point",
      coordinates: [0, 0], // Dummy coordinates for virtual event
    },
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

  const web3Event = await EventModel.create({
    name: "Web3 Summit Hackathon",
      description: "Decentralize the web with blockchain technology",
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
    tags: ["Blockchain", "Web3", "DeFi"],
    rules: "Build a working prototype using blockchain technology.",
    judging_criteria: ["Innovation", "Security", "Usability", "Impact"],
    organizers: [admin._id],
    status: "draft",
    coordinates: {
      type: "Point",
      coordinates: [-122.4194, 37.7749], // SF
    },
    landingPage: {
      template: "bold",
      slug: "web3-summit-2026",
      published: false,
      customContent: {
        hero: {
          headline: "Web3 Summit Hackathon",
          subheadline: "Decentralize everything",
          ctaText: "Register",
        },
      },
    },
  });

  const winterEvent = await EventModel.create({
    name: "MongoDB Winter Hackathon 2025",
    description: "Past event - Already concluded",
    theme: "Full Stack Development",
    startDate: new Date("2025-12-10T09:00:00Z"),
    endDate: new Date("2025-12-12T18:00:00Z"),
    registrationDeadline: new Date("2025-12-05T23:59:59Z"),
    location: "Austin, TX",
    city: "Austin",
    country: "United States",
    venue: "Austin Convention Center",
    capacity: 80,
    isVirtual: false,
    tags: ["Full Stack", "MERN", "APIs"],
    rules: "Build full-stack applications.",
    judging_criteria: ["Functionality", "Design", "Code Quality", "Innovation"],
    organizers: [admin._id],
    status: "concluded",
    coordinates: {
      type: "Point",
      coordinates: [-97.7431, 30.2672], // Austin
    },
    landingPage: {
      template: "modern",
      slug: "mongodb-winter-2025",
      published: true,
      customContent: {
        hero: {
          headline: "MongoDB Winter Hackathon 2025",
          subheadline: "Event concluded - See results!",
          ctaText: "View Results",
        },
      },
    },
  });

  console.log(`✅ Created 4 events\n`);

  // Register participants for events
  console.log("📝 Registering participants...");
  const aliceParticipant = await ParticipantModel.findOne({ userId: alice._id });
  const bobParticipant = await ParticipantModel.findOne({ userId: bob._id });
  const carolParticipant = await ParticipantModel.findOne({ userId: carol._id });
  const davidParticipant = await ParticipantModel.findOne({ userId: david._id });
  const emmaParticipant = await ParticipantModel.findOne({ userId: emma._id });
  const frankParticipant = await ParticipantModel.findOne({ userId: frank._id });
  const graceParticipant = await ParticipantModel.findOne({ userId: grace._id });
  const henryParticipant = await ParticipantModel.findOne({ userId: henry._id });

  // Register for Spring Event
  if (aliceParticipant) {
    aliceParticipant.registeredEvents.push({
      eventId: springEvent._id,
      registrationDate: new Date(),
      status: "registered",
    });
    await aliceParticipant.save();
  }

  if (bobParticipant) {
    bobParticipant.registeredEvents.push({
      eventId: springEvent._id,
      registrationDate: new Date(),
      status: "registered",
    });
    await bobParticipant.save();
  }

  if (carolParticipant) {
    carolParticipant.registeredEvents.push({
      eventId: springEvent._id,
      registrationDate: new Date(),
      status: "registered",
    });
    await carolParticipant.save();
  }

  if (davidParticipant) {
    davidParticipant.registeredEvents.push({
      eventId: springEvent._id,
      registrationDate: new Date(),
      status: "registered",
    });
    await davidParticipant.save();
  }

  // Register for AI Event
  if (emmaParticipant) {
    emmaParticipant.registeredEvents.push({
      eventId: aiEvent._id,
      registrationDate: new Date(),
      status: "registered",
    });
    await emmaParticipant.save();
  }

  if (frankParticipant) {
    frankParticipant.registeredEvents.push({
      eventId: aiEvent._id,
      registrationDate: new Date(),
      status: "registered",
    });
    await frankParticipant.save();
  }

  // Register for Winter Event (concluded)
  if (graceParticipant) {
    graceParticipant.registeredEvents.push({
      eventId: winterEvent._id,
      registrationDate: new Date("2025-12-01"),
      status: "attended",
    });
    await graceParticipant.save();
  }

  if (henryParticipant) {
    henryParticipant.registeredEvents.push({
      eventId: winterEvent._id,
      registrationDate: new Date("2025-12-01"),
      status: "attended",
    });
    await henryParticipant.save();
  }

  console.log("✅ Participants registered for events\n");

  // Create Teams
  console.log("👥 Creating teams...");
  const teams = await TeamModel.insertMany([
    {
      name: "Code Crushers",
      description: "We crush bugs and build amazing apps",
      eventId: springEvent._id,
      leaderId: alice._id,
      members: [alice._id, bob._id, carol._id],
      lookingForMembers: false,
      requiredSkills: [],
    },
    {
      name: "Data Wizards",
      description: "Turning data into magic",
      eventId: springEvent._id,
      leaderId: david._id,
      members: [david._id],
      lookingForMembers: true,
      requiredSkills: ["Python", "Machine Learning"],
    },
    {
      name: "AI Innovators",
      description: "Building the future with AI",
      eventId: aiEvent._id,
      leaderId: emma._id,
      members: [emma._id, frank._id],
      lookingForMembers: false,
      requiredSkills: [],
    },
    {
      name: "Blockchain Builders",
      description: "Decentralizing everything",
      eventId: winterEvent._id,
      leaderId: grace._id,
      members: [grace._id, henry._id],
      lookingForMembers: false,
      requiredSkills: [],
    },
  ]);

  const [team1, team2, team3, team4] = teams;
  console.log(`✅ Created ${teams.length} teams\n`);

  // Update participants with team IDs
  if (aliceParticipant) {
    aliceParticipant.teamId = team1._id;
    await aliceParticipant.save();
  }
  if (bobParticipant) {
    bobParticipant.teamId = team1._id;
    await bobParticipant.save();
  }
  if (carolParticipant) {
    carolParticipant.teamId = team1._id;
    await carolParticipant.save();
  }
  if (davidParticipant) {
    davidParticipant.teamId = team2._id;
    await davidParticipant.save();
  }
  if (emmaParticipant) {
    emmaParticipant.teamId = team3._id;
    await emmaParticipant.save();
  }
  if (frankParticipant) {
    frankParticipant.teamId = team3._id;
    await frankParticipant.save();
  }
  if (graceParticipant) {
    graceParticipant.teamId = team4._id;
    await graceParticipant.save();
  }
  if (henryParticipant) {
    henryParticipant.teamId = team4._id;
    await henryParticipant.save();
  }

  // Create Projects
  console.log("💻 Creating projects...");
  const projects = await ProjectModel.insertMany([
    {
      name: "Smart Task Manager",
      description: "AI-powered task management with natural language processing",
      eventId: springEvent._id,
      teamId: team1._id,
      teamMembers: [alice._id, bob._id, carol._id],
      category: "Productivity",
      technologies: ["React", "Node.js", "MongoDB", "OpenAI"],
      repoUrl: "https://github.com/codecrushers/smart-task-manager",
      demoUrl: "https://smart-task-demo.example.com",
      documentationUrl: "https://docs.smart-task.example.com",
      innovations: "Uses GPT-4 for natural language task creation and smart scheduling",
      status: "submitted",
      submissionDate: new Date("2026-03-22T16:00:00Z"),
    },
    {
      name: "AI Health Assistant",
      description: "Personal health tracking with AI-driven insights",
      eventId: aiEvent._id,
      teamId: team3._id,
      teamMembers: [emma._id, frank._id],
      category: "Healthcare",
      technologies: ["Python", "TensorFlow", "React Native", "Firebase"],
      repoUrl: "https://github.com/aiinnovators/health-assistant",
      demoUrl: "https://health-ai-demo.example.com",
      innovations: "Machine learning models for personalized health recommendations",
      status: "submitted",
      submissionDate: new Date("2026-04-12T15:30:00Z"),
    },
    {
      name: "Decentralized Marketplace",
      description: "P2P marketplace built on blockchain",
      eventId: winterEvent._id,
      teamId: team4._id,
      teamMembers: [grace._id, henry._id],
      category: "E-commerce",
      technologies: ["Solidity", "Web3.js", "React", "IPFS"],
      repoUrl: "https://github.com/blockchainbuilders/defi-marketplace",
      demoUrl: "https://defi-market-demo.example.com",
      documentationUrl: "https://docs.defi-market.example.com",
      innovations: "Zero-fee transactions using smart contracts",
      status: "judged",
      submissionDate: new Date("2025-12-12T17:00:00Z"),
    },
  ]);

  const [project1, project2, project3] = projects;
  console.log(`✅ Created ${projects.length} projects\n`);

  // Create Scores (for concluded event)
  console.log("⭐ Creating scores...");
  const scores = await ScoreModel.insertMany([
    {
      projectId: project3._id,
      eventId: winterEvent._id,
      judgeId: judge1._id,
      scores: {
        innovation: 9,
        technical: 8,
        impact: 9,
        presentation: 8,
      },
      comments: "Excellent use of blockchain technology. Very impressive implementation.",
      submittedAt: new Date("2025-12-13T10:00:00Z"),
    },
    {
      projectId: project3._id,
      eventId: winterEvent._id,
      judgeId: judge2._id,
      scores: {
        innovation: 8,
        technical: 9,
        impact: 8,
        presentation: 9,
      },
      comments: "Great presentation and solid technical foundation. Well done!",
      submittedAt: new Date("2025-12-13T11:00:00Z"),
    },
  ]);

  console.log(`✅ Created ${scores.length} scores\n`);

  // Create Partners
  console.log("🤝 Creating partners...");
  const partners = await PartnerModel.insertMany([
    {
      name: "MongoDB Inc.",
      description: "The leading modern, general purpose database platform. MongoDB empowers innovators to create, transform, and disrupt industries by unleashing the power of software and data.",
      logo: "https://www.mongodb.com/assets/images/global/favicon.ico",
      website: "https://www.mongodb.com",
      industry: "Database Technology",
      tier: "platinum",
      status: "active",
      companyInfo: {
        size: "enterprise",
        headquarters: "New York, NY",
        foundedYear: 2007,
        employeeCount: "5000+",
      },
      contacts: [
        {
          name: "Developer Relations Team",
          email: "devrel@mongodb.com",
          role: "Developer Relations",
          isPrimary: true,
        },
      ],
      social: {
        linkedin: "https://www.linkedin.com/company/mongodb",
        twitter: "https://twitter.com/MongoDB",
        github: "https://github.com/mongodb",
      },
      tags: ["database", "nosql", "cloud", "atlas", "ai"],
      engagement: {
        eventsParticipated: [],
        prizesOffered: [],
        engagementLevel: "high",
      },
    },
    {
      name: "Vercel",
      description: "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
      logo: "https://vercel.com/favicon.ico",
      website: "https://vercel.com",
      industry: "Cloud Hosting",
      tier: "gold",
      status: "active",
      companyInfo: {
        size: "medium",
        headquarters: "San Francisco, CA",
        foundedYear: 2015,
        employeeCount: "500+",
      },
      contacts: [
        {
          name: "Partnership Team",
          email: "partnerships@vercel.com",
          role: "Partnership Manager",
          isPrimary: true,
        },
      ],
      social: {
        linkedin: "https://www.linkedin.com/company/vercel",
        twitter: "https://twitter.com/vercel",
        github: "https://github.com/vercel",
      },
      tags: ["hosting", "serverless", "nextjs", "deployment"],
      engagement: {
        eventsParticipated: [],
        prizesOffered: [],
        engagementLevel: "medium",
      },
    },
    {
      name: "GitHub",
      description: "Where the world builds software. Millions of developers use GitHub to build personal projects, support their businesses, and work together on open source technologies.",
      logo: "https://github.com/favicon.ico",
      website: "https://github.com",
      industry: "Developer Tools",
      tier: "gold",
      status: "active",
      companyInfo: {
        size: "enterprise",
        headquarters: "San Francisco, CA",
        foundedYear: 2008,
        employeeCount: "3000+",
      },
      contacts: [
        {
          name: "Events Team",
          email: "events@github.com",
          role: "Event Coordinator",
          isPrimary: true,
        },
      ],
      social: {
        linkedin: "https://www.linkedin.com/company/github",
        twitter: "https://twitter.com/github",
        github: "https://github.com/github",
      },
      tags: ["git", "version-control", "open-source", "collaboration"],
      engagement: {
        eventsParticipated: [],
        prizesOffered: [],
        engagementLevel: "high",
      },
    },
    {
      name: "JetBrains",
      description: "Essential tools for software developers and teams. Intelligent IDEs and productivity tools designed to help developers work more efficiently.",
      logo: "https://www.jetbrains.com/favicon.ico",
      website: "https://www.jetbrains.com",
      industry: "Developer Tools",
      tier: "silver",
      status: "active",
      companyInfo: {
        size: "large",
        headquarters: "Prague, Czech Republic",
        foundedYear: 2000,
        employeeCount: "2000+",
      },
      contacts: [
        {
          name: "Community Relations",
          email: "community@jetbrains.com",
          role: "Community Manager",
          isPrimary: true,
        },
      ],
      social: {
        linkedin: "https://www.linkedin.com/company/jetbrains",
        twitter: "https://twitter.com/jetbrains",
        github: "https://github.com/JetBrains",
      },
      tags: ["ide", "productivity", "development-tools"],
      engagement: {
        eventsParticipated: [],
        prizesOffered: [],
        engagementLevel: "medium",
      },
    },
    {
      name: "Sticker Mule",
      description: "The internet's most kick-ass brand. Custom printing that's surprisingly easy and backed by a super-fun guarantee.",
      logo: "https://www.stickermule.com/favicon.ico",
      website: "https://www.stickermule.com",
      industry: "Printing & Merchandise",
      tier: "bronze",
      status: "active",
      companyInfo: {
        size: "small",
        headquarters: "Amsterdam, NY",
        foundedYear: 2010,
        employeeCount: "100+",
      },
      contacts: [
        {
          name: "Sponsorship Team",
          email: "sponsor@stickermule.com",
          role: "Sponsorship Coordinator",
          isPrimary: true,
        },
      ],
      social: {
        twitter: "https://twitter.com/stickermule",
      },
      tags: ["swag", "stickers", "merchandise"],
      engagement: {
        eventsParticipated: [],
        prizesOffered: [],
        engagementLevel: "low",
      },
    },
    {
      name: "Local Tech Community",
      description: "Supporting local developers and fostering innovation in our community.",
      industry: "Community",
      tier: "community",
      status: "active",
      contacts: [
        {
          name: "Community Lead",
          email: "hello@localtech.community",
          role: "Organizer",
          isPrimary: true,
        },
      ],
      tags: ["community", "local", "grassroots"],
      engagement: {
        eventsParticipated: [],
        prizesOffered: [],
        engagementLevel: "medium",
      },
    },
  ]);

  console.log(`✅ Created ${partners.length} partners\n`);

  // Create Prizes linked to Partners
  console.log("🏆 Creating prizes...");
  
  const mongodb = partners.find((p) => p.name === "MongoDB Inc.");
  const vercel = partners.find((p) => p.name === "Vercel");
  const github = partners.find((p) => p.name === "GitHub");
  const jetbrains = partners.find((p) => p.name === "JetBrains");

  const prizes = await PrizeModel.insertMany([
    // MongoDB Spring Hackathon prizes
    {
      eventId: springEvent._id,
      title: "Grand Prize",
      description: "Overall winner of MongoDB Spring Hackathon 2026",
      category: "grand",
      value: "$5,000 + MongoDB Atlas Credits",
      monetaryValue: 5000,
      displayOrder: 1,
      isActive: true,
    },
    {
      eventId: springEvent._id,
      partnerId: mongodb?._id,
      title: "Best MongoDB Integration",
      description: "Best use of MongoDB Atlas features and capabilities",
      category: "sponsor",
      value: "$2,500 + 1 Year MongoDB Atlas M10 Cluster",
      monetaryValue: 2500,
      eligibility: "Must use MongoDB Atlas in the project",
      criteria: ["Creative use of MongoDB features", "Data model design", "Query optimization"],
      displayOrder: 2,
      isActive: true,
    },
    {
      eventId: springEvent._id,
      partnerId: vercel?._id,
      title: "Best Deployment",
      description: "Best project deployed and hosted on Vercel",
      category: "sponsor",
      value: "$1,000 Vercel Pro subscription",
      monetaryValue: 1000,
      displayOrder: 3,
      isActive: true,
    },
    {
      eventId: springEvent._id,
      partnerId: github?._id,
      title: "Best Open Source Project",
      description: "Best project with clean code, documentation, and community potential",
      category: "sponsor",
      value: "$500 + GitHub Swag Pack",
      monetaryValue: 500,
      displayOrder: 4,
      isActive: true,
    },
    {
      eventId: springEvent._id,
      partnerId: jetbrains?._id,
      title: "Most Innovative Code",
      description: "Most creative and innovative coding solution",
      category: "special",
      value: "JetBrains All Products Pack (1 year)",
      monetaryValue: 649,
      displayOrder: 5,
      isActive: true,
    },
    // AI Challenge prizes
    {
      eventId: aiEvent._id,
      title: "AI Champion",
      description: "Best overall AI-powered application",
      category: "grand",
      value: "$3,000",
      monetaryValue: 3000,
      displayOrder: 1,
      isActive: true,
    },
    {
      eventId: aiEvent._id,
      partnerId: mongodb?._id,
      title: "Best Vector Search Implementation",
      description: "Most innovative use of MongoDB Vector Search",
      category: "sponsor",
      value: "$1,500 + MongoDB Atlas AI Credits",
      monetaryValue: 1500,
      displayOrder: 2,
      isActive: true,
    },
  ]);

  console.log(`✅ Created ${prizes.length} prizes\n`);

  // Update partner engagement with event and prize references
  for (const prize of prizes) {
    if (prize.partnerId) {
      await PartnerModel.findByIdAndUpdate(prize.partnerId, {
        $addToSet: {
          "engagement.eventsParticipated": prize.eventId,
          "engagement.prizesOffered": prize._id,
        },
        $set: {
          "engagement.lastEngagementDate": new Date(),
        },
      });
    }
  }

  // Update events with partner references
  await EventModel.findByIdAndUpdate(springEvent._id, {
    $set: { partners: [mongodb?._id, vercel?._id, github?._id, jetbrains?._id].filter(Boolean) },
  });

  await EventModel.findByIdAndUpdate(aiEvent._id, {
    $set: { partners: [mongodb?._id].filter(Boolean) },
  });

  console.log("✅ Updated partner-event relationships\n");

  // Seed built-in templates
  console.log("🎨 Seeding built-in templates...");
  const templatesInserted = await seedBuiltInTemplates();
  console.log(`✅ Seeded ${templatesInserted} built-in templates\n`);

  console.log("🎉 Seeding complete!\n");
  console.log("📊 Summary:");
  console.log(`   Users: ${users.length}`);
  console.log(`   Participants: ${participants.length}`);
  console.log(`   Events: 4`);
  console.log(`   Teams: ${teams.length}`);
  console.log(`   Projects: ${projects.length}`);
  console.log(`   Scores: ${scores.length}`);
  console.log(`   Partners: ${partners.length}`);
  console.log(`   Prizes: ${prizes.length}`);
  console.log(`   Templates: ${templatesInserted}\n`);

  console.log("🔑 Test Credentials:");
  console.log("   Super Admin: superadmin@mongohacks.com / password123");
  console.log("   Admin:       admin@mongohacks.com / password123");
  console.log("   Judge:       sarah.judge@mongohacks.com / password123");
  console.log("   Judge:       mike.judge@mongohacks.com / password123");
  console.log("   User:        alice@example.com / password123");
  console.log("   (All users have password: password123)\n");

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
