/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { Employee, LeaveRequest, PerformanceReview } from '@/types/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const [employees, leaveRequests, performanceReviews] = await Promise.all([
      query<Employee[]>("SELECT * FROM Employee WHERE id = ?", [id]),
      query<LeaveRequest[]>("SELECT * FROM LeaveRequest WHERE employee_id = ? ORDER BY created_at DESC LIMIT 10", [id]),
      query<PerformanceReview[]>("SELECT * FROM PerformanceReview WHERE employee_id = ? ORDER BY created_at DESC LIMIT 5", [id])
    ])
    
    if (employees.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }
    
    const employee = {
      ...employees[0],
      leaveRequests,
      performanceReviews
    }

    return NextResponse.json(employee)
  } catch (err) {
    console.error('Error fetching employee:', err)
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const updates: string[] = []
    const values: any[] = []
    
    for (const [key, value] of Object.entries(body)) {
      updates.push(`${key} = ?`)
      values.push(value)
    }
    
    if (updates.length > 0) {
      values.push(id)
      await execute(`UPDATE Employee SET ${updates.join(', ')} WHERE id = ?`, values)
    }
    const employees = await query<Employee[]>("SELECT * FROM Employee WHERE id = ?", [id])
    const employee = employees[0]

    return NextResponse.json(employee)
  } catch (err) {
    console.error('Error updating employee:', err)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    await execute("DELETE FROM Employee WHERE id = ?", [id])

    return NextResponse.json({ message: 'Employee deleted' })
  } catch (err) {
    console.error('Error deleting employee:', err)
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}