#!/usr/bin/env node

/**
 * Script to check and set admin role for your account
 * This solves the "admin sees no applications" issue
 */

import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL || 
  "mysql://3ZrrJMbxK9yUuwj.root:M4iGBMvS4k4cEJANC546@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/SKaMVdMNraqB5VhX78BegA";

async function setAdminRole() {
  console.log("🔑 AmeriLend Admin Role Configuration\n");

  try {
    console.log("Step 1: Connecting to database...");
    const connection = await mysql.createConnection(DATABASE_URL + "?ssl={\"rejectUnauthorized\":true}");
    console.log("✅ Connected\n");

    // Get all users
    console.log("Step 2: Checking users in database...");
    const query = "SELECT id, email, openId, role FROM users ORDER BY createdAt DESC LIMIT 10";
    const [users] = await connection.query(query);
    
    if (users.length === 0) {
      console.log("❌ No users found. Please sign up first at http://localhost:3001\n");
      await connection.end();
      return;
    }

    console.log(`Found ${users.length} users:\n`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. Email: ${user.email}`);
      console.log(`   OpenID: ${user.openId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}\n`);
    });

    // Get the most recent user (probably your account)
    const yourUser = users[0];
    console.log("🎯 Most recent user (likely yours):");
    console.log(`   Email: ${yourUser.email}`);
    console.log(`   OpenID: ${yourUser.openId}`);
    console.log(`   Role: ${yourUser.role}\n`);

    // Set admin role if not already
    if (yourUser.role !== 'admin') {
      console.log("Step 3: Setting admin role...");
      const updateQuery = "UPDATE users SET role = 'admin' WHERE id = ?";
      const [result] = await connection.query(updateQuery, [yourUser.id]);
      console.log("✅ Admin role set!\n");
    } else {
      console.log("✅ Already admin\n");
    }

    // Update .env with correct OWNER_OPEN_ID
    console.log("Step 4: .env file needs updating:");
    console.log(`   Add or update this line in your .env:\n`);
    console.log(`   OWNER_OPEN_ID=${yourUser.openId}\n`);

    console.log("📋 Next steps:\n");
    console.log("1. Update OWNER_OPEN_ID in .env file:");
    console.log(`   OWNER_OPEN_ID=${yourUser.openId}\n`);
    console.log("2. Restart the server:");
    console.log("   npm run dev\n");
    console.log("3. Refresh the browser and go to /admin\n");
    console.log("4. You should now see all applications!\n");

    await connection.end();

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

setAdminRole();
