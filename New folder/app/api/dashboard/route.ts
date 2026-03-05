import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { LeaveRequest } from '@/types/db'

export async function GET() {
  try {
    const [
      totalRes,
      activeRes,
      openPosRes,
      pendingLeaveRes,
      recentActivities
    ] = await Promise.all([
      query<{count: number}[]>('SELECT COUNT(*) as count FROM Employee'),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM Employee WHERE status = ?', ['Active']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM JobPosting WHERE status = ?', ['Active']),
      query<{count: number}[]>('SELECT COUNT(*) as count FROM LeaveRequest WHERE status = ?', ['Pending']),
      query<(LeaveRequest & { employee_first_name: string, employee_last_name: string, employee_department: string, employee_position: string })[]>(
        `SELECT l.*, 
          e.first_name as employee_first_name, 
          e.last_name as employee_last_name, 
          e.department as employee_department, 
          e.position as employee_position
         FROM LeaveRequest l 
         JOIN Employee e ON l.employee_id = e.id 
         ORDER BY l.created_at DESC LIMIT 5`
      )
    ])

    const formattedActivities = recentActivities.map(activity => ({
      ...activity,
      employee: {
        first_name: activity.employee_first_name,
        last_name: activity.employee_last_name,
        department: activity.employee_department,
        position: activity.employee_position
      }
    }))

    return NextResponse.json({
      stats: {
        totalEmployees: Number(totalRes[0].count),
        activeEmployees: Number(activeRes[0].count),
        openPositions: Number(openPosRes[0].count),
        pendingLeaveRequests: Number(pendingLeaveRes[0].count)
      },
      recentActivities: formattedActivities
    })
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}