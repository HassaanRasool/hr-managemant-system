import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const trainings = await query("SELECT * FROM TrainingSession ORDER BY start_date DESC");
    return NextResponse.json(trainings);
  } catch (err) {
    console.error('Error fetching trainings:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, title, startDate, endDate, location, maxParticipants, cost
    } = body
    
    // Ensure the default TrainingProgram exists to prevent foreign key errors
    const [existingProg] = await query("SELECT id FROM TrainingProgram WHERE id = 'PROG001'");
    if (!existingProg) {
      await execute("INSERT INTO TrainingProgram (id, title, description, category, duration_hours, max_participants, budget_allocated, is_external, status) VALUES ('PROG001', 'General HR Training', 'Default system training program', 'General', 0, 100, 0, 0, 'Active')");
    }
    
    // Fallback exactly to valid JS Dates to prevent SQL 'Invalid Date' errors
    const safeStart = startDate ? new Date(startDate) : new Date();
    const safeEnd = endDate ? new Date(endDate) : new Date(safeStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    await execute(
      "INSERT INTO TrainingSession (id, program_id, title, start_date, end_date, location, max_participants, cost_per_participant, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id, 
        'PROG001', 
        title || 'Untitled Training', 
        safeStart, 
        safeEnd, 
        location || 'Online', 
        parseInt(maxParticipants) || 20, 
        parseFloat(cost) || 0, 
        'Scheduled'
      ]
    )
    
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Error creating training:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
