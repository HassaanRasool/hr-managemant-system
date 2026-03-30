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
      updates.push(`${key} = ?`)
      values.push(value as string | number | boolean | Date | null)
    }
    
    if (updates.length > 0) {
      values.push(id)
      await execute(`UPDATE TrainingSession SET ${updates.join(', ')} WHERE id = ?`, values)
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error updating training:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    await execute("DELETE FROM TrainingSession WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting training:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
