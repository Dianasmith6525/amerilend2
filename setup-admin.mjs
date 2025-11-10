import "dotenv/config";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

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

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

async function setupAdmin() {
  try {
    // Validate environment
    if (!DATABASE_URL) {
      console.error("❌ ERROR: DATABASE_URL not found in environment variables");
      console.error("Please set DATABASE_URL in your .env or .env.local file");
      process.exit(1);
    }

    // Get admin email from command line
    const adminEmail = process.argv[2];
    if (!adminEmail || !adminEmail.includes("@")) {
      console.error("❌ ERROR: Please provide a valid email address");
      console.error("Usage: node setup-admin.mjs admin@example.com");
      process.exit(1);
    }

    console.log("Setting up single admin profile...\n");

    // Setup database connection
    const dbUrl = new URL(DATABASE_URL);
    const connection = await mysql.createConnection({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      ssl: { rejectUnauthorized: true },
    });

    const db = drizzle(connection);

    // Delete the quick-login admin if it exists
    console.log("1. Removing duplicate admin account...");
    await connection.execute(
      `DELETE FROM users WHERE email = 'admin@amerilendloan.com'`
    );
    console.log("✅ Removed admin@amerilendloan.com");

    // Ensure dianasmith6525@gmail.com is admin
    console.log("\n2. Ensuring dianasmith6525@gmail.com is admin...");
    await connection.execute(
      `UPDATE users SET role = 'admin' WHERE email = 'dianasmith6525@gmail.com'`
    );
    console.log("✅ Updated dianasmith6525@gmail.com to admin role");

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

      // Create new session token for this admin
      const sessionToken = jwt.sign(
        {
          openId: user.openId,
          name: user.name || 'Admin User',
        },
        JWT_SECRET,
        { expiresIn: '365d' }
      );

      console.log("\n📋 Your New Admin Session Token:");
      console.log(sessionToken);
    } else {
      console.error(`\n❌ Failed to upgrade user to admin`);
      process.exit(1);
    }

    await connection.end();
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
