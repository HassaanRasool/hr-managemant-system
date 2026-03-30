import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const tables = await query("SHOW TABLES");
    const usersSchema = await query("DESCRIBE users");
    const users = await query("SELECT id, email, name, role FROM users LIMIT 10");
    return NextResponse.json({ success: true, tables, usersSchema, users });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message, stack: err.stack }, { status: 500 });
  }
}
