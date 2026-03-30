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
    const values: (string | number | boolean)[] = []

    const columnMap: Record<string, string> = {
      reviewerId: 'reviewer_id',
      reviewPeriod: 'review_period',
      reviewType: 'review_type',
      overallRating: 'overall_rating',
      goals: 'goals',
      achievements: 'achievements',
      developmentPlan: 'development_plan',
      status: 'status'
    }

    Object.entries(body).forEach(([key, value]) => {
      const dbCol = columnMap[key] || key
      updates.push(`${dbCol} = ?`)
      if (Array.isArray(value)) {
        values.push(value[0] as string | number | boolean)
      } else {
        values.push(value as string | number | boolean)
      }
    })

    if (updates.length > 0) {
      values.push(id)
      await execute(`UPDATE PerformanceReview SET ${updates.join(', ')} WHERE id = ?`, values)
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error updating performance:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
