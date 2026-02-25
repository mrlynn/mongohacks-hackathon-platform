#!/usr/bin/env tsx

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually since dotenv isn't installed
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env.local not found, rely on existing env
}

import { connectToDatabase } from "../src/lib/db/connection";
import { seedBuiltInTemplates } from "../src/lib/db/seed-templates";

async function run() {
  await connectToDatabase();
  const count = await seedBuiltInTemplates();
  console.log(`✅ Seeded ${count} built-in templates`);
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Error seeding templates:", e);
  process.exit(1);
});
