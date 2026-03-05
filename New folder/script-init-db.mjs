import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch (e) {}

async function init() {
  try {
    console.log("Connecting to MySQL server...");
    // Connect without a database name to create it first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: Number(process.env.DB_PORT) || 3306,
      multipleStatements: true, // Allows running multiple statements from the SQL file if any exist together
    });

    const dbName = process.env.DB_NAME || "hr_management";
    console.log(`Creating database ${dbName} if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

    console.log(`Using database ${dbName}...`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log("Reading init.sql...");
    const initSql = fs.readFileSync(
      path.join(process.cwd(), "init.sql"),
      "utf8",
    );

    // We can execute multiple statements at once if multipleStatements is true
    console.log("Executing init.sql constraints and tables...");
    await connection.query(initSql);

    console.log("\n✅ Database initialized successfully!");
    await connection.end();
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  }
}

init();
