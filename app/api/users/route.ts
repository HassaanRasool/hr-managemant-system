import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import jwt from "jsonwebtoken"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token || token === "null" || token === "undefined") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token to ensure user is logged in
    jwt.verify(token, process.env.JWT_SECRET!)
    
    const users = await query('SELECT id, email, name, role FROM users ORDER BY name ASC')

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
