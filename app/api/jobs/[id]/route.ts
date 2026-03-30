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
      updates.push(`${dbKey(key)} = ?`)
      values.push(value as string | number | boolean | Date | null)
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

function dbKey(key: string): string {
  // Add mapping if needed, otherwise returns key.
  return key;
}
