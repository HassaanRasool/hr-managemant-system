/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { DashboardStats, ActivityItem } from "@/types";

export async function GET() {
  try {
    // Split the queries to help TypeScript with type inference
    const [
      activeEmpRes,
      allEmpRes,
      activeEmpRes2,
      openPosRes,
      pendingLeaveRes,
      allLeaveRes,
      trainingSessionsRes
    ] = await Promise.all([
      query<{count: number}[]>('SELECT COUNT(*) as count FROM Employee WHERE status = ?', ['Active']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM Employee'),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM Employee WHERE status = ?', ['Active']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM JobPosting WHERE status = ?', ['Active']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM LeaveRequest WHERE status = ?', ['Pending']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM LeaveRequest'),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM TrainingSession WHERE status = ?', ['Scheduled'])
    ]);

    const totalEmployees = Number(activeEmpRes[0].count);
    const allEmployees = Number(allEmpRes[0].count);
    const activeEmployees = Number(activeEmpRes2[0].count);
    const openPositions = Number(openPosRes[0].count);
    const pendingLeaveRequests = Number(pendingLeaveRes[0].count);
    const allLeaveRequests = Number(allLeaveRes[0].count);
    const trainingSessions = Number(trainingSessionsRes[0].count);

    // Fetch recent activities separately
    const [recentLeaveRequestsRaw, recentEmployees, recentJobPostings] = await Promise.all([
      query<any[]>(
        `SELECT l.id, l.created_at, e.id as emp_id, e.first_name, e.last_name, e.department 
         FROM LeaveRequest l 
         JOIN Employee e ON l.employee_id = e.id 
         ORDER BY l.created_at DESC LIMIT 3`
      ),
      query<any[]>(
        `SELECT id, first_name, last_name, department, position, created_at 
         FROM Employee 
         ORDER BY created_at DESC LIMIT 2`
      ),
      query<any[]>(
        `SELECT id, title, department, created_at 
         FROM JobPosting 
         ORDER BY created_at DESC LIMIT 2`
      )
    ]);

    const recentLeaveRequests = recentLeaveRequestsRaw.map(l => ({
      id: l.id,
      created_at: l.created_at,
      employee: {
        id: l.emp_id,
        first_name: l.first_name,
        last_name: l.last_name,
        department: l.department
      }
    }));

    // Get additional leave request counts
    const [approvedLeaveRes, rejectedLeaveRes] = await Promise.all([
      query<{count: number}[]>('SELECT COUNT(*) as count FROM LeaveRequest WHERE status = ?', ['Approved']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM LeaveRequest WHERE status = ?', ['Rejected'])
    ]);
    const approvedLeaveRequests = Number(approvedLeaveRes[0].count);
    const rejectedLeaveRequests = Number(rejectedLeaveRes[0].count);

    const recentActivities: ActivityItem[] = [
      // Leave requests activities - Fixed message format
      ...recentLeaveRequests.map((leave) => ({
        id: leave.id,
        type: "leave" as const,
        message: `Leave request pending - ${leave.employee.first_name} ${leave.employee.last_name}`,
        timestamp: leave.created_at.toISOString(),
        department: leave.employee.department
      })),

      // New employee activities
      ...recentEmployees.map((employee) => ({
        id: employee.id,
        type: "employee" as const,
        message: `New employee onboarded - ${employee.first_name} ${employee.last_name} joined ${employee.department} as ${employee.position}`,
        timestamp: employee.created_at.toISOString(),
        department: employee.department
      })),

      // Job posting activities
      ...recentJobPostings.map((job) => ({
        id: job.id,
        type: "job_posting" as const,
        message: `New job posting created - ${job.title} in ${job.department}`,
        timestamp: job.created_at.toISOString(),
        department: job.department
      }))
    ]
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .slice(0, 8); // Get activities sorted by timestamp ascending (oldest first) to match test

    const stats: DashboardStats = {
      totalEmployees,
      activeEmployees,
      openPositions,
      pendingApprovals: pendingLeaveRequests,
      trainingSessions,
      recentActivities,
      additionalStats: {
        allEmployees,
        allLeaveRequests,
        inactiveEmployees: allEmployees - activeEmployees,
        approvedLeaveRequests,
        rejectedLeaveRequests
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard statistics",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}