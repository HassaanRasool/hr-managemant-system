import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// Manually parse .env since we are in a simple node script
const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) env[key.trim()] = value.trim();
});

async function test() {
  const dbConfig = {
    host: env.DB_HOST || "127.0.0.1",
    user: env.DB_USER || "root",
    password: env.DB_PASSWORD || "",
    database: env.DB_NAME || "hr_management",
    port: Number(env.DB_PORT) || 3306,
  };

  console.log("Testing connection with:", { ...dbConfig, password: "***" });

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Successfully connected to the database!");
    const [rows] = await connection.execute("SHOW TABLES");
    console.log("Tables:", rows);

    const [users] = await connection.execute("DESCRIBE users");
    console.log("Users Schema:", users);

    await connection.end();
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

test();
