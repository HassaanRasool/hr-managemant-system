import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function run() {
  const envPath = path.join(process.cwd(), ".env");
  const envContent = fs.readFileSync(envPath, "utf8");
  const env = {};
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });

  const dbConfig = {
    host: env.DB_HOST || "127.0.0.1",
    user: env.DB_USER || "root",
    password: env.DB_PASSWORD || "",
    database: env.DB_NAME || "hr_management",
    port: Number(env.DB_PORT) || 3306,
  };

  console.log("Using config:", { ...dbConfig, password: "***" });

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected!");

    // Insert admin user manually for testing
    const [result] = await connection.execute(
      "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)",
      [
        "admin-test-id",
        "admin@company.com",
        "$2a$10$7vj.C8qXk6Z.C9D7/A.C.e.aH6Zz8E.q6gXF.O.e.W.a.m.i.o.u.",
        "System Admin",
        "admin",
      ],
    );
    console.log("Insert result:", result);

    const [rows] = await connection.execute(
      "SELECT id, email FROM users WHERE email = 'admin@company.com'",
    );
    console.log("Selected user:", rows);

    await connection.end();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

run();
