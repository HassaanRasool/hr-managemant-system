import { NextRequest, NextResponse } from "next/server"
import { query, execute } from "@/lib/db"
import { RefreshToken } from "@/types/db"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token required" },
        { status: 400 }
      )
    }

    // Verify refresh token signature and expiration
    let decoded: { userId: string }
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string }
    } catch {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      )
    }

    // Check if refresh token exists in database
    const tokens = await query<(RefreshToken & {
      user_id: string;
      user_email: string;
      user_name: string;
      user_createdAt: Date;
      user_updatedAt: Date;
    })[]>(
      `SELECT r.*, u.id as user_id, u.email as user_email, u.name as user_name, u.createdAt as user_createdAt, u.updatedAt as user_updatedAt 
       FROM refresh_tokens r 
       JOIN users u ON r.userId = u.id 
       WHERE r.token = ?`,
      [refreshToken]
    )
    const tokenRecord = tokens[0]

    if (!tokenRecord || new Date(tokenRecord.expiresAt) < new Date()) {
      // Clean up expired token if it exists
      if (tokenRecord) {
        await execute("DELETE FROM refresh_tokens WHERE id = ?", [tokenRecord.id])
      }
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      )
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    )

    // Implement token rotation for better security
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    )

    // Update the refresh token in database
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await execute(
      "UPDATE refresh_tokens SET token = ?, expiresAt = ? WHERE id = ?",
      [newRefreshToken, newExpiresAt, tokenRecord.id]
    )

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken, // Return new refresh token
        user: {
          id: tokenRecord.user_id,
          email: tokenRecord.user_email,
          name: tokenRecord.user_name,
          createdAt: tokenRecord.user_createdAt,
          updatedAt: tokenRecord.user_updatedAt,
        },
      },
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    )
  }
}