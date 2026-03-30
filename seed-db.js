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

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connected to database");

    const employees = [
      {
        id: "1",
        employee_id: "EMP001",
        first_name: "John",
        last_name: "Doe",
        email: "john@company.com",
        phone: "1234567890",
        position: "Manager",
        department: "HR",
        manager: "Admin",
        start_date: "2020-01-01",
        basic_salary: 50000,
        status: "Active",
      },
      {
        id: "2",
        employee_id: "EMP002",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@company.com",
        phone: "0987654321",
        position: "Developer",
        department: "Engineering",
        manager: "John Doe",
        start_date: "2021-02-01",
        basic_salary: 60000,
        status: "Active",
      },
    ];

    for (const emp of employees) {
      await connection.execute(
        "INSERT INTO Employee (id, employee_id, first_name, last_name, email, phone, position, department, manager, start_date, basic_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE first_name=VALUES(first_name)",
        [
          emp.id,
          emp.employee_id,
          emp.first_name,
          emp.last_name,
          emp.email,
          emp.phone,
          emp.position,
          emp.department,
          emp.manager,
          new Date(emp.start_date),
          emp.basic_salary,
          emp.status,
        ],
      );
    }
    console.log("Employees seeded");

    // 3. Leave Requests
    const leaves = [
      {
        id: "L1",
        employee_id: "1",
        leave_type: "Annual",
        start_date: "2024-04-01",
        end_date: "2024-04-05",
        days: 5,
        reason: "Vacation",
        status: "Pending",
        reliever: "Jane Smith",
      },
    ];

    for (const leave of leaves) {
      await connection.execute(
        "INSERT INTO LeaveRequest (id, employee_id, leave_type, start_date, end_date, days, reason, status, reliever) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status)",
        [
          leave.id,
          leave.employee_id,
          leave.leave_type,
          new Date(leave.start_date),
          new Date(leave.end_date),
          leave.days,
          leave.reason,
          leave.status,
          leave.reliever,
        ],
      );
    }
    console.log("Leaves seeded");

    await connection.end();
    console.log("Seeding complete");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

run();
