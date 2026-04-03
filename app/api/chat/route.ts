import { NextRequest, NextResponse } from "next/server"
import { query, execute } from "@/lib/db"
import jwt from "jsonwebtoken"
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token || token === "null" || token === "undefined") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user_id = decoded.userId;
    
    const messages = await query(`
      SELECT cm.*, u.name as sender_name, u.email as sender_email,
             (SELECT name FROM Team WHERE id = cm.target_id) as target_team_name,
             (SELECT name FROM users WHERE id = cm.target_id) as target_user_name
      FROM ChatMessage cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.target_type = 'all'
         OR (cm.target_type = 'individual' AND cm.target_id = ?)
         OR (cm.target_type = 'team' AND cm.target_id IN (
             SELECT team_id FROM TeamMember WHERE user_id = ?
         ))
      ORDER BY cm.created_at DESC
    `, [user_id, user_id])

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token || token === "null" || token === "undefined") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const sender_id = decoded.userId;

    const users = await query<{role: string}[]>('SELECT role FROM users WHERE id = ?', [sender_id]);
    const role = users[0]?.role;
    if (role !== 'admin' && role !== 'hr_manager') {
        return NextResponse.json({ error: "Forbidden: Only Admin and HR can send messages" }, { status: 403 })
    }

    const body = await request.json()
    const { content, target_type, target_id } = body;
    
    if (!content || !target_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = crypto.randomUUID();
    await execute(
      'INSERT INTO ChatMessage (id, sender_id, content, target_type, target_id) VALUES (?, ?, ?, ?, ?)',
      [id, sender_id, content, target_type, target_id || null]
    );

    const [message] = await query(`
      SELECT cm.*, u.name as sender_name, u.email as sender_email,
             (SELECT name FROM Team WHERE id = cm.target_id) as target_team_name,
             (SELECT name FROM users WHERE id = cm.target_id) as target_user_name
      FROM ChatMessage cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.id = ?
    `, [id])

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending chat message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
