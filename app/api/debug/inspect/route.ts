import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const counts: Record<string, number> = {};
    const tables = ['Employee', 'LeaveRequest', 'PerformanceReview', 'JobPosting'];
    for (const table of tables) {
      const results = await query(`SELECT COUNT(*) as count FROM ${table}`);
      counts[table] = Number(results[0].count);
    }
    return NextResponse.json({ success: true, counts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
