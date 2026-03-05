/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { EmployeeStatus, Employee } from '@/types/db'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as EmployeeStatus | null
    const department = searchParams.get('department')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const conditions: string[] = []
    const params: any[] = []
    
    if (status) {
      conditions.push('status = ?')
      params.push(status)
    }
    
    if (department) {
      conditions.push('department = ?')
      params.push(department)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    const countSql = `SELECT COUNT(*) as total FROM Employee ${whereClause}`
    const rowsSql = `SELECT * FROM Employee ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    
    const countParams = [...params]
    const rowsParams = [...params, limit, (page - 1) * limit]
    
    const [countResult, employees] = await Promise.all([
      query<{total: number}[]>(countSql, countParams),
      query<Employee[]>(rowsSql, rowsParams)
    ])
    
    const total = Number(countResult[0].total)

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    console.error('Error fetching employees:', err)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employee_id,
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      manager,
      start_date,
      basic_salary
    } = body

    if (!employee_id || !first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()
    await execute(
      `INSERT INTO Employee (id, employee_id, first_name, last_name, email, phone, position, department, manager, start_date, basic_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, employee_id, first_name, last_name, email, phone, position, department, manager, new Date(start_date), parseFloat(basic_salary), 'Active']
    )
    
    const newEmployeeRows = await query<Employee[]>('SELECT * FROM Employee WHERE id = ?', [id])
    const employee = newEmployeeRows[0]

    return NextResponse.json(employee, { status: 201 })
  } catch (err) {
    console.error('Error creating employee:', err)
    if (err instanceof Error && 'code' in err && (err as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Employee ID or email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}