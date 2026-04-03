import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import crypto from 'crypto';

import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';

async function checkAdminOrHR(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  if (!token || token === "null" || token === "undefined") return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const users = await query<{role: string}[]>('SELECT role FROM users WHERE id = ?', [decoded.userId]);
    const role = users[0]?.role;
    return role === 'admin' || role === 'hr_manager';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const members = await query(`
      SELECT tm.id as membership_id, tm.team_id, tm.role as team_role, tm.created_at,
             u.id as user_id, u.name, u.email, u.role as user_role
      FROM TeamMember tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?
      ORDER BY tm.created_at DESC
    `, [id]);
    
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdminOrHR(request)) {
    return NextResponse.json({ error: "Forbidden: Only Admin and HR can manage team members" }, { status: 403 })
  }

  try {
    const { id: team_id } = await params;
    const { user_id, role = 'Member' } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }
    
    const membership_id = crypto.randomUUID();
    await execute(
      'INSERT INTO TeamMember (id, team_id, user_id, role) VALUES (?, ?, ?, ?)',
      [membership_id, team_id, user_id, role]
    );
    
    const [newMember] = await query(`
      SELECT tm.id as membership_id, tm.team_id, tm.role as team_role, tm.created_at,
             u.id as user_id, u.name, u.email, u.role as user_role
      FROM TeamMember tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.id = ?
    `, [membership_id]);
    
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'User is already a member of this team' }, { status: 409 });
    }
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdminOrHR(request)) {
    return NextResponse.json({ error: "Forbidden: Only Admin and HR can manage team members" }, { status: 403 })
  }

  try {
    const { id: team_id } = await params;
    const { user_id, role } = await request.json();
    
    if (!user_id || !role) {
      return NextResponse.json({ error: 'user_id and role are required' }, { status: 400 });
    }
    
    await execute('UPDATE TeamMember SET role = ? WHERE team_id = ? AND user_id = ?', [role, team_id, user_id]);
    
    return NextResponse.json({ message: 'Team member role updated' });
  } catch (error) {
    console.error('Error updating team member role:', error);
    return NextResponse.json({ error: 'Failed to update team member role' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdminOrHR(request)) {
    return NextResponse.json({ error: "Forbidden: Only Admin and HR can manage team members" }, { status: 403 })
  }

  try {
    const { id: team_id } = await params;
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id query param is required' }, { status: 400 });
    }
    
    await execute('DELETE FROM TeamMember WHERE team_id = ? AND user_id = ?', [team_id, user_id]);
    
    return NextResponse.json({ message: 'Team member removed' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
}
