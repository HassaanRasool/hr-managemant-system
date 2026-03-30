import { NextRequest, NextResponse } from "next/server"
import { query, execute } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    interface DBUser {
      id: string;
      email: string;
      password?: string;
      name?: string;
      role?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }

    const users = await query<DBUser[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )
    let finalUser = users[0]

    // Check if it's a demo account and needs lazy-seeding
    const { DEMO_ACCOUNTS } = await import("@/lib/demo-data");
    const demoAccount = DEMO_ACCOUNTS.find(a => a.email === email);

    if (!finalUser && demoAccount && password === demoAccount.password) {
      console.log(`Lazy-seeding demo account: ${email}`);
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();
      
      try {
        // Auto-provision demo user using query
        await query(
          "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)",
          [userId, email, hashedPassword, demoAccount.name, demoAccount.role]
        );
        console.log(`Successfully seeded user: ${email}`);

        finalUser = {
          id: userId,
          email: email,
          name: demoAccount.name,
          role: demoAccount.role,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } catch (seedError) {
        const message = seedError instanceof Error ? seedError.message : String(seedError);
        console.error(`Failed to seed user ${email}:`, message);
        throw seedError;
      }
    } else if (!finalUser?.password || !(await bcrypt.compare(password, finalUser.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const accessToken = jwt.sign(
      { userId: finalUser.id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
      { userId: finalUser.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    )

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    
    // Now we can safely insert into refresh_tokens because finalUser exists in the DB
    await execute(
      "INSERT INTO refresh_tokens (id, token, userId, expiresAt) VALUES (?, ?, ?, ?)",
      [crypto.randomUUID(), refreshToken, finalUser.id, expiresAt]
    )

    const isAdminEmail = email === process.env.ADMIN_EMAIL;
    const finalRole = isAdminEmail ? 'admin' : (finalUser.role || 'staff');

    const userResponse = {
      id: finalUser.id,
      email: finalUser.email,
      name: finalUser.name,
      role: finalRole,
      createdAt: finalUser.createdAt,
      updatedAt: finalUser.updatedAt,
    }

    return NextResponse.json({
      user: userResponse,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}