#!/usr/bin/env tsx

/**
 * Seeds featured projects for the gallery.
 *
 * Strategy:
 *  1. Mark all existing submitted/judged projects as featured with thumbnails.
 *  2. Create additional realistic featured projects linked to existing events/teams.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { connectToDatabase } from "../src/lib/db/connection";
import { ProjectModel } from "../src/lib/db/models/Project";
import { EventModel } from "../src/lib/db/models/Event";
import { TeamModel } from "../src/lib/db/models/Team";

// High-quality placeholder thumbnails (Unsplash — code/tech themed)
const thumbnails = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop", // code on screen
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop", // laptop coding
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop", // monitor code
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop", // code close-up
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop", // matrix green
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop", // server room
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop", // dashboard
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop", // react logo
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop", // AI brain
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop", // circuit board
];

async function seedFeatured() {
  console.log("🌟 Seeding featured projects for gallery...\n");

  await connectToDatabase();

  // Step 1: Feature all existing submitted/judged projects
  const existing = await ProjectModel.find({
    status: { $in: ["submitted", "judged"] },
  });

  if (existing.length === 0) {
    console.log(
      "⚠️  No submitted/judged projects found. Run `npm run seed` first.\n"
    );
    process.exit(1);
  }

  console.log(
    `📌 Marking ${existing.length} existing projects as featured...`
  );

  for (let i = 0; i < existing.length; i++) {
    await ProjectModel.findByIdAndUpdate(existing[i]._id, {
      featured: true,
      thumbnailUrl: thumbnails[i % thumbnails.length],
    });
  }
  console.log("✅ Existing projects featured\n");

  // Step 2: Create additional featured projects using existing events & teams
  const events = await EventModel.find().limit(3).lean();
  const teams = await TeamModel.find().limit(5).lean();

  if (events.length === 0 || teams.length === 0) {
    console.log("⚠️  Need events and teams. Run `npm run seed` first.\n");
    process.exit(1);
  }

  const additionalProjects = [
    {
      name: "MongoMesh",
      description:
        "A real-time service mesh dashboard built on MongoDB change streams. Visualizes microservice communication patterns, detects anomalies, and provides latency heatmaps across your entire infrastructure. Features auto-discovery of services and intelligent alerting powered by time-series analysis.",
      category: "DevTools",
      technologies: [
        "TypeScript",
        "React",
        "MongoDB Change Streams",
        "D3.js",
        "Node.js",
      ],
      repoUrl: "https://github.com/mongodb-labs/mongo-snippets",
      demoUrl: "https://mongomesh-demo.vercel.app",
      innovations:
        "Uses MongoDB time-series collections for sub-second latency tracking with automatic rollup aggregations.",
      thumbnailUrl: thumbnails[5],
    },
    {
      name: "QueryCraft",
      description:
        "An intelligent MongoDB query builder that converts natural language to optimized aggregation pipelines. Features a visual pipeline editor, query explanation mode, and automatic index suggestions. Perfect for developers learning MongoDB's aggregation framework.",
      category: "AI/ML",
      technologies: [
        "Next.js",
        "MongoDB Atlas",
        "OpenAI",
        "Monaco Editor",
        "Tailwind CSS",
      ],
      repoUrl: "https://github.com/mongodb-developer/get-started-nodejs",
      innovations:
        "Few-shot pipeline generation with automatic $explain integration to surface optimization opportunities.",
      thumbnailUrl: thumbnails[6],
    },
    {
      name: "GreenGrid",
      description:
        "Climate data aggregation platform that collects real-time environmental sensor data and visualizes carbon footprint patterns across cities. Built with MongoDB Atlas for geo-distributed data ingestion and Leaflet for interactive mapping.",
      category: "Climate Tech",
      technologies: [
        "Python",
        "Flask",
        "MongoDB Atlas",
        "Leaflet",
        "Redis",
        "Docker",
      ],
      repoUrl: "https://github.com/mongodb-developer/mongodb-with-fastapi",
      demoUrl: "https://greengrid.streamlit.app",
      innovations:
        "Geospatial aggregation pipeline for real-time environmental zone classification using MongoDB 2dsphere indexes.",
      thumbnailUrl: thumbnails[7],
    },
    {
      name: "SkillForge",
      description:
        "AI-powered skills assessment platform that generates personalized coding challenges based on your current ability level. Uses MongoDB Atlas Vector Search to match problems to learning gaps and adapts difficulty in real-time.",
      category: "EdTech",
      technologies: [
        "React",
        "Node.js",
        "MongoDB Atlas Vector Search",
        "Python",
        "WebSockets",
      ],
      repoUrl: "https://github.com/mongodb-developer/search-lab",
      innovations:
        "Adaptive difficulty engine using vector similarity between skill profiles and challenge embeddings.",
      thumbnailUrl: thumbnails[8],
    },
    {
      name: "DocuLens",
      description:
        "Document intelligence platform that uses OCR and LLMs to extract, classify, and index documents into MongoDB. Search through thousands of PDFs, invoices, and contracts with natural language queries powered by Atlas Vector Search.",
      category: "AI/ML",
      technologies: [
        "Python",
        "FastAPI",
        "MongoDB Atlas Vector Search",
        "Tesseract OCR",
        "LangChain",
        "React",
      ],
      repoUrl: "https://github.com/mongodb-developer/GenAI-Showcase",
      innovations:
        "Multi-modal RAG pipeline combining OCR text extraction with vision model descriptions for comprehensive document understanding.",
      thumbnailUrl: thumbnails[9],
    },
  ];

  console.log(
    `🔨 Creating ${additionalProjects.length} additional featured projects...`
  );

  for (let i = 0; i < additionalProjects.length; i++) {
    const p = additionalProjects[i];
    const event = events[i % events.length];
    const team = teams[i % teams.length];

    // Check if project already exists for this team+event combo
    const exists = await ProjectModel.findOne({
      teamId: team._id,
      eventId: event._id,
      name: p.name,
    });

    if (exists) {
      console.log(`   ⏭️  "${p.name}" already exists, skipping`);
      continue;
    }

    // We need to avoid the unique index on teamId+eventId, so use a
    // workaround: only create if there's no project for this combo yet,
    // otherwise skip and log.
    const existingForCombo = await ProjectModel.findOne({
      teamId: team._id,
      eventId: event._id,
    });

    if (existingForCombo) {
      // Update the existing project to be featured instead
      await ProjectModel.findByIdAndUpdate(existingForCombo._id, {
        featured: true,
        thumbnailUrl: p.thumbnailUrl,
      });
      console.log(
        `   ⭐ "${existingForCombo.name}" (team already has project) — marked as featured`
      );
      continue;
    }

    await ProjectModel.create({
      ...p,
      eventId: event._id,
      teamId: team._id,
      teamMembers: team.members || [],
      status: "judged",
      featured: true,
      submissionDate: new Date(),
      submittedAt: new Date(),
    });
    console.log(`   ✅ Created "${p.name}"`);
  }

  // Summary
  const featuredCount = await ProjectModel.countDocuments({ featured: true });
  console.log(`\n🎉 Done! ${featuredCount} total featured projects in gallery.`);
  console.log("🌐 Visit /gallery to see them.\n");

  process.exit(0);
}

seedFeatured().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
