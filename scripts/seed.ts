#!/usr/bin/env tsx

import { connectToDatabase } from "../src/lib/db/connection";
import { UserModel } from "../src/lib/db/models/User";
import { EventModel } from "../src/lib/db/models/Event";
import { TeamModel } from "../src/lib/db/models/Team";
import { ProjectModel } from "../src/lib/db/models/Project";
import { ParticipantModel } from "../src/lib/db/models/Participant";
import { ScoreModel } from "../src/lib/db/models/Score";
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
    console.log("   Admin:    admin@mongohacks.com / password123");
    console.log("   Judge:    sarah.judge@mongohacks.com / password123");
    console.log("   User:     alice@example.com / password123\n");
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
    console.log("✅ Data cleared\n");
  }

  // Create Users
  console.log("👥 Creating users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = await UserModel.insertMany([
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

  const [admin, judge1, judge2, alice, bob, carol, david, emma, frank, grace, henry] = users;
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

  console.log("🎉 Seeding complete!\n");
  console.log("📊 Summary:");
  console.log(`   Users: ${users.length}`);
  console.log(`   Participants: ${participants.length}`);
  console.log(`   Events: 4`);
  console.log(`   Teams: ${teams.length}`);
  console.log(`   Projects: ${projects.length}`);
  console.log(`   Scores: ${scores.length}\n`);

  console.log("🔑 Test Credentials:");
  console.log("   Admin:    admin@mongohacks.com / password123");
  console.log("   Judge:    sarah.judge@mongohacks.com / password123");
  console.log("   Judge:    mike.judge@mongohacks.com / password123");
  console.log("   User:     alice@example.com / password123");
  console.log("   (All users have password: password123)\n");

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
