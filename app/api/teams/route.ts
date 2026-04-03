import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { Team } from '@/types/db';
import crypto from 'crypto';

import jwt from "jsonwebtoken"

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teams = await query<Team[]>('SELECT * FROM Team ORDER BY created_at ASC');
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
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
        return NextResponse.json({ error: "Forbidden: Only Admin and HR can create teams" }, { status: 403 })
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }
    
    const id = crypto.randomUUID();
    await execute(
      'INSERT INTO Team (id, name, description) VALUES (?, ?, ?)',
      [id, body.name, body.description || null]
    );
    
    const [team] = await query<Team[]>('SELECT * FROM Team WHERE id = ?', [id]);
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Team name already exists' }, { status: 409 });
    }
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
