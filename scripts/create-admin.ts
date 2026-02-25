/**
 * Script to create an admin user
 * Usage: npx tsx scripts/create-admin.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

async function createAdmin() {
  try {
    // Load environment variables
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not found in environment");
      process.exit(1);
    }

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Get admin details
    console.log("Creating Admin User");
    console.log("==================\n");

    const name = await rl.question("Admin Name: ");
    const email = await rl.question("Admin Email: ");
    const password = await rl.question("Admin Password: ");

    if (!name || !email || !password) {
      console.error("\n❌ All fields are required");
      process.exit(1);
    }

    // Check if user already exists
    const UserModel = mongoose.model(
      "User",
      new mongoose.Schema({
        email: String,
        name: String,
        passwordHash: String,
        role: String,
      })
    );

    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      console.log("\n⚠️  User with this email already exists");
      const updateRole = await rl.question(
        "Update their role to admin? (y/n): "
      );

      if (updateRole.toLowerCase() === "y") {
        await UserModel.findByIdAndUpdate(existingUser._id, {
          role: "admin",
        });
        console.log("✅ User role updated to admin");
      }
    } else {
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create admin user
      const admin = new UserModel({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "admin",
      });

      await admin.save();

      console.log("\n✅ Admin user created successfully!");
      console.log("\nLogin Credentials:");
      console.log(`Email: ${email}`);
      console.log(`Password: [hidden]`);
      console.log("\n🔐 Keep these credentials secure!");
    }
  } catch (error) {
    console.error("\n❌ Error creating admin:", error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

createAdmin();
