/**
 * Admin User Setup Script
 * 
 * This script helps you create or upgrade an admin user account.
 * 
 * Usage:
 *   node setup-admin.mjs admin@example.com
 * 
 * Note: You need DATABASE_URL in your .env file
 */

import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL not found in environment variables");
  console.error("Please set DATABASE_URL in your .env or .env.local file");
  process.exit(1);
}

const adminEmail = process.argv[2];

if (!adminEmail || !adminEmail.includes("@")) {
  console.error("❌ ERROR: Please provide a valid email address");
  console.error("Usage: node setup-admin.mjs admin@example.com");
  process.exit(1);
}

async function setupAdmin() {
  try {
    const db = drizzle(DATABASE_URL);

    console.log(`\n📧 Looking up user: ${adminEmail}`);

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingUser.length === 0) {
      console.error(`\n❌ User not found: ${adminEmail}`);
      console.error("Please sign up first at: http://localhost:5173/signup");
      console.error("Then run this script again to make them admin.");
      process.exit(1);
    }

    const user = existingUser[0];
    console.log(`✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);

    if (user.role === "admin") {
      console.log(`\n✅ User is already an admin!`);
      process.exit(0);
    }

    // Upgrade to admin
    console.log(`\n🔄 Upgrading user to admin role...`);

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, user.id));

    // Verify the update
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (updatedUser[0]?.role === "admin") {
      console.log(`\n✅ SUCCESS! User is now an admin!`);
      console.log(`\n📋 Next Steps:`);
      console.log(`   1. Go to: http://localhost:5173/login`);
      console.log(`   2. Enter email: ${adminEmail}`);
      console.log(`   3. Get the OTP code from your email`);
      console.log(`   4. Enter the code to log in`);
      console.log(`   5. Go to: http://localhost:5173/admin`);
      console.log(`\n✨ You now have admin access!`);
    } else {
      console.error(`\n❌ Failed to upgrade user to admin`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error("\nMake sure:");
    console.error("  1. DATABASE_URL is correct in .env");
    console.error("  2. Database is accessible");
    console.error("  3. User already has an account (sign up first)");
    process.exit(1);
  }
}

setupAdmin();
