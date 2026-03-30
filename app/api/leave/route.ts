import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const leaves = await query(`
      SELECT l.*, CONCAT(e.first_name, ' ', e.last_name) as employee 
      FROM LeaveRequest l 
      JOIN Employee e ON l.employee_id = e.id 
      ORDER BY l.created_at DESC
    `);
    
    // Map DB fields to store format if necessary
    const mappedLeaves = (leaves as Record<string, unknown>[]).map(l => ({
      id: l.id,
      employee: l.employee,
      employee_id: l.employee_id,
      type: l.leave_type,
      startDate: l.start_date,
      endDate: l.end_date,
      status: l.status,
      days: l.days,
      reason: l.reason,
      reliever: l.reliever
    }));

    return NextResponse.json(mappedLeaves);
  } catch (err) {
    console.error('Error fetching leaves:', err)
    return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, employee_id, leave_type, start_date, end_date, days, reason, reliever } = body
    
    await execute(
      "INSERT INTO LeaveRequest (id, employee_id, leave_type, start_date, end_date, days, reason, status, reliever) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, employee_id, leave_type, new Date(start_date), new Date(end_date), days, reason, 'Pending', reliever]
    )
    
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Error creating leave:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
