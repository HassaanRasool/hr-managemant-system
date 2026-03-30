import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const reviews = await query(`
      SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) as employee, e.department 
      FROM PerformanceReview p 
      JOIN Employee e ON p.employee_id = e.id 
      ORDER BY p.created_at DESC
    `);
    
    const mappedReviews = (reviews as Record<string, unknown>[]).map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employee: r.employee,
      department: r.department,
      reviewPeriod: r.review_period,
      reviewType: r.review_type,
      overallRating: [r.overall_rating],
      goals: r.goals,
      achievements: r.achievements,
      developmentPlan: r.development_plan,
      status: r.status,
      score: (r.overall_rating as number) * 20 // map 1-5 to 0-100 logic if needed
    }));

    return NextResponse.json(mappedReviews);
  } catch (err) {
    console.error('Error fetching reviews:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, employee_id, reviewer_id, review_period, review_type, overall_rating, goals, achievements, development_plan, status } = body
    
    let safeReviewerId = reviewer_id || '1';
    const [existingReviewer] = await query("SELECT id FROM Employee WHERE id = ?", [safeReviewerId]);
    
    if (!existingReviewer) {
      const [firstEmp] = await query("SELECT id FROM Employee LIMIT 1");
      safeReviewerId = (firstEmp as { id: string })?.id;
    }

    await execute(
      "INSERT INTO PerformanceReview (id, employee_id, reviewer_id, review_period, review_type, overall_rating, goals, achievements, development_plan, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, employee_id, safeReviewerId, review_period, review_type, overall_rating, goals, achievements, development_plan, status || 'Completed']
    )
    
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Error creating review:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
