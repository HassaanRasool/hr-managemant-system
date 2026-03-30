import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const updates: string[] = []
    const values: (string | number | boolean | Date | null)[] = []
    
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      // Map frontend camelCase to backend snake_case if necessary
      let dbKey = key;
      if (key === 'leave_type') dbKey = 'leave_type';
      else if (key === 'start_date') dbKey = 'start_date';
      else if (key === 'end_date') dbKey = 'end_date';
      
      updates.push(`${dbKey} = ?`)
      values.push(value as string | number | boolean | Date | null)
    }
    
    if (updates.length > 0) {
      values.push(id)
      await execute(`UPDATE LeaveRequest SET ${updates.join(', ')} WHERE id = ?`, values)
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error updating leave:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
