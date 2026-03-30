import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const employees = await query(`SELECT * FROM Employee`);
    return NextResponse.json({ success: true, employees });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
