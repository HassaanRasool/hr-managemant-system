import { NextResponse } from 'next/server';
import { query } from "@/lib/db";

export async function GET() {
  try {
    const table = 'Employee';
    const schema = await query(`DESCRIBE ${table}`);
    const indexes = await query(`SHOW INDEX FROM ${table}`);
    return NextResponse.json({ schema, indexes });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
