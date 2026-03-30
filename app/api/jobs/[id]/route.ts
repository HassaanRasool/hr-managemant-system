import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

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
    const values: any[] = []
    
    for (const [key, value] of Object.entries(body)) {
      updates.push(`${key} = ?`)
      values.push(value)
    }
    
    if (updates.length > 0) {
      values.push(id)
      await execute(`UPDATE JobPosting SET ${updates.join(', ')} WHERE id = ?`, values)
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error updating job:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
