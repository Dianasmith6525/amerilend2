#!/usr/bin/env node

import mysql from "mysql2/promise";

async function checkUsers() {
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

    const query = "SELECT id, email, role, openId FROM users ORDER BY createdAt DESC LIMIT 20";
    const [results] = await connection.query(query);

    console.log("Users in database:\n");
    results.forEach((user, i) => {
      console.log(`${i + 1}. ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });

    await connection.end();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkUsers();
