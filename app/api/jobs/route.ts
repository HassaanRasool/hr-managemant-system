import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DBJob {
  id: string; title: string; department: string; location: string; type: string;
  status: string; level: string; applicants: number; posted: string; salaryMin: number;
  salaryMax: number; currency: string; applicationDeadline: string; contactEmail: string;
}

export async function GET() {
  try {
    const jobs = await query(`SELECT * FROM JobPosting ORDER BY posted DESC`);
    
    const mappedJobs = (jobs as DBJob[]).map(j => ({
      id: j.id,
      title: j.title,
      department: j.department,
      location: j.location,
      type: j.type,
      status: j.status,
      level: j.level,
      applicants: j.applicants || 0, // Need to join with Application count
      posted: j.posted,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      currency: j.currency,
      applicationDeadline: j.applicationDeadline,
      contactEmail: j.contactEmail
    }));

    return NextResponse.json(mappedJobs);
  } catch (err) {
    console.error('Error fetching jobs:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, department, location, type, status, level, salaryMin, salaryMax, requirements, benefits, responsibilities, applicationDeadline, contactEmail } = body
    
    await execute(
      "INSERT INTO JobPosting (id, title, department, location, type, status, level, salaryMin, salaryMax, requirements, benefits, responsibilities, applicationDeadline, contactEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id, title, department, location, type, status || 'Active', level, 
        salaryMin || 0, salaryMax || 0, 
        JSON.stringify(requirements || []), 
        JSON.stringify(benefits || []), 
        JSON.stringify(responsibilities || []), 
        new Date(applicationDeadline || Date.now()), 
        contactEmail || 'hr@company.com'
      ]
    )
    
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Error creating job:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
