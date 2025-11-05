#!/usr/bin/env node

/**
 * Check what applications exist in the database
 */

import mysql from "mysql2/promise";

async function checkApplications() {
  console.log("📊 Checking Applications in Database\n");

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
    connection = await mysql.createConnection(config);

    // Count all applications
    console.log("Step 1: Counting total applications...");
    const countQuery = "SELECT COUNT(*) as total FROM loanApplications";
    const [countResult] = await connection.query(countQuery);
    const total = countResult[0].total;

    console.log(`✅ Total applications in database: ${total}\n`);

    if (total === 0) {
      console.log("⚠️  No applications found!\n");
      console.log("This means:");
      console.log("1. Applications were never submitted");
      console.log("2. Or they failed to save\n");
      console.log("Next steps:");
      console.log("1. Go to http://localhost:3001/apply");
      console.log("2. Submit an application");
      console.log("3. Check this again\n");
    } else {
      // Get recent applications
      console.log("Step 2: Recent applications...\n");
      const recentQuery = `
        SELECT 
          id, 
          userId, 
          fullName, 
          email,
          requestedAmount,
          status, 
          createdAt 
        FROM loanApplications 
        ORDER BY createdAt DESC 
        LIMIT 10
      `;
      const [recentResult] = await connection.query(recentQuery);

      recentResult.forEach((app, i) => {
        console.log(`${i + 1}. Loan #${app.id}`);
        console.log(`   Name: ${app.fullName}`);
        console.log(`   Email: ${app.email}`);
        console.log(`   Amount: $${(app.requestedAmount / 100).toFixed(2)}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   User ID: ${app.userId}`);
        console.log(`   Created: ${app.createdAt}\n`);
      });

      console.log("✅ These applications should appear in /admin dashboard\n");
    }

    await connection.end();

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkApplications();
