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
      openPosRes,
      pendingLeaveRes,
      allLeaveRes,
      trainingSessionsRes,
      performanceRes
    ] = await Promise.all([
      query<{count: number}[]>('SELECT COUNT(*) as count FROM Employee WHERE status = ?', ['Active']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM Employee'),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM JobPosting WHERE status = ?', ['Active']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM LeaveRequest WHERE status = ?', ['Pending']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM LeaveRequest'),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM TrainingSession WHERE status = ?', ['Scheduled']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM PerformanceReview')
    ]);

    const totalEmployees = Number(activeEmpRes[0].count);
    const allEmployees = Number(allEmpRes[0].count);
    const activeEmployees = totalEmployees;
    const openPositions = Number(openPosRes[0].count);
    const pendingLeaveRequests = Number(pendingLeaveRes[0].count);
    const allLeaveRequests = Number(allLeaveRes[0].count);
    const trainingSessions = Number(trainingSessionsRes[0].count);

    // Fetch recent activities separately
    const [recentLeaveRequestsRaw, recentEmployees, recentJobPostings, recentAppraisals] = await Promise.all([
      query<any[]>(
        `SELECT l.id, l.created_at, e.first_name, e.last_name, e.department 
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
      ),
      query<any[]>(
        `SELECT p.id, p.created_at, e.first_name, e.last_name, e.department, p.review_type
         FROM PerformanceReview p
         JOIN Employee e ON p.employee_id = e.id
         ORDER BY p.created_at DESC LIMIT 2`
      )
    ]);

    const recentActivities: ActivityItem[] = [
      ...recentLeaveRequestsRaw.map((l) => ({
        id: l.id,
        type: "leave" as const,
        message: `Leave request pending - ${l.first_name} ${l.last_name}`,
        timestamp: l.created_at.toISOString(),
        department: l.department
      })),
      ...recentEmployees.map((e) => ({
        id: e.id,
        type: "employee" as const,
        message: `New employee onboarded - ${e.first_name} ${e.last_name} joined ${e.department}`,
        timestamp: e.created_at.toISOString(),
        department: e.department
      })),
      ...recentJobPostings.map((j) => ({
        id: j.id,
        type: "job_posting" as const,
        message: `New job posting - ${j.title}`,
        timestamp: j.created_at.toISOString(),
        department: j.department
      })),
      ...recentAppraisals.map((p) => ({
        id: p.id,
        type: "performance" as any,
        message: `Performance review completed - ${p.first_name} ${p.last_name}`,
        timestamp: p.created_at.toISOString(),
        department: p.department
      }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

    // Get additional leave request counts
    const [approvedLeaveRes, rejectedLeaveRes] = await Promise.all([
      query<{count: number}[]>('SELECT COUNT(*) as count FROM LeaveRequest WHERE status = ?', ['Approved']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM LeaveRequest WHERE status = ?', ['Rejected'])
    ]);
    const approvedLeaveRequests = Number(approvedLeaveRes[0].count);
    const rejectedLeaveRequests = Number(rejectedLeaveRes[0].count);

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