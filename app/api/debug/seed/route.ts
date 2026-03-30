import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

export const dynamic = 'force-dynamic'

export async function GET() {
  const log: string[] = [];
  
  try {
    await execute("SET FOREIGN_KEY_CHECKS = 0");
    
    // Hardcoded employees to be 100% sure
    const employees = [
      { id: "EMP001", name: "John Doe", position: "HR Manager", dept: "HR", email: "john@comp.com", status: "Active" },
      { id: "EMP002", name: "Jane Smith", position: "Engineer", dept: "IT", email: "jane@comp.com", status: "On_Leave" },
      { id: "EMP003", name: "Mike Johnson", position: "Accountant", dept: "Finance", email: "mike@comp.com", status: "Active" },
      { id: "EMP004", name: "Sarah Wilson", position: "Marketing", dept: "Marketing", email: "sarah@comp.com", status: "Active" },
      { id: "EMP005", name: "David Brown", position: "Sales", dept: "Sales", email: "david@comp.com", status: "Active" }
    ];

    for (const emp of employees) {
      const names = emp.name.split(' ');
      await execute(
        "REPLACE INTO Employee (id, employee_id, first_name, last_name, email, phone, position, department, manager, start_date, basic_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [emp.id, emp.id, names[0], names[1] || '', emp.email, '000-000-0000', emp.position, emp.dept, 'Admin', new Date(), 50000, emp.status]
      );
      log.push(`Seeded ${emp.id}`);
    }

    // performance reviews
    for (const emp of employees) {
       await execute(
        "REPLACE INTO PerformanceReview (id, employee_id, reviewer_id, review_period, review_type, overall_rating, goals, achievements, development_plan, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [`PR-${emp.id}`, emp.id, 'EMP001', '2023 Annual', 'Appraisal', 4, 'Excellent', 'All met', 'Growth', 'Completed']
      );
    }
    log.push("Performance reviews seeded");

    // job postings
    const jobs = [
      { id: 'JOB001', title: 'Senior Frontend' },
      { id: 'JOB002', title: 'HR Manager' },
      { id: 'JOB003', title: 'Accountant' }
    ];
    for (const job of jobs) {
      await execute(
        "REPLACE INTO JobPosting (id, title, department, location, type, status, level, salaryMin, salaryMax, requirements, benefits, responsibilities, applicationDeadline, contactEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [job.id, job.title, 'Engineering', 'Remote', 'Full-time', 'Active', 'Senior', 80000, 120000, '[]', '[]', '[]', new Date(), 'hr@comp.com']
      );
    }
    log.push("Jobs seeded");

    // leave requests
    const leaves = [
      { id: 'LV001', emp: 'EMP002', type: 'Annual' },
      { id: 'LV002', emp: 'EMP003', type: 'Sick' }
    ];
    for (const l of leaves) {
      await execute(
        "REPLACE INTO LeaveRequest (id, employee_id, leave_type, start_date, end_date, days, reason, status, reliever) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [l.id, l.emp, l.type, new Date(), new Date(), 5, 'Vacation', 'Approved', 'System']
      );
    }
    log.push("Leaves seeded");

    await execute("SET FOREIGN_KEY_CHECKS = 1");

    return NextResponse.json({ success: true, log });
  } catch (error) {
    await execute("SET FOREIGN_KEY_CHECKS = 1");
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage, log }, { status: 500 });
  }
}
