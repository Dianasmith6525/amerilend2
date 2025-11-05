#!/usr/bin/env node

/**
 * Debug script to check if loan applications exist in the database
 * and diagnose why they might not be showing in admin
 */

import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL || 
  "mysql://3ZrrJMbxK9yUuwj.root:M4iGBMvS4k4cEJANC546@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/SKaMVdMNraqB5VhX78BegA";

async function debugDatabase() {
  console.log("🔍 AmeriLend Database Debug Tool\n");

  try {
    // Parse connection string
    console.log("Step 1: Connecting to database...");
    const connection = await mysql.createConnection(DATABASE_URL + "?ssl={\"rejectUnauthorized\":true}");
    console.log("✅ Connected to database\n");

    // Check tables
    console.log("Step 2: Checking tables...");
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    );
    
    const tableNames = tables.map(t => t.TABLE_NAME).join(", ");
    console.log(`✅ Found tables: ${tableNames}\n`);

    // Count applications
    console.log("Step 3: Counting loan applications...");
    try {
      const [apps] = await connection.query("SELECT COUNT(*) as count FROM loanApplications");
      const count = apps[0].count;
      console.log(`✅ Total applications in database: ${count}\n`);

      if (count === 0) {
        console.log("⚠️  No applications found in database!");
        console.log("   This explains why admin sees nothing.\n");
      } else {
        console.log("Step 4: Recent applications...");
        const [recent] = await connection.query(
          "SELECT id, userId, fullName, status, createdAt FROM loanApplications ORDER BY createdAt DESC LIMIT 5"
        );
        
        console.log(`Found ${recent.length} recent applications:\n`);
        recent.forEach((app, i) => {
          console.log(`${i + 1}. Loan #${app.id}`);
          console.log(`   Name: ${app.fullName}`);
          console.log(`   Status: ${app.status}`);
          console.log(`   Created: ${app.createdAt}`);
          console.log(`   User ID: ${app.userId}\n`);
        });
      }
    } catch (err) {
      console.log("⚠️  Table 'loanApplications' does not exist yet");
      console.log("   Run: pnpm run db:push\n");
    }

    // Check users
    console.log("Step 5: Checking users...");
    try {
      const [users] = await connection.query("SELECT COUNT(*) as count FROM users");
      const userCount = users[0].count;
      console.log(`✅ Total users: ${userCount}\n`);

      if (userCount > 0) {
        const [recentUsers] = await connection.query(
          "SELECT id, email, role FROM users ORDER BY createdAt DESC LIMIT 3"
        );
        console.log("Recent users:");
        recentUsers.forEach((user, i) => {
          console.log(`${i + 1}. ${user.email} (${user.role}) - ID: ${user.id}`);
        });
        console.log();
      }
    } catch (err) {
      console.log("⚠️  Could not query users\n");
    }

    // Check database size
    console.log("Step 6: Database statistics...");
    try {
      const [stats] = await connection.query(`
        SELECT 
          TABLE_NAME,
          ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
        FROM information_schema.TABLES
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC
      `);
      
      console.log("Table sizes:");
      stats.forEach(stat => {
        console.log(`  ${stat.TABLE_NAME}: ${stat.size_mb} MB`);
      });
      console.log();
    } catch (err) {
      // Ignore
    }

    await connection.end();

    // Summary
    console.log("📋 Summary:\n");
    console.log("Possible Issues:");
    console.log("1. ❓ No applications submitted yet");
    console.log("   Fix: Go to http://localhost:3001/apply and submit a form\n");
    console.log("2. ❓ Application submitted but not saved to DB");
    console.log("   Fix: Check browser console for errors during submission\n");
    console.log("3. ❓ Application saved but admin can't see it");
    console.log("   Fix: Check if admin user has correct role in database\n");
    console.log("4. ❓ Tables don't exist");
    console.log("   Fix: Run 'pnpm run db:push' to create schema\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\nTroubleshooting:");
    console.error("- Check DATABASE_URL in .env");
    console.error("- Make sure database is accessible");
    console.error("- Verify credentials in connection string");
  }
}

debugDatabase();
