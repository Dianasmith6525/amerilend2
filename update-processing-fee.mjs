#!/usr/bin/env node

/**
 * Update Processing Fee to 7.95%
 * 
 * This script updates the processing fee configuration to 7.95% of any loan amount applied.
 * 7.95% = 795 basis points (since 100 basis points = 1%)
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("❌ DATABASE_URL not set in .env file");
  process.exit(1);
}

// Parse connection string
const url = new URL(DB_URL);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  port: url.port || 3306,
  ssl: {}, // TiDB Cloud requires SSL
  enableKeepAlive: true,
};

async function updateProcessingFee() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    console.log("📝 Updating processing fee configuration...\n");
    
    // Update to 7.95% (795 basis points)
    const percentageRate = 795; // 7.95%
    
    // First, deactivate all existing configurations
    await connection.execute(
      "UPDATE feeConfiguration SET isActive = 0"
    );
    
    // Insert new configuration
    const [result] = await connection.execute(
      `INSERT INTO feeConfiguration (
        calculationMode,
        percentageRate,
        fixedFeeAmount,
        isActive,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      ["percentage", percentageRate, 575, 1]
    );
    
    console.log("✅ Processing fee updated successfully!");
    console.log(`\n📊 New Configuration:`);
    console.log(`   • Mode: Percentage-based`);
    console.log(`   • Rate: ${(percentageRate / 100).toFixed(2)}% (${percentageRate} basis points)`);
    console.log(`   • Calculation: amount × ${(percentageRate / 10000).toFixed(4)}`);
    console.log(`\n💡 Example calculations:`);
    console.log(`   • $1,000 loan → $${((1000 * percentageRate) / 10000).toFixed(2)} processing fee`);
    console.log(`   • $5,000 loan → $${((5000 * percentageRate) / 10000).toFixed(2)} processing fee`);
    console.log(`   • $10,000 loan → $${((10000 * percentageRate) / 10000).toFixed(2)} processing fee`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating processing fee:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateProcessingFee();
