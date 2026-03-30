import { NextRequest, NextResponse } from "next/server"
import { query, execute } from "@/lib/db"
import { User } from "@/types/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await query<User[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    )
    const existingUser = existingUsers[0]

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const userId = crypto.randomUUID()
    await execute(
      "INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)",
      [userId, email, hashedPassword, name || null]
    )

    const usersList = await query<User[]>(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    )
    const user = usersList[0]

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    )

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await execute(
      "INSERT INTO refresh_tokens (id, token, userId, expiresAt) VALUES (?, ?, ?, ?)",
      [crypto.randomUUID(), refreshToken, user.id, expiresAt]
    )

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}