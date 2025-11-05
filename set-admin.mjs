#!/usr/bin/env node

/**
 * Direct solution: Set the user with email dianasmith6525@gmail.com as admin
 * This bypasses the OWNER_OPEN_ID check by directly modifying the database
 */

import mysql from "mysql2/promise";

async function setUserAsAdmin() {
  console.log("🔑 Setting Admin Access...\n");

  const config = {
    host: "gateway02.us-east-1.prod.aws.tidbcloud.com",
    port: 4000,
    user: "3ZrrJMbxK9yUuwj.root",
    password: "M4iGBMvS4k4cEJANC546",
    database: "SKaMVdMNraqB5VhX78BegA",
    ssl: {
      rejectUnauthorized: true,
    },
  };

  let connection;
  try {
    console.log("Step 1: Connecting to database...");
    connection = await mysql.createConnection(config);
    console.log("✅ Connected\n");

    console.log("Step 2: Finding your account...");
    const query = "SELECT id, email, openId, role FROM users WHERE email = ? LIMIT 1";
    const [results] = await connection.query(query, ["dianasmith6525@gmail.com"]);

    if (results.length === 0) {
      console.log("❌ User not found. Did you sign up yet?");
      console.log("   Go to http://localhost:3001 and sign up first\n");
      await connection.end();
      return;
    }

    const user = results[0];
    console.log(`✅ Found your account:\n`);
    console.log(`   Email: ${user.email}`);
    console.log(`   OpenID: ${user.openId}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   User ID: ${user.id}\n`);

    if (user.role === "admin") {
      console.log("✅ You're already admin!\n");
      await connection.end();
      return;
    }

    console.log("Step 3: Setting admin role...");
    const updateQuery = "UPDATE users SET role = 'admin' WHERE email = ?";
    const [updateResult] = await connection.query(updateQuery, ["dianasmith6525@gmail.com"]);

    if (updateResult.affectedRows > 0) {
      console.log("✅ Admin role set!\n");
    } else {
      console.log("⚠️  No rows updated\n");
      await connection.end();
      return;
    }

    console.log("Step 4: Verifying...");
    const [verifyResults] = await connection.query(query, ["dianasmith6525@gmail.com"]);
    const updatedUser = verifyResults[0];
    console.log(`✅ New Role: ${updatedUser.role}\n`);

    console.log("🎉 Success!\n");
    console.log("Next steps:");
    console.log("1. Refresh your browser: F5");
    console.log("2. Go to: http://localhost:3001/admin");
    console.log("3. You should now see all applications!\n");

    await connection.end();

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === "ER_ACCESS_DENIED_FOR_USER") {
      console.error("Database credentials error - connection failed");
    }
  }
}

setUserAsAdmin();
